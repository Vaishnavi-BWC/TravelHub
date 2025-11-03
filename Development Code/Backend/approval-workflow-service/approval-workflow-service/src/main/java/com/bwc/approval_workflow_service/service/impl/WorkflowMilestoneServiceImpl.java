package com.bwc.approval_workflow_service.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.dto.WorkflowMilestoneDTO;
import com.bwc.approval_workflow_service.dto.WorkflowProgressResponseDTO;
import com.bwc.approval_workflow_service.entity.ApprovalAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.exception.ResourceNotFoundException;
import com.bwc.approval_workflow_service.repository.ApprovalActionRepository;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;
import com.bwc.approval_workflow_service.service.WorkflowMilestoneService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowMilestoneServiceImpl implements WorkflowMilestoneService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final WorkflowConfigurationRepository configRepository;
    private final ApprovalActionRepository actionRepository;

    @Override
    public List<WorkflowMilestoneDTO> getWorkflowMilestones(UUID travelRequestId) {
        ApprovalWorkflow workflow = workflowRepository.findByTravelRequestId(travelRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for travel request: " + travelRequestId));

        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflow.getWorkflowType());

        List<ApprovalAction> actions = actionRepository
                .findByTravelRequestIdOrderByActionTakenAtAsc(travelRequestId);

        List<WorkflowMilestoneDTO> milestones = new ArrayList<>();

        for (WorkflowConfiguration config : configs) {
            String step = config.getStepName();

            // Find latest action taken on this step
            ApprovalAction lastAction = actions.stream()
                    .filter(a -> a.getStep().equalsIgnoreCase(step))
                    .reduce((first, second) -> second) // get latest action
                    .orElse(null);

            String status;
            if (lastAction != null && "APPROVE".equalsIgnoreCase(lastAction.getAction())) {
                status = "COMPLETED";
            } else if (workflow.getCurrentStep().equalsIgnoreCase(step)) {
                status = "CURRENT";
            } else {
                status = "UPCOMING";
            }

            milestones.add(WorkflowMilestoneDTO.builder()
                    .stepName(step)
                    .displayName(config.getStepName().replace("_", " "))
                    .role(config.getApproverRole())
                    .status(status)
                    .approverName(lastAction != null ? lastAction.getApproverName() : null)
                    .action(lastAction != null ? lastAction.getAction() : null)
                    .comments(lastAction != null ? lastAction.getComments() : null)
                    .actionTime(lastAction != null ? lastAction.getActionTakenAt() : null)
                    .build());
        }

        log.info("🎯 Generated {} milestones for workflow {}", milestones.size(), workflow.getWorkflowId());
        return milestones;
    }
    
    @Override
    public WorkflowProgressResponseDTO getWorkflowProgress(UUID travelRequestId) {
        ApprovalWorkflow workflow = workflowRepository.findByTravelRequestId(travelRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for travel request: " + travelRequestId));

        // Get milestone list (reuse your existing method)
        List<WorkflowMilestoneDTO> milestones = getWorkflowMilestones(travelRequestId);

        // Compute last action time
        List<ApprovalAction> actions = actionRepository.findByTravelRequestIdOrderByActionTakenAtAsc(travelRequestId);
        LocalDateTime lastUpdatedAt = actions.isEmpty()
                ? workflow.getCreatedAt()
                : actions.get(actions.size() - 1).getActionTakenAt();

        // Identify next approver role
        String nextRole = workflow.getCurrentApproverRole();
        String nextApproverName = null;

        try {
            // optional: fetch next approver name via EmployeeService
            // EmployeeProxyDTO emp = employeeServiceClient.getEmployee(workflow.getCurrentApproverId());
            // nextApproverName = emp != null ? emp.getFullName() : null;
        } catch (Exception e) {
            log.warn("⚠️ Failed to fetch next approver name for {}", workflow.getWorkflowId());
        }

        return WorkflowProgressResponseDTO.builder()
                .workflowId(workflow.getWorkflowId().toString())
                .workflowType(workflow.getWorkflowType())
                .currentStep(workflow.getCurrentStep())
                .nextApproverRole(nextRole)
                .nextApproverName(nextApproverName)
                .overallStatus(workflow.getStatus())
                .lastUpdatedAt(lastUpdatedAt)
                .milestones(milestones)
                .build();
    }

}
