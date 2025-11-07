package com.bwc.approval_workflow_service.service.impl.base;

import java.time.LocalDateTime;

import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.entity.ApprovalAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.exception.ResourceNotFoundException;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.mapper.ApprovalWorkflowMapper;
import com.bwc.approval_workflow_service.repository.ApprovalActionRepository;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.service.ApprovalService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public abstract class AbstractApprovalService<I extends BaseApprovalActionRequestDTO, O extends BaseApprovalActionResponseDTO>
        implements ApprovalService<I, O> {

    protected final ApprovalWorkflowRepository workflowRepository;
    protected final ApprovalActionRepository actionRepository;
    protected final ApprovalWorkflowMapper mapper;
    protected final NotificationServiceClient notificationService;

    @Override
    @Transactional
    public O processApproval(I request) {
        log.info("🔹 [{}] Processing approval for workflow {}", getActorRole(), request.getWorkflowId());

        ApprovalWorkflow workflow = workflowRepository.findById(request.getWorkflowId())
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + request.getWorkflowId()));

        validateActor(workflow, request);
        ApprovalAction action = recordAction(workflow, request);

        O response = handleApproval(workflow, request, action);
        workflowRepository.save(workflow);

        log.info("✅ [{}] Approval completed for workflow {}", getActorRole(), workflow.getWorkflowId());
        return response;
    }

    protected abstract O handleApproval(ApprovalWorkflow workflow, I request, ApprovalAction action);
    protected abstract String getActorRole();

    protected void validateActor(ApprovalWorkflow workflow, I request) {
        if (!getActorRole().equalsIgnoreCase(workflow.getCurrentApproverRole())) {
            throw new WorkflowException(String.format("Only %s can act on this step.", getActorRole()));
        }
        if (workflow.getCurrentApproverId() == null ||
                !workflow.getCurrentApproverId().equals(request.getApproverId())) {
            throw new WorkflowException("Approver not authorized for this workflow step.");
        }
    }

    protected ApprovalAction recordAction(ApprovalWorkflow workflow, I request) {
        ApprovalAction action = ApprovalAction.builder()
                .workflow(workflow)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(getActorRole())
                .approverId(request.getApproverId())
                .approverName(request.getApproverName())
                .action(request.getActionType().toUpperCase())
                .step(workflow.getCurrentStep())
                .comments(request.getComments())
                .actionTakenAt(LocalDateTime.now())
                .build();

        workflow.addAction(action);
        actionRepository.save(action);
        return action;
    }

    protected void notifyNextStep(ApprovalWorkflow workflow, String nextStepRole) {
        try {
            notificationService.notifyNextApprover(workflow, nextStepRole);
        } catch (Exception e) {
            log.warn("⚠️ Notification failed: {}", e.getMessage());
        }
    }
}
