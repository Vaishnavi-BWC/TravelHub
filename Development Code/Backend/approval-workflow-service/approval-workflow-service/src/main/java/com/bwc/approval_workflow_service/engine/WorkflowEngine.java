package com.bwc.approval_workflow_service.engine;

import java.util.List;
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
import com.bwc.approval_workflow_service.enums.ApprovalActionType;
import com.bwc.approval_workflow_service.factory.ApprovalServiceFactory;
import com.bwc.approval_workflow_service.service.ApprovalService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WorkflowEngine {

    private final ApprovalServiceFactory factory;

    public WorkflowEngine(ApprovalServiceFactory factory) {
        this.factory = factory;
    }

    public <I extends BaseApprovalActionRequestDTO, O extends BaseApprovalActionResponseDTO> O process(I requestDto) {
        String actorType = resolveActorTypeFromSecurity();
        
        // Enrich request with user details from security context
        enrichRequestWithUserDetails(requestDto);

        log.info("🔹 Processing {} action for actor type [{}] on workflow [{}]",
                requestDto.getActionType(), actorType, requestDto.getWorkflowId());

        ApprovalService<I, O> service = factory.getService(actorType);
        return service.processApproval(requestDto);
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
        
        if (authentication != null && authentication.getPrincipal() instanceof String userId) {
            try {
                request.setApproverId(UUID.fromString(userId));
                request.setApproverName(authentication.getName());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid user ID format in security context: {}", userId);
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
}