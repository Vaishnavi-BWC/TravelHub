package com.bwc.travel_request_management.dto;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostAnalysisReportDTO {
    private String reportPeriod;
    private Map<String, Double> costByDestination;
    private Map<String, Double> costByTravelPurpose;
    private Map<YearMonth, Double> monthlyCostTrend;
    private Map<String, Double> costByEmployeeLevel;
    private Double averageTripCost;
    private String mostExpensiveDestination;
    private LocalDateTime generatedAt;
}