package com.bwc.approval_workflow_service.service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.HRApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.HRApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.enums.ApprovalActionType;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.service.impl.base.AbstractApprovalService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("hrApprovalService")
public class HRApprovalService
        extends AbstractApprovalService<HRApprovalActionRequestDTO, HRApprovalActionResponseDTO> {

    public HRApprovalService(ApprovalWorkflowRepository workflowRepository,
                             NotificationServiceClient notificationService) {
        super(workflowRepository, notificationService);
    }

    @Override
    protected String getActorRole() {
        return "HR";
    }

    @Override
    protected List<ApprovalActionType> getAllowedActions() {
        return List.of(ApprovalActionType.APPROVE, ApprovalActionType.REJECT, 
                      ApprovalActionType.REQUEST_DOCUMENTATION, ApprovalActionType.RAISE_EXCEPTION);
    }

    @Override
    protected String getExceptionReason(HRApprovalActionRequestDTO request) {
        return request.getExceptionReason();
    }

    @Override
    protected HRApprovalActionResponseDTO handleApproval(
            ApprovalWorkflow workflow,
            HRApprovalActionRequestDTO request,
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

                    message = "HR approved and forwarded to " + nextStep.getApproverRole() + ".";
                    notifyNextStep(workflow, nextStep.getApproverRole());
                } else {
                    workflow.setStatus("COMPLETED");
                    workflow.setCompletedAt(LocalDateTime.now());
                    message = "HR approved and workflow completed.";
                }
            }

            case REJECT -> {
                currentStep.setStatus("REJECTED");
                workflow.setStatus("REJECTED_BY_HR");
                workflow.setCompletedAt(LocalDateTime.now());
                message = "HR rejected the request due to policy violation.";
            }

            case REQUEST_DOCUMENTATION -> {
                workflow.setStatus("DOCUMENTATION_REQUESTED_BY_HR");
                message = "HR requested documentation: " + request.getDocumentationRequest();
            }

            case RAISE_EXCEPTION -> {
                workflow.setStatus("EXCEPTION_RAISED_BY_HR");
                message = "HR raised an exception: " + request.getExceptionReason();
            }

            default -> throw new WorkflowException("Unsupported action type: " + request.getActionType());
        }

        return HRApprovalActionResponseDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .status(workflow.getStatus())
                .nextStep(nextStepName)
                .message(message)
                .policyComplianceChecked(request.getPolicyComplianceChecked())
                .complianceStatus(workflow.getStatus())
                .exceptionDetails(request.getExceptionReason())
                .build();
    }
}