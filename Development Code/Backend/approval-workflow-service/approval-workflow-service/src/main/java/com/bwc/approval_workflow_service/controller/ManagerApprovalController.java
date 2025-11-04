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

import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
import com.bwc.approval_workflow_service.dto.ApprovalHistoryDTO;
import com.bwc.approval_workflow_service.exception.AuthenticationException;
import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerApprovalController {

    private final ApprovalWorkflowService workflowService;

    @GetMapping("/approvals/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<ApprovalWorkflowDTO>> getPendingApprovals(
            HttpServletRequest request) {

        // Extract manager ID from security context (set by gateway)
        String managerIdHeader = request.getHeader("X-User-Id");
        if (managerIdHeader == null) {
            throw new AuthenticationException("Manager ID not found in request headers");
        }
        
        UUID managerId = UUID.fromString(managerIdHeader);
        List<ApprovalWorkflowDTO> approvals = workflowService.getPendingApprovals("MANAGER", managerId);

        return ResponseEntity.ok(approvals);
    }

    @PostMapping("/approvals/{workflowId}/action")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApprovalWorkflowDTO> takeManagerAction(
            @PathVariable UUID workflowId,
            @RequestBody ApprovalRequestDTO approvalRequest,
            HttpServletRequest request) {

        // Extract manager ID from security context (set by gateway)
        String managerIdHeader = request.getHeader("X-User-Id");
        if (managerIdHeader == null) {
            throw new AuthenticationException("Manager ID not found in request headers");
        }
        
        UUID managerId = UUID.fromString(managerIdHeader);
        
        approvalRequest.setWorkflowId(workflowId);
        approvalRequest.setApproverRole("MANAGER");
        approvalRequest.setApproverId(managerId);
        
        return ResponseEntity.ok(workflowService.processApproval(approvalRequest));
    }
    
    @GetMapping("/approvals/history")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<ApprovalHistoryDTO>> getManagerApprovalHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            HttpServletRequest request) {
        
        String managerIdHeader = request.getHeader("X-User-Id");
        if (managerIdHeader == null) {
            throw new AuthenticationException("Manager ID not found in request headers");
        }
        
        UUID managerId = UUID.fromString(managerIdHeader);
        List<ApprovalHistoryDTO> history = workflowService.getApprovalHistory(managerId, startDate, endDate);
        
        return ResponseEntity.ok(history);
    }
}