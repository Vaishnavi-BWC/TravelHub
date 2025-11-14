package com.bwc.travel_request_management.service;

import java.math.BigDecimal;
import java.util.UUID;

import com.bwc.travel_request_management.dto.TravelExpenseSummaryDTO;

public interface ExpenseTrackingService {
    TravelExpenseSummaryDTO getExpenseSummary(UUID travelRequestId);
    void updateTravelRequestTotals(UUID travelRequestId);
    BigDecimal calculateTotalExpenses(UUID travelRequestId);
    BigDecimal calculateTotalBookings(UUID travelRequestId);
}