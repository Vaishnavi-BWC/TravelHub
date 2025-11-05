package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseBillSummaryDTO {
    private UUID workflowId;
    private Integer totalBills;
    private Double totalAmount;
    private Double approvedAmount;
    private Long pendingCount;
    private Long approvedCount;
    private Long rejectedCount;
    // Note: We don't include the full bill list here to avoid circular dependencies
    // The full bill details will be fetched from travel-request-service when needed
}