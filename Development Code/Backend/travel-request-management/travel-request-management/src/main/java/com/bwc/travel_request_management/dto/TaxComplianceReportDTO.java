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
public class TaxComplianceReportDTO {
    private Integer fiscalYear;
    private Map<String, Double> taxableExpenses;
    private Map<String, Double> nonTaxableExpenses;
    private Map<String, Integer> employeeWiseExpenses;
    private Double totalTaxableAmount;
    private Double totalNonTaxableAmount;
    private LocalDateTime generatedAt;
}