package com.bwc.approval_workflow_service.service.impl.base;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;
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

        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(request.getWorkflowId())
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + request.getWorkflowId()));

        validateActor(workflow, request);
        validateActionPermission(request.getActionType());
        
        ActorAction action = recordAction(workflow, request);
        
        // Handle exception raising if applicable
        if (request.getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            handleExceptionRaising(action, request);
        }
        
        O response = handleApproval(workflow, request, action);
        workflowRepository.save(workflow);
        
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
        String exceptionReason = getExceptionReason(request);
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
    }

    protected abstract String getExceptionReason(I request);

    protected abstract O handleApproval(ApprovalWorkflow workflow, I request, ActorAction action);
    protected abstract String getActorRole();

    protected void notifyNextStep(ApprovalWorkflow workflow, String nextStepRole) {
        try {
            WorkflowNotificationDTO dto = new WorkflowNotificationDTO(
                    workflow.getWorkflowId(),
                    workflow.getWorkflowType(),
                    workflow.getCurrentStep(),
                    nextStepRole,
                    workflow.getEmployeeName(),
                    workflow.getEmployeeEmail(),
                    workflow.getUpdatedAt()
            );

            notificationService.notifyNextApprover(dto);
        } catch (Exception e) {
            log.warn("⚠️ Notification failed: {}", e.getMessage(), e);
        }
    }
}