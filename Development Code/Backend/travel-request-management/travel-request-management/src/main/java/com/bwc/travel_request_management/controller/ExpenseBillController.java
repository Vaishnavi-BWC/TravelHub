package com.bwc.travel_request_management.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bwc.travel_request_management.client.WorkflowServiceClient;
import com.bwc.travel_request_management.dto.ExpenseBillDTO;
import com.bwc.travel_request_management.dto.ExpenseBillSummaryDTO;
import com.bwc.travel_request_management.entity.ExpenseBill;
import com.bwc.travel_request_management.service.ExpenseBillService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/expense-bills")
@RequiredArgsConstructor
@Validated
@Tag(name = "Expense Bill Management", description = "Manage expense bills for travel reimbursement")
public class ExpenseBillController {

    private final ExpenseBillService expenseBillService;
    private final WorkflowServiceClient workflowServiceClient;

    @Operation(summary = "Upload expense bill")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExpenseBillDTO> uploadExpenseBill(
            @RequestParam("travelRequestId") UUID travelRequestId,
            @RequestParam("workflowId") UUID workflowId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") UUID employeeId,
            @RequestParam("billDate") String billDate,
            @RequestParam("expenseCategory") String expenseCategory,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("amount") String amountStr,
            @RequestParam(value = "currency", required = false, defaultValue = "INR") String currency) {

        log.info("Uploading expense bill for travel request: {}, workflow: {}, employee: {}", 
                travelRequestId, workflowId, employeeId);

        BigDecimal amount;
        try {
            amount = new BigDecimal(amountStr);
        } catch (NumberFormatException e) {
            log.error("Invalid amount value: {}", amountStr);
            return ResponseEntity.badRequest().build();
        }

        ExpenseBillDTO billDTO = ExpenseBillDTO.builder()
                .travelRequestId(travelRequestId)
                .workflowId(workflowId)
                .employeeId(employeeId)
                .billDate(java.time.LocalDate.parse(billDate))
                .expenseCategory(expenseCategory)
                .description(description)
                .amount(amount)
                .currency(currency)
                .build();

        ExpenseBillDTO uploadedBill = expenseBillService.uploadExpenseBill(
                travelRequestId, workflowId, employeeId, file, billDTO);

        return ResponseEntity.ok(uploadedBill);
    }


    @Operation(summary = "Get expense bill by ID")
    @GetMapping("/{billId}")
    public ResponseEntity<ExpenseBillDTO> getExpenseBill(
            @Parameter(description = "Expense Bill ID") @PathVariable UUID billId) {

        return ResponseEntity.ok(expenseBillService.getBill(billId));
    }

    @Operation(summary = "Get all expense bills for a travel request")
    @GetMapping("/travel-request/{travelRequestId}")
    public ResponseEntity<List<ExpenseBillDTO>> getBillsByTravelRequest(
            @Parameter(description = "Travel Request ID") @PathVariable UUID travelRequestId) {

        return ResponseEntity.ok(expenseBillService.getBillsByTravelRequest(travelRequestId));
    }

    @Operation(summary = "Get all expense bills for a workflow")
    @GetMapping("/workflow/{workflowId}")
    public ResponseEntity<List<ExpenseBillDTO>> getBillsByWorkflow(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {

        return ResponseEntity.ok(expenseBillService.getBillsByWorkflow(workflowId));
    }

    @Operation(summary = "Get expense bill summary for workflow")
    @GetMapping("/workflow/{workflowId}/summary")
    public ResponseEntity<ExpenseBillSummaryDTO> getExpenseBillSummary(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId) {

        return ResponseEntity.ok(expenseBillService.getExpenseBillSummary(workflowId));
    }


    @Operation(summary = "Update expense bill status (for approvers)")
    @PatchMapping("/{billId}/status")
    public ResponseEntity<ExpenseBillDTO> updateBillStatus(
            @Parameter(description = "Expense Bill ID") @PathVariable UUID billId,
            @RequestParam ExpenseBill.BillStatus status,
            @RequestParam(required = false) String verificationNotes,
            @RequestHeader("X-User-Id") UUID verifiedBy) {

        log.info("Updating bill {} status to {} by user {}", billId, status, verifiedBy);
        return ResponseEntity.ok(expenseBillService.updateBillStatus(
                billId, status, verificationNotes, verifiedBy));
    }

    @Operation(summary = "Download expense bill")
    @GetMapping("/{billId}/download")
    public ResponseEntity<Resource> downloadExpenseBill(
            @Parameter(description = "Expense Bill ID") @PathVariable UUID billId) {

        Resource resource = expenseBillService.downloadBill(billId);
        ExpenseBillDTO bill = expenseBillService.getBill(billId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(bill.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + bill.getOriginalFileName() + "\"")
                .body(resource);
    }

    @Operation(summary = "View expense bill inline")
    @GetMapping("/{billId}/view")
    public ResponseEntity<Resource> viewExpenseBill(
            @Parameter(description = "Expense Bill ID") @PathVariable UUID billId) {

        Resource resource = expenseBillService.downloadBill(billId);
        ExpenseBillDTO bill = expenseBillService.getBill(billId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(bill.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @Operation(summary = "Delete expense bill")
    @DeleteMapping("/{billId}")
    public ResponseEntity<Void> deleteExpenseBill(
            @Parameter(description = "Expense Bill ID") @PathVariable UUID billId) {

        expenseBillService.deleteBill(billId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/travel-request/{travelRequestId}/total-approved")
    public ResponseEntity<BigDecimal> getTotalApprovedAmount(
            @Parameter(description = "Travel Request ID") @PathVariable UUID travelRequestId) {

        return ResponseEntity.ok(expenseBillService.getTotalApprovedAmount(travelRequestId));
    }


    @Operation(summary = "Get pending bills count for travel request")
    @GetMapping("/travel-request/{travelRequestId}/pending-count")
    public ResponseEntity<Long> getPendingBillsCount(
            @Parameter(description = "Travel Request ID") @PathVariable UUID travelRequestId) {

        return ResponseEntity.ok(expenseBillService.getPendingBillsCount(travelRequestId));
    }

    @Operation(summary = "Get available expense categories")
    @GetMapping("/categories")
    public ResponseEntity<List<ExpenseBill.ExpenseCategory>> getExpenseCategories() {
        return ResponseEntity.ok(expenseBillService.getExpenseCategories());
    }
    
    @Operation(summary = "Submit bills for review and progress workflow to Travel Desk")
    @PostMapping("/workflow/{workflowId}/submit")
    public ResponseEntity<Void> submitBillsForReview(
            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId,
            @RequestHeader("X-User-Id") UUID employeeId) {

        // Check if there are any bills to submit
        if (!expenseBillService.hasPendingBills(workflowId)) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Bills submitted for review for workflow: {} by employee: {}", workflowId, employeeId);
        
        try {
            // Call workflow service to progress to Travel Desk for bill review
            workflowServiceClient.progressToTravelDeskReview(workflowId, employeeId, "BILLS_SUBMITTED_FOR_REVIEW");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to progress workflow to Travel Desk after bill submission: {}", workflowId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}