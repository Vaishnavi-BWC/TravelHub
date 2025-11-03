package com.bwc.approval_workflow_service.controller;


import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
import com.bwc.approval_workflow_service.dto.BookingDocumentDTO;
import com.bwc.approval_workflow_service.dto.BookingSummaryDTO;
import com.bwc.approval_workflow_service.dto.TravelBookingDTO;
import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/travel-desk/approvals")
@RequiredArgsConstructor
@Tag(name = "Travel Desk Approvals", description = "Manage approvals, bookings, and related booking documents")
public class TravelDeskApprovalController {

    private final ApprovalWorkflowService workflowService;
    private final TravelRequestServiceClient travelClient;

    // ==========================================================
    // 🧩 APPROVAL WORKFLOW ENDPOINTS
    // ==========================================================

    @Operation(summary = "Get pending Travel Desk approvals")
    @GetMapping("/pending")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<ApprovalWorkflowDTO>> getPendingApprovals() {
        return ResponseEntity.ok(workflowService.getPendingApprovalsByRole("TRAVEL_DESK"));
    }

    @Operation(summary = "Process Travel Desk approval")
    @PostMapping("/{workflowId}/action")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<ApprovalWorkflowDTO> takeTravelDeskAction(
            @PathVariable UUID workflowId,
            @RequestBody ApprovalRequestDTO approvalRequest,
            HttpServletRequest request) {

        UUID travelDeskId = parseUserId(request);
        approvalRequest.setWorkflowId(workflowId);
        approvalRequest.setApproverRole("TRAVEL_DESK");
        approvalRequest.setApproverId(travelDeskId);

        return ResponseEntity.ok(workflowService.processApproval(approvalRequest));
    }

    // ==========================================================
    // 🧳 BOOKING MANAGEMENT ENDPOINTS
    // ==========================================================

    @Operation(summary = "Add booking for travel request")
    @PostMapping("/{requestId}/bookings")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<TravelBookingDTO> addBooking(
            @PathVariable UUID requestId,
            @Valid @RequestBody TravelBookingDTO bookingDTO) {

        return ResponseEntity.ok(travelClient.addBooking(requestId, bookingDTO));
    }

    @Operation(summary = "List bookings for a request")
    @GetMapping("/{requestId}/bookings")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<TravelBookingDTO>> getBookings(@PathVariable UUID requestId) {
        return ResponseEntity.ok(travelClient.getBookingsForRequest(requestId));
    }

    @Operation(summary = "Update booking status")
    @PatchMapping("/{requestId}/bookings/{bookingId}/status")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<TravelBookingDTO> updateBookingStatus(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId,
            @RequestParam String status) {

        return ResponseEntity.ok(travelClient.updateBookingStatus(bookingId, status));
    }

    @Operation(summary = "Delete booking")
    @DeleteMapping("/{requestId}/bookings/{bookingId}")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId) {
        travelClient.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get booking summary for a workflow")
    @GetMapping("/{requestId}/bookings/summary")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<BookingSummaryDTO> getBookingSummary(@PathVariable UUID requestId) {
        return ResponseEntity.ok(travelClient.getBookingSummary(requestId));
    }

    // ==========================================================
    // 📎 BOOKING DOCUMENT MANAGEMENT ENDPOINTS
    // ==========================================================

    @Operation(summary = "Upload booking document")
    @PostMapping(value = "/{requestId}/bookings/{bookingId}/documents/upload", 
                consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<?> uploadDocument(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "description", required = false) String description,
            HttpServletRequest request) {

        try {
            UUID uploadedBy = parseUserId(request);
            log.info("Uploading document for booking: {}, type: {}, uploadedBy: {}", 
                    bookingId, documentType, uploadedBy);

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File cannot be empty");
            }

            if (file.getSize() > 10 * 1024 * 1024) { // 10MB
                return ResponseEntity.badRequest().body("File size exceeds 10MB limit");
            }

            ResponseEntity<BookingDocumentDTO> response = travelClient.uploadBookingDocument(
                    bookingId, file, documentType, description, uploadedBy);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Document uploaded successfully for booking: {}", bookingId);
                return ResponseEntity.ok(response.getBody());
            } else {
                log.error("Failed to upload document. Response status: {}", response.getStatusCode());
                return ResponseEntity.status(response.getStatusCode())
                        .body("Failed to upload document: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error uploading document for booking {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Error uploading document: " + e.getMessage());
        }
    }

    @Operation(summary = "Get all documents for a booking")
    @GetMapping("/{requestId}/bookings/{bookingId}/documents")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<BookingDocumentDTO>> getDocumentsForBooking(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId) {

        return ResponseEntity.ok(travelClient.getDocumentsByBooking(bookingId));
    }

    @Operation(summary = "Get all documents for a request")
    @GetMapping("/{requestId}/documents")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<BookingDocumentDTO>> getDocumentsForRequest(
            @PathVariable UUID requestId) {

        return ResponseEntity.ok(travelClient.getDocumentsByRequest(requestId));
    }

    @Operation(summary = "Delete booking document")
    @DeleteMapping("/{requestId}/documents/{documentId}")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID requestId,
            @PathVariable UUID documentId) {
        travelClient.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
    
    // ==========================================================
    // ✅ MARK BOOKING COMPLETED ENDPOINT
    // ==========================================================

    @Operation(summary = "Mark bookings as completed and progress workflow")
    @PostMapping("/{workflowId}/mark-booked")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<ApprovalWorkflowDTO> markBookingsCompleted(
            @PathVariable UUID workflowId,
            @RequestBody(required = false) MarkBookedRequest request,
            HttpServletRequest httpRequest) {

        UUID travelDeskId = parseUserId(httpRequest);
        String comments = (request != null) ? request.getComments() : "Bookings completed";

        ApprovalWorkflowDTO updatedWorkflow = workflowService.markBookingCompleted(
                workflowId, travelDeskId, comments);

        return ResponseEntity.ok(updatedWorkflow);
    }

    // ==========================================================
    // 🧾 Inner Request DTO
    // ==========================================================

    public static class MarkBookedRequest {
        private String comments;

        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
    }

    // ==========================================================
    // 🔧 Helper
    // ==========================================================

    private UUID parseUserId(HttpServletRequest request) {
        String id = request.getHeader("X-User-Id");
        if (id == null) {
            throw new IllegalArgumentException("X-User-Id header is required");
        }
        return UUID.fromString(id);
    }
    
    
    
}