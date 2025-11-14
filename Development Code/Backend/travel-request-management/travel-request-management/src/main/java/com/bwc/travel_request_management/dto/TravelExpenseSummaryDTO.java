package com.bwc.travel_request_management.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelExpenseSummaryDTO {
    private UUID travelRequestId;
    private BigDecimal totalExpenses;
    private BigDecimal totalBookings;
    private BigDecimal grandTotal;
    private BigDecimal advanceTaken;
    private BigDecimal balanceAmount; // grandTotal - advanceTaken
    private List<DailyExpenseSummaryDTO> dailySummaries;
    private ExpenseBreakdownDTO breakdown;
}
