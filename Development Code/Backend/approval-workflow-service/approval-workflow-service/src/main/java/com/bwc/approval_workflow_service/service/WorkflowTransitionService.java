package com.bwc.approval_workflow_service.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowStep;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowTransitionService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final WorkflowConfigurationRepository configRepository;
    private final TravelRequestServiceClient travelRequestClient;

    /**
     * Transition from PRE_TRAVEL to POST_TRAVEL seamlessly
     */
    @Transactional
    public void transitionToPostTravel(UUID workflowId) {
        ApprovalWorkflow workflow = workflowRepository.findByIdWithStepsAndActions(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        // Check if already in POST_TRAVEL
        if ("POST_TRAVEL".equals(workflow.getWorkflowType())) {
            log.info("Workflow {} is already in POST_TRAVEL phase", workflowId);
            return;
        }

        // Complete the PRE_TRAVEL phase
        workflow.setWorkflowType("POST_TRAVEL");
        workflow.setStatus("IN_PROGRESS");
        workflow.setPreviousStep(workflow.getCurrentStep());
        
        // Get POST_TRAVEL configurations
        var postTravelConfigs = configRepository.findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder("POST_TRAVEL");
        
        if (postTravelConfigs.isEmpty()) {
            throw new RuntimeException("No POST_TRAVEL configuration found");
        }

        // Add POST_TRAVEL steps to existing workflow
        int maxSequence = workflow.getSteps().stream()
                .mapToInt(WorkflowStep::getSequenceOrder)
                .max()
                .orElse(0);

        int sequence = maxSequence + 1;
        for (var config : postTravelConfigs) {
            WorkflowStep step = WorkflowStep.builder()
                    .workflow(workflow)
                    .stepName(config.getStepName())
                    .approverRole(config.getApproverRole())
                    .sequenceOrder(sequence)
                    .status("PENDING")
                    .originalWorkflowType("POST_TRAVEL")
                    .build();
            workflow.addStep(step);
            sequence++;
        }

        // Activate first POST_TRAVEL step
        WorkflowStep firstPostStep = workflow.getSteps().stream()
                .filter(s -> s.getSequenceOrder() == (maxSequence + 1))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No POST_TRAVEL steps found"));

        firstPostStep.setStatus("ACTIVE");
        workflow.setCurrentStep(firstPostStep.getStepName());
        workflow.setCurrentApproverRole(firstPostStep.getApproverRole());

        workflowRepository.save(workflow);
        
        log.info("✅ Successfully transitioned workflow {} from PRE_TRAVEL to POST_TRAVEL", workflowId);
        
        // Update travel request status
        travelRequestClient.updateRequestStatus(workflow.getTravelRequestId(), "READY_FOR_EXPENSE_BILLS");
    }

    /**
     * Check if workflow is ready for POST_TRAVEL transition
     */
    public boolean isReadyForPostTravel(UUID workflowId) {

    	return workflowRepository.findById(workflowId)
                .map(workflow -> 
                    "PRE_TRAVEL".equals(workflow.getWorkflowType()) && 
                    "COMPLETED".equals(workflow.getStatus())
                )
                .orElse(false);
    }
}