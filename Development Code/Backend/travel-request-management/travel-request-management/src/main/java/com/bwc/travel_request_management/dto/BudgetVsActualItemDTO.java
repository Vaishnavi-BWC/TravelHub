package com.bwc.travel_request_management.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetVsActualItemDTO {
    private UUID travelRequestId;
    private UUID employeeId;
    private String purpose;
    private Double estimatedBudget;
    private Double actualExpenses;
    private Double variance;
    private String status;
}