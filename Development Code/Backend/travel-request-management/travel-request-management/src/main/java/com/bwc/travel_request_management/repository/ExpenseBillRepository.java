package com.bwc.travel_request_management.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bwc.travel_request_management.entity.ExpenseBill;

@Repository
public interface ExpenseBillRepository extends JpaRepository<ExpenseBill, UUID> {
    
    List<ExpenseBill> findByTravelRequestId(UUID travelRequestId);
    List<ExpenseBill> findByWorkflowId(UUID workflowId);
    List<ExpenseBill> findByEmployeeId(UUID employeeId);
    List<ExpenseBill> findByTravelRequestIdAndExpenseCategory(UUID travelRequestId, String expenseCategory);
    
    @Query("SELECT SUM(eb.amount) FROM ExpenseBill eb WHERE eb.travelRequestId = :travelRequestId AND eb.billStatus = 'APPROVED'")
    BigDecimal calculateTotalApprovedAmountByRequest(@Param("travelRequestId") UUID travelRequestId);
    
    @Query("SELECT COUNT(eb) FROM ExpenseBill eb WHERE eb.travelRequestId = :travelRequestId AND eb.billStatus = 'PENDING'")
    Long countPendingBillsByRequest(@Param("travelRequestId") UUID travelRequestId);
    
    @Query("SELECT eb FROM ExpenseBill eb WHERE eb.workflowId = :workflowId AND eb.billStatus = :status")
    List<ExpenseBill> findByWorkflowIdAndStatus(@Param("workflowId") UUID workflowId, 
                                               @Param("status") ExpenseBill.BillStatus status);
    
    boolean existsByTravelRequestIdAndFileName(UUID travelRequestId, String fileName);
}