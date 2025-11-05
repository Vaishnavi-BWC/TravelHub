package com.bwc.travel_request_management.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.bwc.travel_request_management.dto.ExpenseBillDTO;
import com.bwc.travel_request_management.dto.ExpenseBillSummaryDTO;
import com.bwc.travel_request_management.entity.ExpenseBill;

public interface ExpenseBillService {
    
    ExpenseBillDTO uploadExpenseBill(UUID travelRequestId, UUID workflowId, UUID employeeId,
                                    MultipartFile file, ExpenseBillDTO billDTO);
    
    ExpenseBillDTO getBill(UUID billId);
    List<ExpenseBillDTO> getBillsByTravelRequest(UUID travelRequestId);
    List<ExpenseBillDTO> getBillsByWorkflow(UUID workflowId);
    List<ExpenseBillDTO> getBillsByEmployee(UUID employeeId);
    
    ExpenseBillDTO updateBillStatus(UUID billId, ExpenseBill.BillStatus status, 
                                   String verificationNotes, UUID verifiedBy);
    
    void deleteBill(UUID billId);
    Resource downloadBill(UUID billId);
    
    BigDecimal  getTotalApprovedAmount(UUID travelRequestId);
    Long getPendingBillsCount(UUID travelRequestId);
    
    ExpenseBillDTO updateBillDetails(UUID billId, ExpenseBillDTO billDTO);
    
    List<ExpenseBill.ExpenseCategory> getExpenseCategories();
    
    ExpenseBillSummaryDTO getExpenseBillSummary(UUID workflowId);
    
    boolean hasPendingBills(UUID workflowId);
}