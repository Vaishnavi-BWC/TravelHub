package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDTO {
    private DashboardSummaryDTO summary;
    private java.util.List<PendingApprovalDTO> pendingApprovals;
    private java.util.List<ActionHistoryDTO> recentActions;
    private java.util.List<ExceptionDTO> recentExceptions;
}