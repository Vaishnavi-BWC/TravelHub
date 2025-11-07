package com.bwc.approval_workflow_service.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.bwc.approval_workflow_service.dto.ManagerApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.dto.ManagerApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.entity.ApprovalAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.service.impl.base.AbstractApprovalService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("managerApprovalService")
public class ManagerApprovalService
        extends AbstractApprovalService<ManagerApprovalActionRequestDTO, ManagerApprovalActionResponseDTO> {

    @Override
    protected String getActorRole() {
        return "MANAGER";
    }

    @Override
    protected ManagerApprovalActionResponseDTO handleApproval(ApprovalWorkflow workflow,
                                                        ManagerApprovalActionRequestDTO request,
                                                        ApprovalAction action) {

        String nextStep;
        String message;

        switch (request.getActionType().toUpperCase()) {
            case "APPROVE" -> {
                workflow.setStatus("APPROVED_BY_MANAGER");
                workflow.setPreviousStep(workflow.getCurrentStep());
                workflow.setCurrentStep("TRAVEL_DESK_CHECK");
                workflow.setCurrentApproverRole("TRAVEL_DESK");
                workflow.setCompletedAt(null);
                nextStep = "TRAVEL_DESK_CHECK";
                message = "Manager approved and forwarded to Travel Desk.";
                notifyNextStep(workflow, nextStep);
            }
            case "REJECT" -> {
                workflow.setStatus("REJECTED_BY_MANAGER");
                workflow.setCompletedAt(LocalDateTime.now());
                nextStep = null;
                message = "Manager rejected the request.";
            }
            default -> throw new RuntimeException("Unsupported manager action: " + request.getActionType());
        }

        return ManagerApprovalActionResponseDTO.builder()
                .workflowId(workflow.getWorkflowId())
                .status(workflow.getStatus())
                .nextStep(nextStep)
                .message(message)
                .build();
    }
}
