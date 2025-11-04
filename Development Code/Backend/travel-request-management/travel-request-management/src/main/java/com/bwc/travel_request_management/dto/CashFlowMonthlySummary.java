package com.bwc.travel_request_management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowMonthlySummary {
    private Double totalExpenses;
    private Double totalBookings;
    private Double netCashFlow;
    private Long requestCount;
}