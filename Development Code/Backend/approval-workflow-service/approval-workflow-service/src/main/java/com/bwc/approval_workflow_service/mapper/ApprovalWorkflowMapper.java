//package com.bwc.approval_workflow_service.mapper;
//
//import com.bwc.approval_workflow_service.dto.ApprovalActionDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
//import com.bwc.approval_workflow_service.entity.ApprovalAction;
//import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
//import org.springframework.stereotype.Component;
//
//@Component
//public class ApprovalWorkflowMapper {
//
//    public ApprovalWorkflowDTO toDto(ApprovalWorkflow entity) {
//        if (entity == null) return null;
//
//        return ApprovalWorkflowDTO.builder()
//                .workflowId(entity.getWorkflowId())
//                .travelRequestId(entity.getTravelRequestId())
//                .workflowType(entity.getWorkflowType())
//                .currentStep(entity.getCurrentStep())
//                .currentApproverRole(entity.getCurrentApproverRole())
//                .currentApproverId(entity.getCurrentApproverId())
//                .status(entity.getStatus())
//                .previousStep(entity.getPreviousStep())
//                .nextStep(entity.getNextStep())
//                .priority(entity.getPriority())
//                .estimatedCost(entity.getEstimatedCost())
//                .actualCost(entity.getActualCost())
//                .isOverpriced(entity.getIsOverpriced())
//                .overpricedReason(entity.getOverpricedReason())
//                .dueDate(entity.getDueDate())
//                .createdAt(entity.getCreatedAt())
//                .updatedAt(entity.getUpdatedAt())
//                .completedAt(entity.getCompletedAt())
//                .build();
//    }
//
//    public ApprovalActionDTO toActionDto(ApprovalAction entity) {
//        if (entity == null) return null;
//
//        return ApprovalActionDTO.builder()
//                .actionId(entity.getActionId())
//                // ✅ FIXED: Use the linked workflow's ID safely
//                .workflowId(entity.getWorkflow() != null ? entity.getWorkflow().getWorkflowId() : null)
//                .travelRequestId(entity.getTravelRequestId())
//                .approverRole(entity.getApproverRole())
//                .approverId(entity.getApproverId())
//                .approverName(entity.getApproverName())
//                .action(entity.getAction())
//                .step(entity.getStep())
//                .comments(entity.getComments())
//                .escalationReason(entity.getEscalationReason())
//                .isEscalated(entity.getIsEscalated())
//                .amountApproved(entity.getAmountApproved())
//                .reimbursementAmount(entity.getReimbursementAmount())
//                .actionTakenAt(entity.getActionTakenAt())
//                .createdAt(entity.getCreatedAt())
//                .build();
//    }
//}
