package com.bwc.approval_workflow_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bwc.approval_workflow_service.dto.TravelDeskHistoryDTO;
import com.bwc.approval_workflow_service.dto.TravelDeskStatsDTO;
import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/travel-desk/history")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TRAVEL_DESK')")
public class TravelDeskHistoryController {

    private final ApprovalWorkflowService workflowService;

    @GetMapping("/my-actions")
    public ResponseEntity<List<TravelDeskHistoryDTO>> getMyTravelDeskHistory(
            @RequestHeader("X-User-Id") UUID travelDeskId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.info("Fetching travel desk history for user: {}", travelDeskId);
        List<TravelDeskHistoryDTO> history = workflowService.getTravelDeskHistory(travelDeskId, startDate, endDate);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/request/{travelRequestId}")
    public ResponseEntity<List<TravelDeskHistoryDTO>> getTravelDeskActionsByRequest(
            @PathVariable UUID travelRequestId) {
        
        log.info("Fetching travel desk actions for request: {}", travelRequestId);
        List<TravelDeskHistoryDTO> actions = workflowService.getTravelDeskActionsByRequest(travelRequestId);
        return ResponseEntity.ok(actions);
    }

    @GetMapping("/all-activities")
    @PreAuthorize("hasRole('ADMIN')") // Only admins can see all travel desk activities
    public ResponseEntity<List<TravelDeskHistoryDTO>> getAllTravelDeskActivities(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.info("Fetching all travel desk activities");
        List<TravelDeskHistoryDTO> activities = workflowService.getAllTravelDeskActivities(startDate, endDate);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/stats")
    public ResponseEntity<TravelDeskStatsDTO> getTravelDeskStats(
            @RequestHeader("X-User-Id") UUID travelDeskId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.info("Fetching travel desk stats for user: {}", travelDeskId);
        TravelDeskStatsDTO stats = workflowService.getTravelDeskStats(travelDeskId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TravelDeskHistoryDTO>> searchTravelDeskActions(
            @RequestHeader("X-User-Id") UUID travelDeskId,
            @RequestParam String searchTerm,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.info("Searching travel desk actions for term: {}", searchTerm);
        List<TravelDeskHistoryDTO> allActions = workflowService.getTravelDeskHistory(travelDeskId, startDate, endDate);
        
        // Filter by search term
        List<TravelDeskHistoryDTO> filteredActions = allActions.stream()
                .filter(action -> 
                    (action.getComments() != null && action.getComments().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (action.getEmployeeName() != null && action.getEmployeeName().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (action.getTravelPurpose() != null && action.getTravelPurpose().toLowerCase().contains(searchTerm.toLowerCase())) ||
                    (action.getAction() != null && action.getAction().toLowerCase().contains(searchTerm.toLowerCase()))
                )
                .toList();
        
        return ResponseEntity.ok(filteredActions);
    }
}