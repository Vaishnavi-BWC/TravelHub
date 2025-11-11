package com.bwc.approval_workflow_service.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
import com.bwc.approval_workflow_service.entity.ActorAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.exception.ResourceNotFoundException;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingCompletionService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final TravelRequestServiceClient travelClient;

    /**
     * ✅ Mark bookings as completed and progress workflow to next step
     */
    @Transactional
    public ApprovalWorkflowDTO markBookingCompleted(UUID workflowId, UUID travelDeskId, String comments) {
        log.info("🎯 Marking bookings as completed for workflow: {}, by travelDeskId: {}", workflowId, travelDeskId);

        // Get the workflow with steps
        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));

        // Validate that current step is TRAVEL_DESK_BOOKING
        WorkflowStep currentStep = workflow.getSteps().stream()
                .filter(step -> "ACTIVE".equalsIgnoreCase(step.getStatus()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("No active step found for workflow " + workflowId));

        if (!"TRAVEL_DESK".equals(currentStep.getApproverRole())) {
            throw new WorkflowException("Only TRAVEL_DESK can mark bookings as completed. Current role: " + currentStep.getApproverRole());
        }

        // Record the booking completion action
        ActorAction action = recordBookingCompletionAction(workflow, currentStep, travelDeskId, comments);

        // Complete current step and progress to next step
        currentStep.setStatus("COMPLETED");
        currentStep.setCompletedAt(LocalDateTime.now());

        // Find and activate next step
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

            message = "Bookings completed and forwarded to " + nextStep.getApproverRole() + ".";
            
            // Update travel request status to "BOOKED"
            updateTravelRequestStatus(workflow.getTravelRequestId(), "BOOKED");
        } else {
            // This is the final step - workflow completed
            workflow.setStatus("COMPLETED");
            workflow.setCompletedAt(LocalDateTime.now());
            message = "Bookings completed and workflow finished.";
            
            // Update travel request status to "COMPLETED"
            updateTravelRequestStatus(workflow.getTravelRequestId(), "COMPLETED");
        }

        workflowRepository.save(workflow);

        log.info("✅ Successfully marked bookings as completed for workflow: {}", workflowId);

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

    /**
     * 🔧 Record booking completion action
     */
    private ActorAction recordBookingCompletionAction(ApprovalWorkflow workflow, WorkflowStep currentStep, 
                                                     UUID travelDeskId, String comments) {
        ActorAction action = ActorAction.builder()
                .step(currentStep)
                .actorRole("TRAVEL_DESK")
                .actorId(travelDeskId)
                .actorName("Travel Desk User") // This could be fetched from user service
                .decision("MARK_BOOKING_COMPLETED")
                .comments(comments != null ? comments : "Bookings marked as completed")
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