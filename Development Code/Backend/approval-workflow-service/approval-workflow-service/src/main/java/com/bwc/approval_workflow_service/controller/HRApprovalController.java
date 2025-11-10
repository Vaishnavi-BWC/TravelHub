//package com.bwc.approval_workflow_service.controller;
//
//import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalStatsDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalHistoryDTO;
//import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;
//import com.bwc.approval_workflow_service.exception.AuthenticationException;
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
//import org.springframework.format.annotation.DateTimeFormat;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import jakarta.servlet.http.HttpServletRequest;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/api/hr/approvals")
//@RequiredArgsConstructor
//@Tag(name = "HR Approvals", description = "HR approval workflows")
//public class HRApprovalController {
//
//    private final ApprovalWorkflowService workflowService;
//
//    @Operation(summary = "Get pending HR approvals")
//    @GetMapping("/pending")
//    @PreAuthorize("hasRole('HR')")
//    public ResponseEntity<List<ApprovalWorkflowDTO>> getPendingApprovals() {
//        return ResponseEntity.ok(workflowService.getPendingApprovalsByRole("HR"));
//    }
//
//    @Operation(summary = "Process HR approval")
//    @PostMapping("/{workflowId}/action")
//    @PreAuthorize("hasRole('HR')")
//    public ResponseEntity<ApprovalWorkflowDTO> takeHRAction(
//            @PathVariable UUID workflowId,
//            @RequestBody ApprovalRequestDTO approvalRequest,
//            HttpServletRequest request) {
//        
//        String hrIdHeader = request.getHeader("X-User-Id");
//        UUID hrId = hrIdHeader != null ? UUID.fromString(hrIdHeader) : null;
//        
//        approvalRequest.setWorkflowId(workflowId);
//        approvalRequest.setApproverRole("HR");
//        approvalRequest.setApproverId(hrId);
//        
//        return ResponseEntity.ok(workflowService.processApproval(approvalRequest));
//    }
//
//    @Operation(summary = "Get HR approval statistics")
//    @GetMapping("/stats")
//    @PreAuthorize("hasRole('HR')")
//    public ResponseEntity<List<ApprovalStatsDTO>> getApprovalStats(HttpServletRequest request) {
//        String hrIdHeader = request.getHeader("X-User-Id");
//        UUID hrId = hrIdHeader != null ? UUID.fromString(hrIdHeader) : null;
//        return ResponseEntity.ok(workflowService.getApprovalStatsByApprover(hrId));
//    }
//
//    @Operation(summary = "Get HR approval history")
//    @GetMapping("/history")
//    @PreAuthorize("hasRole('HR')")
//    public ResponseEntity<List<ApprovalHistoryDTO>> getHRApprovalHistory(
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
//            HttpServletRequest request) {
//
//        String hrIdHeader = request.getHeader("X-User-Id");
//        if (hrIdHeader == null) {
//            throw new AuthenticationException("HR ID not found in request headers");
//        }
//        
//        UUID hrId = UUID.fromString(hrIdHeader);
//        List<ApprovalHistoryDTO> history = workflowService.getApprovalHistory(hrId, startDate, endDate);
//
//        return ResponseEntity.ok(history);
//    }
//}