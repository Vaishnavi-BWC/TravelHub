package com.bwc.approval_workflow_service.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bwc.approval_workflow_service.dto.ActionHistoryDTO;
import com.bwc.approval_workflow_service.dto.DashboardOverviewDTO;
import com.bwc.approval_workflow_service.dto.DashboardSummaryDTO;
import com.bwc.approval_workflow_service.dto.ExceptionDTO;
import com.bwc.approval_workflow_service.dto.PendingApprovalDTO;
import com.bwc.approval_workflow_service.dto.WorkflowDetailDTO;
import com.bwc.approval_workflow_service.dto.WorkflowExceptionSummaryDTO;
import com.bwc.approval_workflow_service.service.DashboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Stakeholder Dashboard APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary for logged-in user")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        try {
            UserContext userContext = getCurrentUserContext();
            DashboardSummaryDTO summary = dashboardService.getDashboardSummary(
                userContext.getUserId(), 
                userContext.getUserRole()
            );
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error fetching dashboard summary", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pending-approvals")
    @Operation(summary = "Get pending approvals for logged-in user")
    public ResponseEntity<List<PendingApprovalDTO>> getPendingApprovals() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<PendingApprovalDTO> pendingApprovals = dashboardService.getPendingApprovals(
                userContext.getUserRole()
            );
            return ResponseEntity.ok(pendingApprovals);
        } catch (Exception e) {
            log.error("Error fetching pending approvals", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/action-history")
    @Operation(summary = "Get action history for logged-in user")
    public ResponseEntity<List<ActionHistoryDTO>> getActionHistory() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<ActionHistoryDTO> actionHistory = dashboardService.getActionHistory(
                userContext.getUserId()
            );
            return ResponseEntity.ok(actionHistory);
        } catch (Exception e) {
            log.error("Error fetching action history", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/role-actions")
    @Operation(summary = "Get recent actions for user's role")
    public ResponseEntity<List<ActionHistoryDTO>> getRoleActionHistory() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<ActionHistoryDTO> roleActions = dashboardService.getRoleActionHistory(
                userContext.getUserRole()
            );
            return ResponseEntity.ok(roleActions);
        } catch (Exception e) {
            log.error("Error fetching role action history", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-exceptions")
    @Operation(summary = "Get exceptions raised by logged-in user")
    public ResponseEntity<List<ExceptionDTO>> getMyExceptions() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<ExceptionDTO> exceptions = dashboardService.getRaisedExceptions(
                userContext.getUserId()
            );
            return ResponseEntity.ok(exceptions);
        } catch (Exception e) {
            log.error("Error fetching user exceptions", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    
    @GetMapping("/workflows/with-exceptions/pending")
    @Operation(
        summary = "Get pending workflows containing exceptions for logged-in stakeholder",
        description = "Fetches all pending workflows that contain exceptions and are assigned to the logged-in stakeholder's role."
    )
    public ResponseEntity<?> getPendingWorkflowsWithExceptions() {
        try {
            UserContext userContext = getCurrentUserContext();
            String userRole = userContext.getUserRole();

            log.info("📄 Fetching pending workflows with exceptions for role: {}", userRole);

            List<WorkflowExceptionSummaryDTO> workflows = dashboardService.getPendingWorkflowsWithExceptionsByRole(userRole);

            if (workflows.isEmpty()) {
                return ResponseEntity.ok().body(Map.of(
                    "message", "No pending workflows with exceptions found for your role",
                    "role", userRole,
                    "count", 0,
                    "timestamp", LocalDateTime.now()
                ));
            }

            return ResponseEntity.ok(Map.of(
                "workflows", workflows,
                "count", workflows.size(),
                "role", userRole,
                "timestamp", LocalDateTime.now()
            ));

        } catch (SecurityException e) {
            log.warn("🔒 Unauthorized access attempt: {}", e.getMessage());
            return ResponseEntity.status(403).body(Map.of(
                "error", "Unauthorized",
                "message", "User not authenticated or missing role"
            ));
        } catch (Exception e) {
            log.error("💥 Error fetching workflows with exceptions: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                        "error", "Server Error", 
                        "message", "Failed to fetch workflows with exceptions",
                        "timestamp", LocalDateTime.now()
                    ));
        }
    }


    @GetMapping("/role-exceptions")
    @Operation(summary = "Get exceptions for user's role")
    public ResponseEntity<List<ExceptionDTO>> getRoleExceptions() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<ExceptionDTO> exceptions = dashboardService.getExceptionsByRole(
                userContext.getUserRole()
            );
            return ResponseEntity.ok(exceptions);
        } catch (Exception e) {
            log.error("Error fetching role exceptions", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/awaiting-clarification")
    @Operation(summary = "Get requests awaiting clarification")
    public ResponseEntity<List<PendingApprovalDTO>> getAwaitingClarification() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<PendingApprovalDTO> clarificationRequests = dashboardService.getAwaitingClarification(
                userContext.getUserRole()
            );
            return ResponseEntity.ok(clarificationRequests);
        } catch (Exception e) {
            log.error("Error fetching awaiting clarification requests", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/returned-requests")
    @Operation(summary = "Get returned requests")
    public ResponseEntity<List<PendingApprovalDTO>> getReturnedRequests() {
        try {
            UserContext userContext = getCurrentUserContext();
            List<PendingApprovalDTO> returnedRequests = dashboardService.getReturnedRequests(
                userContext.getUserRole()
            );
            return ResponseEntity.ok(returnedRequests);
        } catch (Exception e) {
            log.error("Error fetching returned requests", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/workflows/{workflowId}")
    @Operation(summary = "Get detailed workflow information")
    public ResponseEntity<WorkflowDetailDTO> getWorkflowDetail(@PathVariable UUID workflowId) {
        try {
            WorkflowDetailDTO workflowDetail = dashboardService.getWorkflowDetail(workflowId);
            return ResponseEntity.ok(workflowDetail);
        } catch (Exception e) {
            log.error("Error fetching workflow detail for: {}", workflowId, e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/workflows/{workflowId}/actions")
    @Operation(summary = "Get action history for specific workflow")
    public ResponseEntity<List<ActionHistoryDTO>> getWorkflowActions(@PathVariable UUID workflowId) {
        try {
            List<ActionHistoryDTO> actions = dashboardService.getWorkflowActionHistory(workflowId);
            return ResponseEntity.ok(actions);
        } catch (Exception e) {
            log.error("Error fetching workflow actions for: {}", workflowId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/workflows/{workflowId}/exceptions")
    @Operation(summary = "Get exceptions for specific workflow")
    public ResponseEntity<List<ExceptionDTO>> getWorkflowExceptions(@PathVariable UUID workflowId) {
        try {
            List<ExceptionDTO> exceptions = dashboardService.getWorkflowExceptions(workflowId);
            return ResponseEntity.ok(exceptions);
        } catch (Exception e) {
            log.error("Error fetching workflow exceptions for: {}", workflowId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/overview")
    @Operation(summary = "Get complete dashboard overview for logged-in user")
    public ResponseEntity<DashboardOverviewDTO> getDashboardOverview() {
        try {
            UserContext userContext = getCurrentUserContext();
            
            DashboardSummaryDTO summary = dashboardService.getDashboardSummary(
                userContext.getUserId(), 
                userContext.getUserRole()
            );
            List<PendingApprovalDTO> pendingApprovals = dashboardService.getPendingApprovals(
                userContext.getUserRole()
            );
            List<ActionHistoryDTO> recentActions = dashboardService.getActionHistory(
                userContext.getUserId()
            ).stream().limit(10).collect(java.util.stream.Collectors.toList());
            List<ExceptionDTO> recentExceptions = dashboardService.getRaisedExceptions(
                userContext.getUserId()
            ).stream().limit(5).collect(java.util.stream.Collectors.toList());

            DashboardOverviewDTO overview = DashboardOverviewDTO.builder()
                    .summary(summary)
                    .pendingApprovals(pendingApprovals)
                    .recentActions(recentActions)
                    .recentExceptions(recentExceptions)
                    .build();

            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            log.error("Error fetching dashboard overview", e);
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

        log.info("🔹 Dashboard access - User ID: {}, Role: {}", userId, userRole);

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