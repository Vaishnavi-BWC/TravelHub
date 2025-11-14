package com.bwc.approval_workflow_service.engine;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.dto.FinanceApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.HRApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.ManagerApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.TravelDeskApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.enums.ApprovalActionType;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.factory.ApprovalServiceFactory;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;
import com.bwc.approval_workflow_service.service.ApprovalService;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WorkflowEngine {

    private final ApprovalServiceFactory factory;

    private final ApprovalWorkflowRepository workflowRepository;
    private final WorkflowConfigurationRepository configRepository;

    public WorkflowEngine(ApprovalServiceFactory factory,
                          ApprovalWorkflowRepository workflowRepository,
                          WorkflowConfigurationRepository configRepository) {
        this.factory = factory;
        this.workflowRepository = workflowRepository;
        this.configRepository = configRepository;
    }

    public <I extends BaseApprovalActionRequestDTO, O extends BaseApprovalActionResponseDTO> O process(I requestDto) {
        try {
            String actorType = resolveActorTypeFromSecurity();
            
            // Validate request before processing
            validateActionRequest(requestDto);
            
            // Enrich request with user details from security context
            enrichRequestWithUserDetails(requestDto);

            log.info("Processing {} action for actor type [{}] on workflow [{}]",
                    requestDto.getActionType(), actorType, requestDto.getWorkflowId());

            ApprovalService<I, O> service = factory.getService(actorType);
            return service.processApproval(requestDto);
            
        } catch (SecurityException e) {
            log.error("Security violation processing request: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid request: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("💥 Unexpected error processing workflow request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process workflow action", e);
        }
    }

    @SuppressWarnings("unchecked")
    public <I extends BaseApprovalActionRequestDTO> I createActionRequest(
            UUID workflowId, 
            ApprovalActionType actionType, 
            BaseApprovalActionRequestDTO existingRequest) {
        
        String actorType = resolveActorTypeFromSecurity();
        
        return (I) switch (actorType.toUpperCase()) {
            case "MANAGER" -> {
                ManagerApprovalActionRequestDTO dto = (existingRequest != null && existingRequest instanceof ManagerApprovalActionRequestDTO) 
                    ? (ManagerApprovalActionRequestDTO) existingRequest 
                    : new ManagerApprovalActionRequestDTO();
                dto.setWorkflowId(workflowId);
                dto.setActionType(actionType);
                yield dto;
            }
            case "FINANCE" -> {
                FinanceApprovalActionRequestDTO dto = (existingRequest != null && existingRequest instanceof FinanceApprovalActionRequestDTO) 
                    ? (FinanceApprovalActionRequestDTO) existingRequest 
                    : new FinanceApprovalActionRequestDTO();
                dto.setWorkflowId(workflowId);
                dto.setActionType(actionType);
                yield dto;
            }
            case "HR" -> {
                HRApprovalActionRequestDTO dto = (existingRequest != null && existingRequest instanceof HRApprovalActionRequestDTO) 
                    ? (HRApprovalActionRequestDTO) existingRequest 
                    : new HRApprovalActionRequestDTO();
                dto.setWorkflowId(workflowId);
                dto.setActionType(actionType);
                yield dto;
            }
            case "TRAVEL_DESK" -> {
                TravelDeskApprovalActionRequestDTO dto = (existingRequest != null && existingRequest instanceof TravelDeskApprovalActionRequestDTO) 
                    ? (TravelDeskApprovalActionRequestDTO) existingRequest 
                    : new TravelDeskApprovalActionRequestDTO();
                dto.setWorkflowId(workflowId);
                dto.setActionType(actionType);
                yield dto;
            }
            default -> throw new IllegalArgumentException("Unsupported actor type: " + actorType);
        };
    }

    private void enrichRequestWithUserDetails(BaseApprovalActionRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof String userId) {
                try {
                    request.setApproverId(UUID.fromString(userId));
                    request.setApproverName(authentication.getName());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid user ID format in security context: {}", userId);
                }
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
                // Handle custom UserDetails implementation
                request.setApproverName(userDetails.getUsername());
                // If your UserDetails has UUID, extract it here
            } else {
                log.warn("Unsupported principal type: {}", principal.getClass().getName());
            }
        }
    }

    private String resolveActorTypeFromSecurity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            throw new SecurityException("No authentication found in SecurityContext");
        }

        return authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", "").toUpperCase())
                .filter(role -> List.of("MANAGER", "FINANCE", "HR", "TRAVEL_DESK", "ADMIN").contains(role))
                .findFirst()
                .orElseThrow(() -> new SecurityException("No valid actor role found in SecurityContext"));
    }

    /**
     * 🔒 Validate action request before processing
     */
    private void validateActionRequest(BaseApprovalActionRequestDTO request) {
        if (request.getWorkflowId() == null) {
            throw new IllegalArgumentException("Workflow ID is required");
        }
        
        if (request.getActionType() == null) {
            throw new IllegalArgumentException("Action type is required");
        }
        
        // Additional validation based on action type
        if (request.getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            if (!request.canRaiseException()) {
                throw new SecurityException("Current role cannot raise exceptions");
            }
        }
    }
    
    
    @Transactional
    public void progressPostTravelStep(UUID workflowId, UUID actorId, String action, String targetStepName) {

        log.info("➡️ POST_TRAVEL progression: workflow {} → {}", workflowId, targetStepName);

        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(workflowId)
                .orElseThrow(() -> new WorkflowException("Workflow not found: " + workflowId));

        // get current active step
        WorkflowStep current = workflow.getSteps().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found"));

        // mark completed
        current.setStatus("COMPLETED");
        current.setCompletedAt(LocalDateTime.now());

        // record actor action
        ActorAction actionLog = ActorAction.builder()
                .step(current)
                .actorId(actorId)
                .actorRole(current.getApproverRole())
                .decision(action)
                .comments("POST_TRAVEL progression")
                .actionTakenAt(LocalDateTime.now())
                .build();
        current.addActorAction(actionLog);

        // find target step
        Optional<WorkflowStep> targetOpt =
                workflow.getSteps().stream()
                        .filter(s -> s.getStepName().equalsIgnoreCase(targetStepName))
                        .findFirst();

        // append POST_TRAVEL steps if not loaded yet
        if (targetOpt.isEmpty()) {
            appendPostTravelSteps(workflow);
            targetOpt = workflow.getSteps().stream()
                    .filter(s -> s.getStepName().equalsIgnoreCase(targetStepName))
                    .findFirst();
        }

        WorkflowStep next = targetOpt.orElseThrow(
                () -> new WorkflowException("POST_TRAVEL step not found: " + targetStepName)
        );

        // activate next step
        next.setStatus("ACTIVE");
        workflow.setCurrentStep(next.getStepName());
        workflow.setCurrentApproverRole(next.getApproverRole());
        workflow.setPreviousStep(current.getStepName());

        workflowRepository.save(workflow);

        log.info("✅ Workflow {} moved to {}", workflowId, next.getStepName());
    }

    @Transactional
    public void appendPostTravelSteps(ApprovalWorkflow workflow) {

        log.info("📌 Appending POST_TRAVEL steps for workflow {}", workflow.getWorkflowId());

        List<WorkflowConfiguration> configs =
                configRepository.findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder("POST_TRAVEL");

        if (configs == null || configs.isEmpty()) {
            throw new WorkflowException("POST_TRAVEL configuration missing in DB");
        }

        int lastOrder = workflow.getSteps().stream()
                .mapToInt(WorkflowStep::getSequenceOrder)
                .max()
                .orElse(0);

        for (WorkflowConfiguration cfg : configs) {
            WorkflowStep step = WorkflowStep.builder()
                    .workflow(workflow)
                    .stepName(cfg.getStepName())
                    .approverRole(cfg.getApproverRole())
                    .sequenceOrder(lastOrder + cfg.getSequenceOrder())
                    .originalWorkflowType("POST_TRAVEL")
                    .status("PENDING")
                    .build();

            workflow.addStep(step);
        }

        log.info("✅ POST_TRAVEL steps appended: {}", workflow.getWorkflowId());
    }

    
    /**
     *  Get current user's actor type
     */
    public String getCurrentActorType() {
        return resolveActorTypeFromSecurity();
    }
}