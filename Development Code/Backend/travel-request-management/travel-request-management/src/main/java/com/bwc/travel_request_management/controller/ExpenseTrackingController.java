package com.bwc.travel_request_management.controller;

import com.bwc.travel_request_management.dto.TravelExpenseSummaryDTO;
import com.bwc.travel_request_management.service.ExpenseTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/travel-requests")
@RequiredArgsConstructor
public class ExpenseTrackingController {

    private final ExpenseTrackingService expenseTrackingService;

    @GetMapping("/{requestId}/expense-summary")
    public ResponseEntity<TravelExpenseSummaryDTO> getExpenseSummary(@PathVariable UUID requestId) {
        TravelExpenseSummaryDTO summary = expenseTrackingService.getExpenseSummary(requestId);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/{requestId}/update-totals")
    public ResponseEntity<Void> updateTravelRequestTotals(@PathVariable UUID requestId) {
        expenseTrackingService.updateTravelRequestTotals(requestId);
        return ResponseEntity.ok().build();
    }
}