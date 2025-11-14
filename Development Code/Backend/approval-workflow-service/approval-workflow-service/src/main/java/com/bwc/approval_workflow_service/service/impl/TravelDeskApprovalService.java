package com.bwc.approval_workflow_service.service.impl;

import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.TravelDeskApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.TravelDeskApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.enums.ApprovalActionType;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.service.impl.base.AbstractApprovalService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service("travel_deskApprovalService")
public class TravelDeskApprovalService
        extends AbstractApprovalService<TravelDeskApprovalActionRequestDTO, TravelDeskApprovalActionResponseDTO> {

    public TravelDeskApprovalService(ApprovalWorkflowRepository workflowRepository,
                                     NotificationServiceClient notificationService) {
        super(workflowRepository, notificationService);
    }

    @Override
    protected String getActorRole() {
        return "TRAVEL_DESK";
    }

    @Override
    protected List<ApprovalActionType> getAllowedActions() {
        return List.of(ApprovalActionType.APPROVE, ApprovalActionType.REJECT, 
                      ApprovalActionType.SUGGEST_ALTERNATIVE, ApprovalActionType.RAISE_EXCEPTION);
    }

    @Override
    protected String getExceptionReason(TravelDeskApprovalActionRequestDTO request) {
        return request.getExceptionReason();
    }

    @Override
    protected TravelDeskApprovalActionResponseDTO handleApproval(
            ApprovalWorkflow workflow,
            TravelDeskApprovalActionRequestDTO request,
            ActorAction action) {

        WorkflowStep currentStep = workflow.getSteps().stream()
                .filter(step -> "ACTIVE".equalsIgnoreCase(step.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found for workflow " + workflow.getWorkflowId()));

        String message;
        String nextStepName = null;
        boolean exceptionRaised = false;

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

                    message = "Travel Desk approved and forwarded to " + nextStep.getApproverRole() + ".";
                    notifyNextStep(workflow, nextStep.getApproverRole());
                } else {
                    workflow.setStatus("COMPLETED");
                    workflow.setCompletedAt(LocalDateTime.now());
                    message = "Travel Desk approved and workflow completed.";
                }
            }

            case REJECT -> {
                currentStep.setStatus("REJECTED");
                workflow.setStatus("REJECTED_BY_TRAVEL_DESK");
                workflow.setCompletedAt(LocalDateTime.now());
                message = "Travel Desk rejected due to booking unavailability.";
            }

            case SUGGEST_ALTERNATIVE -> {
                workflow.setStatus("ALTERNATIVE_SUGGESTED_BY_TRAVEL_DESK");
                message = "Travel Desk suggested alternatives: " + request.getAlternativeSuggestions();
            }

            case RAISE_EXCEPTION -> {
                // Complete current step and move to next step
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

                    message = "Travel Desk raised exception and forwarded to " + nextStep.getApproverRole() + ".";
                    notifyNextStep(workflow, nextStep.getApproverRole());
                } else {
                    workflow.setStatus("COMPLETED");
                    workflow.setCompletedAt(LocalDateTime.now());
                    message = "Travel Desk raised exception and workflow completed.";
                }

                exceptionRaised = true;
                log.warn("🚨 Travel Desk Operational Exception: {}", request.getExceptionReason());
            }

            default -> throw new WorkflowException("Unsupported action type: " + request.getActionType());
        }

        return TravelDeskApprovalActionResponseDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .status(workflow.getStatus())
                .nextStep(nextStepName)
                .message(message)
                .bookingReference(request.getBookingReference())
                .travelArrangementsConfirmed(request.getTravelArrangementsConfirmed())
                .alternativeDetails(request.getAlternativeSuggestions())
                .exceptionDetails(request.getExceptionReason())
                .exceptionRaised(exceptionRaised)
                .build();
    }
}