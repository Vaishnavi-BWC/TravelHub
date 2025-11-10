package com.bwc.approval_workflow_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.dto.BookingDocumentDTO;
import com.bwc.approval_workflow_service.dto.BookingSummaryDTO;
import com.bwc.approval_workflow_service.dto.TravelBookingDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/travel-desk/bookings")
@RequiredArgsConstructor
@Tag(name = "Travel Desk Bookings", description = "Manage travel bookings and related documents")
public class BookingController {

    private final TravelRequestServiceClient travelClient;

    // ==========================================================
    // 🧳 BOOKING MANAGEMENT ENDPOINTS
    // ==========================================================

    @Operation(summary = "Add booking for travel request")
    @PostMapping("/{requestId}")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<TravelBookingDTO> addBooking(
            @PathVariable UUID requestId,
            @Valid @RequestBody TravelBookingDTO bookingDTO) {

        log.info("Adding booking for requestId: {}", requestId);
        return ResponseEntity.ok(travelClient.addBooking(requestId, bookingDTO));
    }

    @Operation(summary = "List bookings for a request")
    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<TravelBookingDTO>> getBookings(@PathVariable UUID requestId) {
        log.info("Fetching all bookings for requestId: {}", requestId);
        return ResponseEntity.ok(travelClient.getBookingsForRequest(requestId));
    }

    @Operation(summary = "Update booking status")
    @PatchMapping("/{requestId}/{bookingId}/status")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<TravelBookingDTO> updateBookingStatus(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId,
            @RequestParam String status) {

        log.info("Updating status for booking {} to {}", bookingId, status);
        return ResponseEntity.ok(travelClient.updateBookingStatus(bookingId, status));
    }

    @Operation(summary = "Delete booking")
    @DeleteMapping("/{requestId}/{bookingId}")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId) {

        log.info("Deleting booking {} for request {}", bookingId, requestId);
        travelClient.deleteBooking(bookingId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get booking summary for a workflow/request")
    @GetMapping("/{requestId}/summary")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<BookingSummaryDTO> getBookingSummary(@PathVariable UUID requestId) {
        log.info("Fetching booking summary for requestId: {}", requestId);
        return ResponseEntity.ok(travelClient.getBookingSummary(requestId));
    }

    // ==========================================================
    // 📎 BOOKING DOCUMENT MANAGEMENT ENDPOINTS
    // ==========================================================

    @Operation(summary = "Upload booking document")
    @PostMapping(
            value = "/{requestId}/{bookingId}/documents/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
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

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File cannot be empty");
            }

            if (file.getSize() > 10 * 1024 * 1024) {
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
    @GetMapping("/{requestId}/{bookingId}/documents")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<BookingDocumentDTO>> getDocumentsForBooking(
            @PathVariable UUID requestId,
            @PathVariable UUID bookingId) {

        log.info("Fetching all documents for bookingId: {}", bookingId);
        return ResponseEntity.ok(travelClient.getDocumentsByBooking(bookingId));
    }

    @Operation(summary = "Get all documents for a request")
    @GetMapping("/{requestId}/documents")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<List<BookingDocumentDTO>> getDocumentsForRequest(
            @PathVariable UUID requestId) {

        log.info("Fetching all documents for requestId: {}", requestId);
        return ResponseEntity.ok(travelClient.getDocumentsByRequest(requestId));
    }

    @Operation(summary = "Delete booking document")
    @DeleteMapping("/{requestId}/documents/{documentId}")
    @PreAuthorize("hasRole('TRAVEL_DESK')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID requestId,
            @PathVariable UUID documentId) {

        log.info("Deleting document {} for request {}", documentId, requestId);
        travelClient.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
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
