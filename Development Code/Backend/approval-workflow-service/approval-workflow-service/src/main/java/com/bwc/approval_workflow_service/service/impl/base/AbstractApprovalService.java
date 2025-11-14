package com.bwc.approval_workflow_service.service.impl.base;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.dto.HRApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.TravelDeskApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.WorkflowNotificationDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.StepException;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.enums.ApprovalActionType;
import com.bwc.approval_workflow_service.exception.ResourceNotFoundException;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.service.ApprovalService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractApprovalService<I extends BaseApprovalActionRequestDTO, O extends BaseApprovalActionResponseDTO>
        implements ApprovalService<I, O> {

    protected final ApprovalWorkflowRepository workflowRepository;
    protected final NotificationServiceClient notificationService;

    @Override
    @Transactional
    public O processApproval(I request) {
        log.info("🔹 [{}] Processing {} for workflow {}", getActorRole(), request.getActionType(), request.getWorkflowId());

        // 🔒 Pre-validate action permissions
        request.validateActionPermission();

        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(request.getWorkflowId())
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + request.getWorkflowId()));

        validateActor(workflow, request);
        validateActionPermission(request.getActionType());
        
        // 🔒 Role-specific validation for exceptions
        validateExceptionRaising(request);
        
        ActorAction action = recordAction(workflow, request);
        
        // Handle exception raising if applicable
        if (request.getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            handleExceptionRaising(action, request);
        }
        
        O response = handleApproval(workflow, request, action);
        workflowRepository.save(workflow);
        
        // 🔒 Notify about exceptions if raised
        if (request.getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            notifyExceptionRaised(workflow, request);
        }
        
        return response;
    }

    @Override
    public O approve(I request) {
        request.setActionType(ApprovalActionType.APPROVE);
        return processApproval(request);
    }

    @Override
    public O reject(I request) {
        request.setActionType(ApprovalActionType.REJECT);
        return processApproval(request);
    }

    @Override
    public O returnRequest(I request) {
        request.setActionType(ApprovalActionType.RETURN);
        return processApproval(request);
    }

    protected void validateActor(ApprovalWorkflow workflow, I request) {
        WorkflowStep activeStep = workflow.getSteps().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found in workflow."));

        if (!getActorRole().equalsIgnoreCase(activeStep.getApproverRole())) {
            throw new WorkflowException("Only " + getActorRole() + " can act on this step. Current approver: " + activeStep.getApproverRole());
        }
    }

    protected void validateActionPermission(ApprovalActionType actionType) {
        List<ApprovalActionType> allowedActions = getAllowedActions();
        if (!allowedActions.contains(actionType)) {
            throw new WorkflowException(getActorRole() + " cannot perform action: " + actionType);
        }
    }

    protected abstract List<ApprovalActionType> getAllowedActions();

    protected ActorAction recordAction(ApprovalWorkflow workflow, I request) {
        WorkflowStep currentStep = workflow.getSteps().stream()
                .filter(step -> "ACTIVE".equalsIgnoreCase(step.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found for workflow " + workflow.getWorkflowId()));

        ActorAction action = ActorAction.builder()
                .step(currentStep)
                .actorRole(getActorRole())
                .actorId(request.getApproverId())
                .actorName(request.getApproverName())
                .decision(request.getActionType().name())
                .comments(request.getComments())
                .actionTakenAt(LocalDateTime.now())
                .build();

        currentStep.addActorAction(action);
        return action;
    }

    protected void handleExceptionRaising(ActorAction action, I request) {
        String exceptionReason = request.getExceptionReason();
        if (exceptionReason == null || exceptionReason.trim().isEmpty()) {
            throw new WorkflowException("Exception reason is required for RAISE_EXCEPTION action");
        }

        StepException exception = StepException.builder()
                .action(action)
                .reason(exceptionReason)
                .raisedById(request.getApproverId())
                .raisedByName(request.getApproverName())
                .raisedByRole(getActorRole())
                .raisedAt(LocalDateTime.now())
                .build();

        action.addException(exception);
        
        log.warn("🚨 Exception raised by {}: {}", getActorRole(), exceptionReason);
    }

    /**
     * 🔒 Role-specific exception validation
     */
    protected void validateExceptionRaising(I request) {
        if (request.getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            if (!request.canRaiseException()) {
                throw new SecurityException(getActorRole() + " role cannot raise exceptions. Only Travel Desk and HR are allowed.");
            }
            
            // Role-specific validation
            if (request instanceof HRApprovalActionRequestDTO hrRequest) {
                hrRequest.validateHRException();
            } else if (request instanceof TravelDeskApprovalActionRequestDTO travelRequest) {
                travelRequest.validateTravelDeskException(); // This now only requires exceptionReason
            }
        }
    }

    /**
     * 🔒 Notify relevant stakeholders about exceptions
     */
    protected void notifyExceptionRaised(ApprovalWorkflow workflow, I request) {
        try {
            String exceptionReason = request.getExceptionReason();
            String raisedByRole = getActorRole();
            
            WorkflowNotificationDTO dto = WorkflowNotificationDTO.builder()
                    .workflowId(workflow.getWorkflowId())
                    .workflowType(workflow.getWorkflowType())
                    .currentStep("EXCEPTION_RAISED")
                    .nextApproverRole("ADMIN") // Notify admins about exceptions
                    .employeeName(workflow.getEmployeeName())
                    .employeeEmail(workflow.getEmployeeEmail())
                    .timestamp(LocalDateTime.now())
                    .build();
            
            dto.setAdditionalData(Map.of(
                "exceptionReason", exceptionReason,
                "raisedByRole", raisedByRole,
                "workflowStatus", workflow.getStatus(),
                "priority", "HIGH"
            ));

            notificationService.notifyException(dto);
            log.info("📢 Exception notification sent for workflow {}", workflow.getWorkflowId());
            
        } catch (Exception e) {
            log.warn("⚠️ Exception notification failed: {}", e.getMessage(), e);
        }
    }

    protected void notifyNextStep(ApprovalWorkflow workflow, String nextStepRole) {
        try {
            WorkflowNotificationDTO dto = WorkflowNotificationDTO.builder()
                    .workflowId(workflow.getWorkflowId())
                    .workflowType(workflow.getWorkflowType())
                    .currentStep(workflow.getCurrentStep())
                    .nextApproverRole(nextStepRole)
                    .employeeName(workflow.getEmployeeName())
                    .employeeEmail(workflow.getEmployeeEmail())
                    .timestamp(workflow.getUpdatedAt())
                    .build();

            notificationService.notifyNextApprover(dto);
        } catch (Exception e) {
            log.warn("⚠️ Notification failed: {}", e.getMessage(), e);
        }
    }
    
 // Add this method to AbstractApprovalService to handle pre-travel completion
    protected void checkAndTransitionToPostTravel(ApprovalWorkflow workflow) {
        // Check if we just completed the last pre-travel step
        WorkflowStep preTravelCompletedStep = workflow.getSteps().stream()
                .filter(step -> "PRE_TRAVEL_COMPLETED".equals(step.getStepName()))
                .findFirst()
                .orElse(null);
                
        if (preTravelCompletedStep != null && "COMPLETED".equals(preTravelCompletedStep.getStatus())) {
            // This indicates we should transition to post-travel
            // In a real implementation, you might want to call a service method here
            log.info("🔄 Pre-travel completed for workflow {}, ready for post-travel transition", 
                    workflow.getWorkflowId());
        }
    }

    protected abstract String getExceptionReason(I request);
    protected abstract O handleApproval(ApprovalWorkflow workflow, I request, ActorAction action);
    protected abstract String getActorRole();
}