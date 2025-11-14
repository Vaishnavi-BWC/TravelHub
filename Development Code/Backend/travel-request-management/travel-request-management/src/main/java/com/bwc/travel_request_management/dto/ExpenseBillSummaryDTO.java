package com.bwc.travel_request_management.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseBillSummaryDTO {
    private UUID workflowId;
    private Integer totalBills;
    private BigDecimal totalAmount;
    private BigDecimal  approvedAmount;
    private Long pendingCount;
    private Long approvedCount;
    private Long rejectedCount;
    private List<ExpenseBillDTO> bills;
}