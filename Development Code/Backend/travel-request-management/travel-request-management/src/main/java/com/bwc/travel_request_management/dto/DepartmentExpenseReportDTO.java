package com.bwc.travel_request_management.dto;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentExpenseReportDTO {
    private String reportPeriod;
    private Map<String, DepartmentExpenseSummary> departmentSummaries;
    private Double totalExpenses;
    private Double totalBudget;
    private LocalDateTime generatedAt;
}
