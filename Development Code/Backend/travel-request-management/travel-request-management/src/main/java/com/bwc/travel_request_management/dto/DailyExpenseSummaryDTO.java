package com.bwc.travel_request_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyExpenseSummaryDTO {
    private LocalDate date;
    private BigDecimal dailyTotal;
    private List<ExpenseBillDTO> expenses;
    private List<TravelBookingDTO> bookings;
}