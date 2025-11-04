package com.bwc.travel_request_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialDashboardDTO {
    private ExpenseSummaryReportDTO expenseSummary;
    private BudgetVsActualReportDTO budgetVsActual;
    private CostAnalysisReportDTO costAnalysis;
    private LocalDateTime generatedAt;
}