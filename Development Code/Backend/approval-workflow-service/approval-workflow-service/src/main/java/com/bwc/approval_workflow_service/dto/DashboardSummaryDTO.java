package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private Long pendingApprovalsCount;
    private Long completedActionsCount;
    private Long raisedExceptionsCount;
    private Long totalWorkflowsInvolved;
    private Long awaitingClarificationCount;
    private Long returnedRequestsCount;
}