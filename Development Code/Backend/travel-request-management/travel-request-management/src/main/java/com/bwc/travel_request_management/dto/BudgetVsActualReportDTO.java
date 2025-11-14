package com.bwc.travel_request_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetVsActualReportDTO {
    private String reportPeriod;
    private List<BudgetVsActualItemDTO> items;
    private Double totalBudget;
    private Double totalActual;
    private Double variance;
    private Double variancePercentage;
    private LocalDateTime generatedAt;
}
