package com.bwc.approval_workflow_service.service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.ManagerApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.ManagerApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.enums.ApprovalActionType;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.service.impl.base.AbstractApprovalService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("managerApprovalService")
public class ManagerApprovalService
        extends AbstractApprovalService<ManagerApprovalActionRequestDTO, ManagerApprovalActionResponseDTO> {

    public ManagerApprovalService(ApprovalWorkflowRepository workflowRepository,
                                  NotificationServiceClient notificationService) {
        super(workflowRepository, notificationService);
    }

    @Override
    protected String getActorRole() {
        return "MANAGER";
    }

    @Override
    protected List<ApprovalActionType> getAllowedActions() {
        return List.of(ApprovalActionType.APPROVE, ApprovalActionType.REJECT, ApprovalActionType.RETURN);
    }

    // ✅ Add this missing method
    @Override
    protected String getExceptionReason(ManagerApprovalActionRequestDTO request) {
        return null; // Manager cannot raise exceptions
    }

    @Override
    protected ManagerApprovalActionResponseDTO handleApproval(
            ApprovalWorkflow workflow,
            ManagerApprovalActionRequestDTO request,
            ActorAction action) {

        WorkflowStep currentStep = workflow.getSteps().stream()
                .filter(step -> "ACTIVE".equalsIgnoreCase(step.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found for workflow " + workflow.getWorkflowId()));

        String message;
        String nextStepName = null;

        switch (request.getActionType()) {
            case APPROVE -> {
                currentStep.setStatus("COMPLETED");
                currentStep.setCompletedAt(LocalDateTime.now());

                Optional<WorkflowStep> nextStepOpt = workflow.getSteps().stream()
                        .filter(step -> step.getSequenceOrder() > currentStep.getSequenceOrder())
                        .min(Comparator.comparing(WorkflowStep::getSequenceOrder));

                if (nextStepOpt.isPresent()) {
                    WorkflowStep nextStep = nextStepOpt.get();
                    nextStep.setStatus("ACTIVE");
                    workflow.setCurrentStep(nextStep.getStepName());
                    workflow.setCurrentApproverRole(nextStep.getApproverRole());
                    workflow.setPreviousStep(currentStep.getStepName());
                    nextStepName = nextStep.getStepName();

                    message = "Manager approved and forwarded to " + nextStep.getApproverRole() + ".";
                    notifyNextStep(workflow, nextStep.getApproverRole());
                } else {
                    workflow.setStatus("COMPLETED");
                    workflow.setCompletedAt(LocalDateTime.now());
                    message = "Manager approved and workflow completed.";
                }
            }

            case REJECT -> {
                currentStep.setStatus("REJECTED");
                workflow.setStatus("REJECTED_BY_MANAGER");
                workflow.setCompletedAt(LocalDateTime.now());
                message = "Manager rejected the request.";
            }

            case RETURN -> {
                currentStep.setStatus("RETURNED");
                workflow.setStatus("RETURNED_BY_MANAGER");
                workflow.setCurrentStep("SUBMITTED");
                workflow.setCurrentApproverRole("EMPLOYEE");
                message = "Manager returned the request for correction.";
            }

            default -> throw new WorkflowException("Unsupported action type: " + request.getActionType());
        }

        return ManagerApprovalActionResponseDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .status(workflow.getStatus())
                .nextStep(nextStepName)
                .message(message)
                .returnReason(request.getReturnReason())
                .build();
    }
}