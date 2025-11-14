// ExpenseSummaryReportDTO.java
package com.bwc.travel_request_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSummaryReportDTO {
    private String reportPeriod;
    private Long totalTravelRequests;
    private Double totalEstimatedBudget;
    private Double totalActualExpenses;
    private Double totalBookingCosts;
    private Double variance;
    private Map<String, Double> expensesByCategory;
    private Map<String, Double> expensesByProject;
    private Map<String, Long> requestCountByStatus;
    private Double averageCostPerRequest;
    private LocalDateTime generatedAt;
}