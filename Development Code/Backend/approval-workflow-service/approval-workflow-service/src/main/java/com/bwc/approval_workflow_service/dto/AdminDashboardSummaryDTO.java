package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardSummaryDTO {
    private Long totalWorkflows;
    private Long pendingWorkflows;
    private Long completedWorkflows;
    private Long rejectedWorkflows;
    private Long pendingManagerApprovals;
    private Long pendingFinanceApprovals;
    private Long pendingHRApprovals;
    private Long pendingTravelDeskApprovals;
    private Long totalExceptions;
    private Long openExceptions;
    private Long recentActivityCount;
}