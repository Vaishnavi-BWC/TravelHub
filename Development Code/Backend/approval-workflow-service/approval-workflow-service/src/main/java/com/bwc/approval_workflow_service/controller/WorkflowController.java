//package com.bwc.approval_workflow_service.controller;
//
//import java.util.List;
//import java.util.UUID;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.bwc.approval_workflow_service.dto.ApprovalActionDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
//import com.bwc.approval_workflow_service.dto.TravelRequestProxyDTO;
//import com.bwc.approval_workflow_service.dto.WorkflowMetricsDTO;
//import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;
//
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.Parameter;
//import io.swagger.v3.oas.annotations.media.Schema;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import jakarta.validation.constraints.NotNull;
//import lombok.Data;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//@Slf4j
//@RestController
//@RequestMapping("/api/workflows")
//@RequiredArgsConstructor
//@Tag(name = "Workflow Management", description = "APIs for managing approval workflows")
//public class WorkflowController {
//
//    private final ApprovalWorkflowService workflowService;
//
//    // ✅ Initiate Workflow using JSON body instead of query params
//    @PostMapping("/initiate")
//    @Operation(summary = "Initiate a new workflow")
//    public ResponseEntity<ApprovalWorkflowDTO> initiateWorkflow(@RequestBody InitiateWorkflowRequest request) {
//        return ResponseEntity.ok(workflowService.initiateWorkflow(
//                request.getTravelRequestId(),
//                request.getWorkflowType(),
//                request.getEstimatedCost()
//        ));	
//    }
//
//    // ✅ NEW: Optimized workflow initiation with TravelRequest DTO
//    @PostMapping("/initiate-with-travel-request")
//    @Operation(summary = "Initiate workflow with travel request data (optimized)")
//    public ResponseEntity<ApprovalWorkflowDTO> initiateWorkflowWithTravelRequest(
//            @RequestBody TravelRequestProxyDTO travelRequest,
//            @RequestParam String workflowType,
//            @RequestParam(required = false) Double estimatedCost) {
//        return ResponseEntity.ok(workflowService.initiateWorkflow(travelRequest, workflowType, estimatedCost));
//    }
//
//    // ✅ Process Approval
//    @PostMapping("/process-approval")
//    @Operation(summary = "Process an approval action")
//    public ResponseEntity<ApprovalWorkflowDTO> processApproval(@RequestBody ApprovalRequestDTO approvalRequest) {
//        return ResponseEntity.ok(workflowService.processApproval(approvalRequest));
//    }
//
//    // ✅ Upload Booking Details
//    @PostMapping("/{workflowId}/upload-booking")
//    @Operation(summary = "Mark booking as uploaded")
//    public ResponseEntity<ApprovalWorkflowDTO> markBookingUploaded(
//            @PathVariable UUID workflowId,
//            @RequestParam UUID uploadedBy) {
//        return ResponseEntity.ok(workflowService.markBookingUploaded(workflowId, uploadedBy));
//    }
//
//    // ✅ Upload Bills for Post-Travel
//    @PostMapping("/{workflowId}/upload-bills")
//    @Operation(summary = "Upload bills for post-travel reimbursement")
//    public ResponseEntity<ApprovalWorkflowDTO> uploadBills(
//            @PathVariable UUID workflowId,
//            @RequestParam Double actualCost,
//            @RequestParam UUID uploadedBy) {
//        return ResponseEntity.ok(workflowService.uploadBills(workflowId, actualCost, uploadedBy));
//    }
//
//    // ✅ Get Workflow by Travel Request
//    @GetMapping("/travel-request/{travelRequestId}")
//    @Operation(summary = "Get workflow by travel request ID")
//    public ResponseEntity<ApprovalWorkflowDTO> getByTravelRequest(@PathVariable UUID travelRequestId) {
//        return ResponseEntity.ok(workflowService.getWorkflowByRequestId(travelRequestId));
//    }
//
//    // ✅ Get Workflow by Workflow ID
//    @GetMapping("/{workflowId}")
//    @Operation(summary = "Get workflow by ID")
//    public ResponseEntity<ApprovalWorkflowDTO> getWorkflow(@PathVariable UUID workflowId) {
//        return ResponseEntity.ok(workflowService.getWorkflow(workflowId));
//    }
//
//    // ✅ Get Pending Approvals by Role
//    @GetMapping("/pending-approvals")
//    @Operation(summary = "Get pending approvals by role")
//    public ResponseEntity<Object> getPendingApprovals(
//            @RequestParam(required = false) String approverRole,
//            @RequestParam(required = false) UUID approverId) {
//        if (approverId != null) {
//            return ResponseEntity.ok(workflowService.getPendingApprovals(approverRole, approverId));
//        } else if (approverRole != null) {
//            return ResponseEntity.ok(workflowService.getPendingApprovalsByRole(approverRole));
//        } else {
//            return ResponseEntity.badRequest().body("Either approverRole or approverId must be provided");
//        }
//    }
//
//    // ✅ Get Workflow History
//    @GetMapping("/{travelRequestId}/history")
//    @Operation(summary = "Get workflow history for a travel request")
//    public ResponseEntity<List<ApprovalActionDTO>> getWorkflowHistory(@PathVariable UUID travelRequestId) {
//        return ResponseEntity.ok(workflowService.getWorkflowHistory(travelRequestId));
//    }
//
//    // ✅ Get Workflows by Status
//    @GetMapping("/status/{status}")
//    @Operation(summary = "Get workflows by status")
//    public ResponseEntity<List<ApprovalWorkflowDTO>> getWorkflowsByStatus(@PathVariable String status) {
//        return ResponseEntity.ok(workflowService.getWorkflowsByStatus(status));
//    }
//
//    // ✅ Get Workflow Metrics
//    @GetMapping("/metrics")
//    @Operation(summary = "Get workflow metrics")
//    public ResponseEntity<WorkflowMetricsDTO> getWorkflowMetrics() {
//        return ResponseEntity.ok(workflowService.getWorkflowMetrics());
//    }
//
//    @Operation(summary = "Progress workflow to Travel Desk for bill review")
//    @PostMapping("/{workflowId}/progress-to-travel-desk")
//    public ResponseEntity<ApprovalWorkflowDTO> progressToTravelDeskReview(
//            @Parameter(description = "Workflow ID") @PathVariable UUID workflowId,
//            @RequestParam(defaultValue = "BILLS_SUBMITTED") String action) {
//        
//        // Get user ID from security context instead of request header
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String principal = authentication.getName();
//        
//        log.debug("🔍 [WorkflowController] Security context principal: {}", principal);
//        log.debug("🔍 [WorkflowController] Authentication authorities: {}", authentication.getAuthorities());
//        
//        UUID submittedBy;
//        if (principal.startsWith("service-")) {
//            // Extract user ID from service principal (e.g., "service-5cc38721-6220-456d-9fea-ad6c2b2ce8cd")
//            submittedBy = UUID.fromString(principal.substring(8));
//            log.debug("🟢 [WorkflowController] Extracted user ID from service principal: {}", submittedBy);
//        } else if (!principal.equals("internal-service") && !principal.equals("anonymous")) {
//            // Regular user principal
//            submittedBy = UUID.fromString(principal);
//            log.debug("🟢 [WorkflowController] Using regular user principal: {}", submittedBy);
//        } else {
//            // Fallback - try to get from headers if available (for backward compatibility)
//            // This should not happen with the updated gateway filter
//            log.warn("⚠️ [WorkflowController] Using generic service principal, unable to extract specific user ID");
//            submittedBy = UUID.fromString("00000000-0000-0000-0000-000000000000"); // Fallback UUID
//        }
//
//        log.info("🔄 Progressing workflow {} to Travel Desk for action: {} by user: {}", 
//                workflowId, action, submittedBy);
//
//        ApprovalWorkflowDTO updatedWorkflow = workflowService.progressToTravelDeskReview(
//                workflowId, submittedBy, action);
//        
//        return ResponseEntity.ok(updatedWorkflow);
//    }
//
//    // 🧩 Inner DTO for initiating workflow
//    @Data
//    public static class InitiateWorkflowRequest {
//        @NotNull
//        @Schema(description = "Travel Request ID linked to this workflow", example = "245069c4-6961-4d9f-9530-59ae344b0f44")
//        private UUID travelRequestId;
//
//        @NotNull
//        @Schema(description = "Workflow type: PRE_TRAVEL or POST_TRAVEL", example = "PRE_TRAVEL")
//        private String workflowType;
//
//        @Schema(description = "Estimated cost of travel (optional)", example = "12000.50")
//        private Double estimatedCost;
//    }
//}