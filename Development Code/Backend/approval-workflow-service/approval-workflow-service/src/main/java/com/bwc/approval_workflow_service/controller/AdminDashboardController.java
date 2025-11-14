package com.bwc.approval_workflow_service.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bwc.approval_workflow_service.dto.ActionHistoryDTO;
import com.bwc.approval_workflow_service.dto.AdminDashboardSummaryDTO;
import com.bwc.approval_workflow_service.dto.ExceptionDTO;
import com.bwc.approval_workflow_service.dto.PendingApprovalDTO;
import com.bwc.approval_workflow_service.dto.WorkflowDetailDTO;
import com.bwc.approval_workflow_service.dto.WorkflowStatusCountDTO;
import com.bwc.approval_workflow_service.service.AdminDashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Dashboard", description = "Administrator Dashboard APIs - Full System Access")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get comprehensive admin dashboard summary")
    public ResponseEntity<AdminDashboardSummaryDTO> getAdminDashboardSummary() {
        try {
            UserContext userContext = getCurrentUserContext();
            log.info("👑 Admin dashboard access - User: {}, Role: {}", userContext.getUserId(), userContext.getUserRole());
            
            AdminDashboardSummaryDTO summary = adminDashboardService.getAdminDashboardSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("❌ Error fetching admin dashboard summary", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/workflows/status-counts")
    @Operation(summary = "Get workflow counts by status for all roles")
    public ResponseEntity<List<WorkflowStatusCountDTO>> getWorkflowStatusCounts() {
        try {
            List<WorkflowStatusCountDTO> statusCounts = adminDashboardService.getWorkflowStatusCountsByRole();
            return ResponseEntity.ok(statusCounts);
        } catch (Exception e) {
            log.error("Error fetching workflow status counts", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pending-approvals/all")
    @Operation(summary = "Get all pending approvals across all roles")
    public ResponseEntity<List<PendingApprovalDTO>> getAllPendingApprovals() {
        try {
            List<PendingApprovalDTO> pendingApprovals = adminDashboardService.getAllPendingApprovals();
            return ResponseEntity.ok(pendingApprovals);
        } catch (Exception e) {
            log.error("Error fetching all pending approvals", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pending-approvals/role/{role}")
    @Operation(summary = "Get pending approvals for specific role")
    public ResponseEntity<List<PendingApprovalDTO>> getPendingApprovalsByRole(@PathVariable String role) {
        try {
            List<PendingApprovalDTO> pendingApprovals = adminDashboardService.getPendingApprovalsByRole(role);
            return ResponseEntity.ok(pendingApprovals);
        } catch (Exception e) {
            log.error("Error fetching pending approvals for role: {}", role, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/action-history/all")
    @Operation(summary = "Get complete action history across all workflows")
    public ResponseEntity<List<ActionHistoryDTO>> getAllActionHistory(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            List<ActionHistoryDTO> actionHistory = adminDashboardService.getAllActionHistory(limit);
            return ResponseEntity.ok(actionHistory);
        } catch (Exception e) {
            log.error("Error fetching all action history", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/exceptions/all")
    @Operation(summary = "Get all exceptions in the system")
    public ResponseEntity<List<ExceptionDTO>> getAllExceptions() {
        try {
            List<ExceptionDTO> exceptions = adminDashboardService.getAllExceptions();
            return ResponseEntity.ok(exceptions);
        } catch (Exception e) {
            log.error("Error fetching all exceptions", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/exceptions/role/{role}")
    @Operation(summary = "Get exceptions by role")
    public ResponseEntity<List<ExceptionDTO>> getExceptionsByRole(@PathVariable String role) {
        try {
            List<ExceptionDTO> exceptions = adminDashboardService.getExceptionsByRole(role);
            return ResponseEntity.ok(exceptions);
        } catch (Exception e) {
            log.error("Error fetching exceptions for role: {}", role, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/workflows")
    @Operation(summary = "Get all workflows in the system")
    public ResponseEntity<List<WorkflowDetailDTO>> getAllWorkflows(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<WorkflowDetailDTO> workflows = adminDashboardService.getAllWorkflows(page, size);
            return ResponseEntity.ok(workflows);
        } catch (Exception e) {
            log.error("Error fetching all workflows", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/workflows/search")
    @Operation(summary = "Search workflows by various criteria")
    public ResponseEntity<List<WorkflowDetailDTO>> searchWorkflows(
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String workflowType,
            @RequestParam(required = false) String department) {
        try {
            List<WorkflowDetailDTO> workflows = adminDashboardService.searchWorkflows(
                    employeeName, status, workflowType, department);
            return ResponseEntity.ok(workflows);
        } catch (Exception e) {
            log.error("Error searching workflows", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/workflows/{workflowId}/admin")
    @Operation(summary = "Get detailed workflow information (admin view)")
    public ResponseEntity<WorkflowDetailDTO> getWorkflowDetailAdmin(@PathVariable UUID workflowId) {
        try {
            WorkflowDetailDTO workflowDetail = adminDashboardService.getWorkflowDetailAdmin(workflowId);
            return ResponseEntity.ok(workflowDetail);
        } catch (Exception e) {
            log.error("Error fetching workflow detail for admin: {}", workflowId, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/statistics/role-performance")
    @Operation(summary = "Get performance statistics by role")
    public ResponseEntity<Map<String, Object>> getRolePerformanceStatistics() {
        try {
            Map<String, Object> stats = adminDashboardService.getRolePerformanceStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching role performance statistics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/statistics/processing-times")
    @Operation(summary = "Get average processing times by role and workflow type")
    public ResponseEntity<Map<String, Object>> getProcessingTimeStatistics() {
        try {
            Map<String, Object> stats = adminDashboardService.getProcessingTimeStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching processing time statistics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/system-health")
    @Operation(summary = "Get system health and metrics")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            UserContext userContext = getCurrentUserContext();
            Map<String, Object> health = adminDashboardService.getSystemHealth();
            health.put("checkedBy", userContext.getUserId());
            health.put("checkedAt", LocalDateTime.now());
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Error fetching system health", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper method to extract user context from security context
    private UserContext getCurrentUserContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("User not authenticated");
        }

        String userId = authentication.getPrincipal().toString();
        String userRole = authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElseThrow(() -> new SecurityException("No role found for user"));

        return new UserContext(UUID.fromString(userId), userRole);
    }

    // Inner class for user context
    private static class UserContext {
        private final UUID userId;
        private final String userRole;

        public UserContext(UUID userId, String userRole) {
            this.userId = userId;
            this.userRole = userRole;
        }

        public UUID getUserId() { return userId; }
        public String getUserRole() { return userRole; }
    }
}