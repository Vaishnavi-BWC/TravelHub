package com.bwc.approval_workflow_service.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bwc.approval_workflow_service.dto.ApprovalHistoryDTO;
import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
import com.bwc.approval_workflow_service.exception.AuthenticationException;
import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/finance/approvals")
@RequiredArgsConstructor
@Tag(name = "Finance Approvals", description = "Finance team approval workflows")
public class FinanceApprovalController {

    private final ApprovalWorkflowService workflowService;

    @Operation(summary = "Get pending approvals for Finance")
    @GetMapping("/pending")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<List<ApprovalWorkflowDTO>> getPendingApprovals() {
        return ResponseEntity.ok(workflowService.getPendingApprovalsByRole("FINANCE"));
    }

    @Operation(summary = "Process Finance approval")
    @PostMapping("/{workflowId}/action")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<ApprovalWorkflowDTO> takeFinanceAction(
            @PathVariable UUID workflowId,
            @RequestBody ApprovalRequestDTO approvalRequest,
            HttpServletRequest request) {
        
        String financeIdHeader = request.getHeader("X-User-Id");
        UUID financeId = financeIdHeader != null ? UUID.fromString(financeIdHeader) : null;
        
        approvalRequest.setWorkflowId(workflowId);
        approvalRequest.setApproverRole("FINANCE");
        approvalRequest.setApproverId(financeId);
        
        return ResponseEntity.ok(workflowService.processApproval(approvalRequest));
    }

    @Operation(summary = "Get Finance approval history")
    @GetMapping("/history")
    @PreAuthorize("hasRole('FINANCE')")
    public ResponseEntity<List<ApprovalHistoryDTO>> getFinanceApprovalHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpServletRequest request) {

        String financeIdHeader = request.getHeader("X-User-Id");
        if (financeIdHeader == null) {
            throw new AuthenticationException("Finance ID not found in request headers");
        }
        
        UUID financeId = UUID.fromString(financeIdHeader);
        List<ApprovalHistoryDTO> history = workflowService.getApprovalHistory(financeId, startDate, endDate);

        return ResponseEntity.ok(history);
    }
}