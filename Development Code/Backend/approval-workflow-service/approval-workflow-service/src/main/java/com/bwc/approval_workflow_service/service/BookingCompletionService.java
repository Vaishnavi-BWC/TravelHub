package com.bwc.approval_workflow_service.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.exception.ResourceNotFoundException;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingCompletionService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final TravelRequestServiceClient travelClient;
    private final WorkflowConfigurationRepository configRepository;

    /**
     * Mark bookings completed. If there are more PRE_TRAVEL steps, activate next.
     * Otherwise append POST_TRAVEL steps from workflow_configurations and set first as ACTIVE.
     */
    @Transactional
    public ApprovalWorkflowDTO markBookingCompleted(UUID workflowId, UUID travelDeskId, String comments) {
        log.info("Marking bookings completed for workflow: {}, by travelDeskId: {}", workflowId, travelDeskId);

        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));

        WorkflowStep currentStep = workflow.getSteps().stream()
                .filter(step -> "ACTIVE".equalsIgnoreCase(step.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found for workflow " + workflowId));

        if (!"TRAVEL_DESK".equalsIgnoreCase(currentStep.getApproverRole())) {
            throw new WorkflowException("Only TRAVEL_DESK can mark bookings as completed. Current role: "
                                        + currentStep.getApproverRole());
        }

        // record action (simplified; use your existing recordBookingCompletionAction method)
        ActorAction action = recordBookingCompletionAction(workflow, currentStep, travelDeskId, comments);

        // complete current step
        currentStep.setStatus("COMPLETED");
        currentStep.setCompletedAt(LocalDateTime.now());

        // try to find next PRE_TRAVEL step already present in workflow steps
        Optional<WorkflowStep> nextStepOpt = workflow.getSteps().stream()
                .filter(step -> step.getSequenceOrder() > currentStep.getSequenceOrder())
                .min(Comparator.comparing(WorkflowStep::getSequenceOrder));

        String nextStepName = null;
        String message;

        if (nextStepOpt.isPresent()) {
            WorkflowStep nextStep = nextStepOpt.get();
            nextStep.setStatus("ACTIVE");
            workflow.setCurrentStep(nextStep.getStepName());
            workflow.setCurrentApproverRole(nextStep.getApproverRole());
            workflow.setPreviousStep(currentStep.getStepName());
            nextStepName = nextStep.getStepName();
            message = "Bookings completed and forwarded to " + nextStep.getApproverRole();

            // Update travel request status, keep behavior consistent
            travelClient.updateRequestStatus(workflow.getTravelRequestId(), "BOOKED");
        } else {
            // No next PRE_TRAVEL step. Append POST_TRAVEL steps from config table
            message = "Pre-travel completed; appending POST_TRAVEL steps.";

            List<WorkflowConfiguration> postConfigs = configRepository
                    .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder("POST_TRAVEL");

            if (postConfigs == null || postConfigs.isEmpty()) {
                // fallback: if not configured, you may either mark workflow completed or throw
                log.warn("No POST_TRAVEL configuration found. Marking workflow completed: {}", workflowId);
                workflow.setStatus("COMPLETED");
                workflow.setCompletedAt(LocalDateTime.now());
                workflowRepository.save(workflow);
                return convertToDTO(workflow, "Workflow completed (no POST_TRAVEL config)", null);
            }

            // Compute base sequence start (ensure we keep monotonic sequenceOrder)
            int sequenceStart = currentStep.getSequenceOrder() + 1;

            // Append configured steps (preserve config sequence order)
            List<WorkflowConfiguration> sorted = postConfigs.stream()
                    .sorted(Comparator.comparing(WorkflowConfiguration::getSequenceOrder))
                    .collect(Collectors.toList());

            for (WorkflowConfiguration cfg : sorted) {
                WorkflowStep step = new WorkflowStep();
                step.setWorkflow(workflow);
                step.setStepName(cfg.getStepName());
                step.setApproverRole(cfg.getApproverRole());
                // sequence: base + cfg.sequenceOrder - 1
                step.setSequenceOrder(sequenceStart + cfg.getSequenceOrder() - 1);
                step.setOriginalWorkflowType("POST_TRAVEL");
                step.setStatus(cfg.getSequenceOrder() == 1 ? "ACTIVE" : "PENDING");
                // Add to workflow (ApprovalWorkflow.addStep will set bi-directional)
                workflow.addStep(step);

                if (cfg.getSequenceOrder() == 1) {
                    workflow.setCurrentStep(step.getStepName());
                    workflow.setCurrentApproverRole(step.getApproverRole());
                    workflow.setPreviousStep(currentStep.getStepName());
                    nextStepName = step.getStepName();
                }
            }

            // update travel request status to indicate POST_TRAVEL started
            try {
                travelClient.updateRequestStatus(workflow.getTravelRequestId(), "AWAITING_BILLS_SUBMISSION");
            } catch (Exception e) {
                log.warn("Failed to update travel request status to AWAITING_BILLS_SUBMISSION: {}", e.getMessage());
            }
        }

        workflowRepository.save(workflow);
        log.info("Bookings completed for workflow: {}. Next step: {}", workflowId, nextStepName);
        return convertToDTO(workflow, message, nextStepName);
    }

    /**
     * ✅ Check if bookings can be marked as completed
     */
    public boolean canMarkBookingCompleted(UUID workflowId) {
        try {
            ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(workflowId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));

            // Check if current step is TRAVEL_DESK and workflow is active
            WorkflowStep currentStep = workflow.getSteps().stream()
                    .filter(step -> "ACTIVE".equalsIgnoreCase(step.getStatus()))
                    .findFirst()
                    .orElseThrow(() -> new WorkflowException("No active step found"));

            return "TRAVEL_DESK".equals(currentStep.getApproverRole()) && 
                   "ACTIVE".equals(workflow.getStatus());
            
        } catch (Exception e) {
            log.warn("Cannot mark bookings as completed for workflow {}: {}", workflowId, e.getMessage());
            return false;
        }
    }

    private ActorAction recordBookingCompletionAction(ApprovalWorkflow workflow, WorkflowStep currentStep, UUID travelDeskId, String comments) {
        // either reuse existing ActorAction creation in your project; simplified stub:
        ActorAction action = ActorAction.builder()
                .step(currentStep)
                .actorId(travelDeskId)
                .actorRole("TRAVEL_DESK")
                .actorName("Travel Desk User")
                .decision("COMPLETE_BOOKING")
                .comments(comments)
                .actionTakenAt(LocalDateTime.now())
                .build();
        currentStep.addActorAction(action);
        return action;
    }

    /**
     * 🔄 Update travel request status
     */
    private void updateTravelRequestStatus(UUID travelRequestId, String status) {
        try {
            travelClient.updateRequestStatus(travelRequestId, status);
            log.info("✅ Updated travel request {} status to: {}", travelRequestId, status);
        } catch (Exception e) {
            log.warn("⚠️ Failed to update travel request status for {}: {}", travelRequestId, e.getMessage());
            // Don't throw exception - this shouldn't fail the main workflow
        }
    }

    /**
     * 🎯 Convert entity to DTO
     */
    private ApprovalWorkflowDTO convertToDTO(ApprovalWorkflow workflow, String message, String nextStep) {
        return ApprovalWorkflowDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .travelRequestId(workflow.getTravelRequestId())
                .employeeId(workflow.getEmployeeId())
                .workflowType(workflow.getWorkflowType())
                .status(workflow.getStatus())
                .currentStep(workflow.getCurrentStep())
                .currentApproverRole(workflow.getCurrentApproverRole())
                .previousStep(workflow.getPreviousStep())
                .nextStep(nextStep)
                .createdAt(workflow.getCreatedAt())
                .updatedAt(workflow.getUpdatedAt())
                .completedAt(workflow.getCompletedAt())
//                .message(message)
                .build();
    }
}