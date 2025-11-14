package com.bwc.travel_request_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentExpenseSummary {
    private Double totalEstimatedBudget;
    private Double totalActualExpenses;
    private Double variance;
    private Long requestCount;
    private Double averageCostPerRequest;
}

