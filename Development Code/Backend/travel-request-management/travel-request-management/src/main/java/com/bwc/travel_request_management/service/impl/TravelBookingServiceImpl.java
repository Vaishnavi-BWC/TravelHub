package com.bwc.travel_request_management.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.travel_request_management.dto.BookingSummaryDTO;
import com.bwc.travel_request_management.dto.TravelBookingDTO;
import com.bwc.travel_request_management.entity.TravelBooking;
import com.bwc.travel_request_management.entity.TravelRequest;
import com.bwc.travel_request_management.exception.ResourceNotFoundException;
import com.bwc.travel_request_management.mapper.TravelBookingMapper;
import com.bwc.travel_request_management.repository.TravelBookingRepository;
import com.bwc.travel_request_management.repository.TravelRequestRepository;
import com.bwc.travel_request_management.service.TravelBookingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TravelBookingServiceImpl implements TravelBookingService {

    private final TravelBookingRepository bookingRepository;
    private final TravelRequestRepository requestRepository;
    private final TravelBookingMapper mapper;

    /**
     * Self proxy injection for transactional safety.
     * Required to ensure internal method calls respect @Transactional.
     */
    @Lazy
    @Autowired
    @SuppressWarnings("java:S6813")
    private TravelBookingService self;

    // ✅ Avoid duplicated string literals
    private static final String BOOKING_NOT_FOUND_MSG = "Booking not found with id: ";
    private static final String REQUEST_NOT_FOUND_MSG = "Travel Request not found with id: ";

    // ----------------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------------
    @Override
    @Transactional
    public TravelBookingDTO addBooking(UUID requestId, TravelBookingDTO bookingDto) {
        TravelRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException(REQUEST_NOT_FOUND_MSG + requestId));

        TravelBooking booking = mapper.toEntity(bookingDto);
        booking.setTravelRequest(request);

        // ✅ Set sensible defaults
        if (booking.getStatus() == null) booking.setStatus("CONFIRMED");
        if (booking.getCurrency() == null) booking.setCurrency("INR");
        if (booking.getBookingDate() == null) booking.setBookingDate(LocalDateTime.now());

        TravelBooking saved = bookingRepository.save(booking);
        log.info("✅ Booking added successfully: {} for request: {}", saved.getBookingId(), requestId);

        return mapper.toDto(saved);
    }

    // ----------------------------------------------------------------
    // READ
    // ----------------------------------------------------------------
    @Override
    @Transactional(readOnly = true)
    public TravelBookingDTO getBooking(UUID id) {
        return bookingRepository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException(BOOKING_NOT_FOUND_MSG + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelBookingDTO> getBookingsForRequest(UUID requestId) {
        return bookingRepository.findByTravelRequest_TravelRequestId(requestId)
                .stream()
                .map(mapper::toDto)
                .toList(); // ✅ modern Java 16+ method
    }

    // ----------------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------------
    @Override
    @Transactional
    public TravelBookingDTO updateBookingStatus(UUID bookingId, String status) {
        TravelBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(BOOKING_NOT_FOUND_MSG + bookingId));

        booking.setStatus(status);
        TravelBooking updated = bookingRepository.save(booking);
        log.info("🟢 Booking status updated: {} -> {}", bookingId, status);

        return mapper.toDto(updated);
    }

    // ----------------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------------
    @Override
    @Transactional
    public void deleteBooking(UUID bookingId) {
        TravelBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(BOOKING_NOT_FOUND_MSG + bookingId));

        bookingRepository.delete(booking);
        log.info("🗑️ Booking deleted: {}", bookingId);
    }

    // ----------------------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------------------
    @Override
    @Transactional(readOnly = true)
    public BookingSummaryDTO getBookingSummary(UUID requestId) {
        // ✅ Call via proxy self to ensure @Transactional(readOnly) is effective
        List<TravelBookingDTO> bookings = self.getBookingsForRequest(requestId);

        double totalAmount = bookings.stream()
                .filter(b -> b.getBookingAmount() != null)
                .mapToDouble(TravelBookingDTO::getBookingAmount)
                .sum();

        return BookingSummaryDTO.builder()
                .travelRequestId(requestId)
                .totalBookings(bookings.size())
                .totalBookingAmount(totalAmount)
                .bookings(bookings)
                .build();
    }

    // ----------------------------------------------------------------
    // AGGREGATE QUERY
    // ----------------------------------------------------------------
    @Override
    @Transactional(readOnly = true)
    public Double getTotalBookingAmount(UUID requestId) {
        return bookingRepository.findByTravelRequest_TravelRequestId(requestId)
                .stream()
                .filter(b -> b.getBookingAmount() != null)
                .mapToDouble(TravelBooking::getBookingAmount)
                .sum();
    }
}
