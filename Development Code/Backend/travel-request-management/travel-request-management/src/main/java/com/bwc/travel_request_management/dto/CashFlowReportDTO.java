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
public class CashFlowReportDTO {
    private String reportPeriod;
    private Map<YearMonth, CashFlowMonthlySummary> monthlySummaries;
    private Double totalOutflow;
    private LocalDateTime generatedAt;
}
