package com.bwc.travel_request_management.repository;

import com.bwc.travel_request_management.entity.TravelBooking;
import com.bwc.travel_request_management.entity.TravelRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TravelBookingRepository extends JpaRepository<TravelBooking, UUID> {

    List<TravelBooking> findByTravelRequest_TravelRequestId(UUID requestId);
    
    Page<TravelBooking> findByTravelRequest_TravelRequestId(UUID requestId, Pageable pageable);
    
    boolean existsByTravelRequestAndBookingReference(TravelRequest request, String bookingReference);
    
    Long countByTravelRequest_TravelRequestId(UUID requestId);
    
    @Query("SELECT COALESCE(SUM(b.bookingAmount), 0) FROM TravelBooking b WHERE b.travelRequest.travelRequestId = :requestId AND b.bookingAmount IS NOT NULL")
    Double calculateTotalAmountByRequestId(@Param("requestId") UUID requestId);
    
    @Query("SELECT b FROM TravelBooking b WHERE b.travelRequest.travelRequestId = :requestId AND b.status = :status")
    List<TravelBooking> findByRequestIdAndStatus(@Param("requestId") UUID requestId, 
                                               @Param("status") String status);
    
    @Query("SELECT b FROM TravelBooking b WHERE b.travelRequest.travelRequestId = :requestId AND b.bookingAmount > :minAmount")
    List<TravelBooking> findByRequestIdAndMinAmount(@Param("requestId") UUID requestId, 
                                                  @Param("minAmount") Double minAmount);
}