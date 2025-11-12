package com.bwc.travel_request_management.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.travel_request_management.dto.DailyExpenseSummaryDTO;
import com.bwc.travel_request_management.dto.ExpenseBillDTO;
import com.bwc.travel_request_management.dto.ExpenseBreakdownDTO;
import com.bwc.travel_request_management.dto.TravelBookingDTO;
import com.bwc.travel_request_management.dto.TravelExpenseSummaryDTO;
import com.bwc.travel_request_management.entity.TravelRequest;
import com.bwc.travel_request_management.exception.ResourceNotFoundException;
import com.bwc.travel_request_management.repository.TravelRequestRepository;
import com.bwc.travel_request_management.service.ExpenseBillService;
import com.bwc.travel_request_management.service.ExpenseTrackingService;
import com.bwc.travel_request_management.service.TravelBookingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseTrackingServiceImpl implements ExpenseTrackingService {

    private final TravelRequestRepository travelRequestRepository;
    private final TravelBookingService travelBookingService;
    
    @Lazy
    @Autowired
    private ExpenseBillService expenseBillService;
    
    @Override
    @Transactional(readOnly = true)
    public TravelExpenseSummaryDTO getExpenseSummary(UUID travelRequestId) {
        TravelRequest travelRequest = travelRequestRepository.findById(travelRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel request not found: " + travelRequestId));

        // Calculate totals
        BigDecimal totalExpenses = calculateTotalExpenses(travelRequestId);
        BigDecimal totalBookings = calculateTotalBookings(travelRequestId);
        
        // ✅ FIXED: Grand total includes both for reporting purposes
        BigDecimal grandTotal = totalExpenses.add(totalBookings);
        
        BigDecimal advanceTaken = travelRequest.getAdvancedMoneyTaken() != null ? 
                                travelRequest.getAdvancedMoneyTaken() : BigDecimal.ZERO;
        
        // ✅ FIXED: Balance should ONLY consider expenses (not bookings)
        // Company pays for bookings, employee pays for expenses
        BigDecimal balanceAmount = totalExpenses.subtract(advanceTaken);

        // Get daily summaries
        List<DailyExpenseSummaryDTO> dailySummaries = getDailyExpenseSummaries(travelRequestId, 
                travelRequest.getStartDate(), travelRequest.getEndDate());

        // Get expense breakdown
        ExpenseBreakdownDTO breakdown = getExpenseBreakdown(travelRequestId);

        return TravelExpenseSummaryDTO.builder()
                .travelRequestId(travelRequestId)
                .totalExpenses(totalExpenses)
                .totalBookings(totalBookings)
                .grandTotal(grandTotal)
                .advanceTaken(advanceTaken)
                .balanceAmount(balanceAmount) // Now only expenses - advance
                .dailySummaries(dailySummaries)
                .breakdown(breakdown)
                .build();
    }

    @Override
    @Transactional
    public void updateTravelRequestTotals(UUID travelRequestId) {
        TravelRequest travelRequest = travelRequestRepository.findById(travelRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel request not found: " + travelRequestId));

        BigDecimal totalExpenses = calculateTotalExpenses(travelRequestId);
        BigDecimal totalBookings = calculateTotalBookings(travelRequestId);
        
        // ✅ FIXED: Store only expenses in totalTravelExpense since balance is for employee expenses
        travelRequest.setTotalTravelExpense(totalExpenses);
        
        travelRequestRepository.save(travelRequest);
        
        log.info("Updated travel request totals: Request={}, Expenses={}, Bookings={}, Employee Balance={}", 
                travelRequestId, totalExpenses, totalBookings, totalExpenses);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalExpenses(UUID travelRequestId) {
        List<ExpenseBillDTO> approvedBills = expenseBillService.getBillsByTravelRequest(travelRequestId)
                .stream()
                .filter(ExpenseBillDTO::isApproved)
                .toList();

        return approvedBills.stream()
                .map(ExpenseBillDTO::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalBookings(UUID travelRequestId) {
        List<TravelBookingDTO> bookings = travelBookingService.getBookingsForRequest(travelRequestId);
        
        return bookings.stream()
                .map(booking -> booking.getBookingAmount() != null ? 
                    BigDecimal.valueOf(booking.getBookingAmount()) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<DailyExpenseSummaryDTO> getDailyExpenseSummaries(UUID travelRequestId, 
                                                                LocalDate startDate, 
                                                                LocalDate endDate) {
        List<DailyExpenseSummaryDTO> dailySummaries = new ArrayList<>();
        
        // Get all approved expense bills
        List<ExpenseBillDTO> approvedBills = expenseBillService.getBillsByTravelRequest(travelRequestId)
                .stream()
                .filter(ExpenseBillDTO::isApproved)
                .toList();

        // Get all bookings
        List<TravelBookingDTO> bookings = travelBookingService.getBookingsForRequest(travelRequestId);

        // Create daily summaries for each day in the travel period
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            final LocalDate date = currentDate;
            
            // Filter expenses for this specific day
            List<ExpenseBillDTO> dailyExpenses = approvedBills.stream()
                    .filter(expense -> date.equals(expense.getBillDate()))
                    .toList();

            // Filter bookings for this specific day
            List<TravelBookingDTO> dailyBookings = bookings.stream()
                    .filter(booking -> isBookingOnDate(booking, date))
                    .toList();

            // Calculate daily total
            BigDecimal expensesTotal = dailyExpenses.stream()
                    .map(ExpenseBillDTO::getAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal bookingsTotal = dailyBookings.stream()
                    .map(booking -> booking.getBookingAmount() != null ? 
                        BigDecimal.valueOf(booking.getBookingAmount()) : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal dailyTotal = expensesTotal.add(bookingsTotal);

            dailySummaries.add(DailyExpenseSummaryDTO.builder()
                    .date(date)
                    .dailyTotal(dailyTotal)
                    .expenses(dailyExpenses)
                    .bookings(dailyBookings)
                    .build());

            currentDate = currentDate.plusDays(1);
        }

        return dailySummaries;
    }

    private ExpenseBreakdownDTO getExpenseBreakdown(UUID travelRequestId) {
        List<ExpenseBillDTO> approvedBills = expenseBillService.getBillsByTravelRequest(travelRequestId)
                .stream()
                .filter(ExpenseBillDTO::isApproved)
                .toList();

        BigDecimal accommodationTotal = BigDecimal.ZERO;
        BigDecimal foodTotal = BigDecimal.ZERO;
        BigDecimal transportTotal = BigDecimal.ZERO;
        BigDecimal flightTotal = BigDecimal.ZERO;
        BigDecimal otherTotal = BigDecimal.ZERO;

        for (ExpenseBillDTO bill : approvedBills) {
            BigDecimal amount = bill.getAmount() != null ? bill.getAmount() : BigDecimal.ZERO;
            
            switch (bill.getExpenseCategory().toUpperCase()) {
                case "ACCOMMODATION":
                    accommodationTotal = accommodationTotal.add(amount);
                    break;
                case "FOOD_MEALS":
                    foodTotal = foodTotal.add(amount);
                    break;
                case "LOCAL_TRANSPORT", "CAR_RENTAL", "FUEL", "PARKING", "TOLL":
                    transportTotal = transportTotal.add(amount);
                    break;
                case "AIR_TRAVEL", "TRAIN_TRAVEL":
                    flightTotal = flightTotal.add(amount);
                    break;
                default:
                    otherTotal = otherTotal.add(amount);
                    break;
            }
        }

        return ExpenseBreakdownDTO.builder()
                .accommodationTotal(accommodationTotal)
                .foodTotal(foodTotal)
                .transportTotal(transportTotal)
                .flightTotal(flightTotal)
                .otherTotal(otherTotal)
                .build();
    }

    private boolean isBookingOnDate(TravelBookingDTO booking, LocalDate date) {
        // Implement logic to determine if booking is for this date
        return booking.getBookingDate() != null && 
               booking.getBookingDate().toLocalDate().equals(date);
    }
}