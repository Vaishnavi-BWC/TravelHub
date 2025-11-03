package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowMetricsDTO {
    private Long totalWorkflows;
    private Long pendingWorkflows;
    private Long approvedWorkflows;
    private Long rejectedWorkflows;
    private Long escalatedWorkflows;
    private Double averageApprovalTime;
}