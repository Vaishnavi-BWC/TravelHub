package com.bwc.approval_workflow_service.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bwc.approval_workflow_service.dto.*;
import com.bwc.approval_workflow_service.engine.WorkflowEngine;
import com.bwc.approval_workflow_service.enums.ApprovalActionType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/workflows")
@RequiredArgsConstructor
public class ApprovalController {

    private final WorkflowEngine workflowEngine;

    // 🔹 Generic process endpoint
    @PostMapping("/{workflowId}/process")
    public ResponseEntity<?> processApproval(@PathVariable UUID workflowId,
                                             @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("🔄 Process request for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, null);
    }

    // 🔹 Standard workflow actions

    @PostMapping("/{workflowId}/approve")
    public ResponseEntity<?> approve(@PathVariable UUID workflowId,
                                     @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("✅ Approve request for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, ApprovalActionType.APPROVE);
    }

    @PostMapping("/{workflowId}/reject")
    public ResponseEntity<?> reject(@PathVariable UUID workflowId,
                                    @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("❌ Reject request for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, ApprovalActionType.REJECT);
    }

    @PostMapping("/{workflowId}/return")
    public ResponseEntity<?> returnRequest(@PathVariable UUID workflowId,
                                           @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("↩️ Return request for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, ApprovalActionType.RETURN);
    }

    // 🔹 Department-specific actions

    @PostMapping("/{workflowId}/request-clarification")
    public ResponseEntity<?> requestClarification(@PathVariable UUID workflowId,
                                                  @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("❓ Clarification request for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, ApprovalActionType.REQUEST_CLARIFICATION);
    }

    @PostMapping("/{workflowId}/request-documentation")
    public ResponseEntity<?> requestDocumentation(@PathVariable UUID workflowId,
                                                  @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("📋 Documentation request for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, ApprovalActionType.REQUEST_DOCUMENTATION);
    }

    @PostMapping("/{workflowId}/suggest-alternative")
    public ResponseEntity<?> suggestAlternative(@PathVariable UUID workflowId,
                                                @RequestBody(required = false) Map<String, Object> requestBody) {
        log.info("💡 Alternative suggestion for workflow: {}", workflowId);
        return processStandardAction(workflowId, requestBody, ApprovalActionType.SUGGEST_ALTERNATIVE);
    }

    /**
     * 🎯 Enhanced exception endpoint with role-based access control
     */
    @PostMapping("/{workflowId}/raise-exception")
    public ResponseEntity<?> raiseException(@PathVariable UUID workflowId,
                                            @RequestBody(required = false) Map<String, Object> requestBody) {
        try {
            log.info("🔐 Attempting to raise exception for workflow: {}", workflowId);
            return processStandardAction(workflowId, requestBody, ApprovalActionType.RAISE_EXCEPTION);
        } catch (SecurityException e) {
            log.warn("🚫 Unauthorized exception attempt: {}", e.getMessage());
            return ResponseEntity.status(403).body(Map.of(
                "error", "Unauthorized",
                "message", e.getMessage(),
                "workflowId", workflowId
            ));
        }
    }

    /**
     * 🔧 Enhanced generic handler with exception intelligence
     */
    private ResponseEntity<?> processStandardAction(UUID workflowId,
                                                   Map<String, Object> requestBody,
                                                   ApprovalActionType actionType) {

        try {
            // Step 1️⃣: Let the engine create the correct DTO dynamically
            BaseApprovalActionRequestDTO dto = workflowEngine.createActionRequest(workflowId, actionType, null);

            // Step 2️⃣: Populate common fields
            if (requestBody != null) {
                populateCommonFields(dto, requestBody);
                populateRoleSpecificFields(dto, requestBody, actionType);
            }

            // Step 3️⃣: Log exception attempts for audit
            if (actionType == ApprovalActionType.RAISE_EXCEPTION) {
                log.warn("⚠️ Exception attempt by {} for workflow {}", 
                        dto.getClass().getSimpleName(), workflowId);
            }

            // Step 4️⃣: Process using Workflow Engine
            log.info("🎯 [{}] {} action initiated for workflow {}", 
                    dto.getClass().getSimpleName(), actionType, workflowId);

            Object response = workflowEngine.process(dto);
            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            log.error("🔒 Security violation for workflow {}: {}", workflowId, e.getMessage());
            return ResponseEntity.status(403).body(createErrorResponse("Security Violation", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid request for workflow {}: {}", workflowId, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse("Invalid Request", e.getMessage()));
        } catch (Exception e) {
            log.error("💥 Unexpected error processing workflow {}: {}", workflowId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(createErrorResponse("Processing Error", "An unexpected error occurred"));
        }
    }

    /**
     * 🎯 Enhanced field population with exception intelligence
     */
    private void populateRoleSpecificFields(BaseApprovalActionRequestDTO dto, 
                                          Map<String, Object> requestBody,
                                          ApprovalActionType actionType) {
        
        if (dto instanceof ManagerApprovalActionRequestDTO managerDto) {
            populateManagerFields(managerDto, requestBody, actionType);
        } else if (dto instanceof FinanceApprovalActionRequestDTO financeDto) {
            populateFinanceFields(financeDto, requestBody, actionType);
        } else if (dto instanceof HRApprovalActionRequestDTO hrDto) {
            populateHRFields(hrDto, requestBody, actionType);
        } else if (dto instanceof TravelDeskApprovalActionRequestDTO travelDto) {
            populateTravelDeskFields(travelDto, requestBody, actionType);
        }
    }

    private void populateManagerFields(ManagerApprovalActionRequestDTO managerDto, 
                                     Map<String, Object> requestBody, 
                                     ApprovalActionType actionType) {
        if (actionType == ApprovalActionType.RETURN) {
            if (requestBody.containsKey("returnReason")) {
                managerDto.setReturnReason((String) requestBody.get("returnReason"));
            } else {
                throw new IllegalArgumentException("returnReason is required for RETURN action");
            }
        }
    }

    private void populateFinanceFields(FinanceApprovalActionRequestDTO financeDto, 
                                     Map<String, Object> requestBody, 
                                     ApprovalActionType actionType) {
        if (requestBody.containsKey("budgetApproved")) {
            financeDto.setBudgetApproved(extractDouble(requestBody, "budgetApproved"));
        }
        if (requestBody.containsKey("expenseCategory")) {
            financeDto.setExpenseCategory((String) requestBody.get("expenseCategory"));
        }
        if (requestBody.containsKey("withinBudget")) {
            financeDto.setWithinBudget((Boolean) requestBody.get("withinBudget"));
        }
        
        if (actionType == ApprovalActionType.REQUEST_CLARIFICATION) {
            if (requestBody.containsKey("clarificationRequest")) {
                financeDto.setClarificationRequest((String) requestBody.get("clarificationRequest"));
            } else {
                throw new IllegalArgumentException("clarificationRequest is required for REQUEST_CLARIFICATION");
            }
        }
    }

    private void populateHRFields(HRApprovalActionRequestDTO hrDto, 
                                Map<String, Object> requestBody, 
                                ApprovalActionType actionType) {
        if (requestBody.containsKey("policyComplianceChecked")) {
            hrDto.setPolicyComplianceChecked((Boolean) requestBody.get("policyComplianceChecked"));
        }
        if (requestBody.containsKey("policySection")) {
            hrDto.setPolicySection((String) requestBody.get("policySection"));
        }
        
        if (actionType == ApprovalActionType.REQUEST_DOCUMENTATION) {
            if (requestBody.containsKey("documentationRequest")) {
                hrDto.setDocumentationRequest((String) requestBody.get("documentationRequest"));
            } else {
                throw new IllegalArgumentException("documentationRequest is required for REQUEST_DOCUMENTATION");
            }
        }
        
        if (actionType == ApprovalActionType.RAISE_EXCEPTION) {
            if (requestBody.containsKey("exceptionReason")) {
                hrDto.setExceptionReason((String) requestBody.get("exceptionReason"));
            } else {
                throw new IllegalArgumentException("exceptionReason is required for RAISE_EXCEPTION");
            }
            if (!requestBody.containsKey("policySection") || 
                ((String) requestBody.get("policySection")).trim().isEmpty()) {
                throw new IllegalArgumentException("policySection is required when HR raises exceptions");
            }
        }
    }

    private void populateTravelDeskFields(TravelDeskApprovalActionRequestDTO travelDto, 
                                        Map<String, Object> requestBody, 
                                        ApprovalActionType actionType) {
        if (requestBody.containsKey("bookingReference")) {
            travelDto.setBookingReference((String) requestBody.get("bookingReference"));
        }
        if (requestBody.containsKey("travelArrangementsConfirmed")) {
            travelDto.setTravelArrangementsConfirmed((Boolean) requestBody.get("travelArrangementsConfirmed"));
        }
        
        if (actionType == ApprovalActionType.SUGGEST_ALTERNATIVE) {
            if (requestBody.containsKey("alternativeSuggestions")) {
                travelDto.setAlternativeSuggestions((String) requestBody.get("alternativeSuggestions"));
            } else {
                throw new IllegalArgumentException("alternativeSuggestions is required for SUGGEST_ALTERNATIVE");
            }
        }
        
        if (actionType == ApprovalActionType.RAISE_EXCEPTION) {
            if (requestBody.containsKey("exceptionReason")) {
                travelDto.setExceptionReason((String) requestBody.get("exceptionReason"));
            } else {
                throw new IllegalArgumentException("exceptionReason is required for RAISE_EXCEPTION");
            }
            if (!requestBody.containsKey("bookingReference") || 
                ((String) requestBody.get("bookingReference")).trim().isEmpty()) {
                throw new IllegalArgumentException("bookingReference is required when Travel Desk raises exceptions");
            }
        }
    }

    /**
     * 🔒 Validate HR exception requirements
     */
    private void validateHRExceptionData(HRApprovalActionRequestDTO hrDto) {
        if (hrDto.getExceptionReason() == null || hrDto.getExceptionReason().trim().isEmpty()) {
            throw new IllegalArgumentException("HR exception requires a reason");
        }
        if (hrDto.getPolicySection() == null || hrDto.getPolicySection().trim().isEmpty()) {
            throw new IllegalArgumentException("HR exception requires policy section reference");
        }
    }

    /**
     * 🔒 Validate Travel Desk exception requirements
     */
    private void validateTravelDeskExceptionData(TravelDeskApprovalActionRequestDTO travelDto) {
        if (travelDto.getExceptionReason() == null || travelDto.getExceptionReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Travel Desk exception requires a reason");
        }
        if (travelDto.getBookingReference() == null || travelDto.getBookingReference().trim().isEmpty()) {
            throw new IllegalArgumentException("Travel Desk exception requires booking reference");
        }
    }

    private void populateCommonFields(BaseApprovalActionRequestDTO dto, Map<String, Object> requestBody) {
        if (requestBody.containsKey("comments")) {
            dto.setComments((String) requestBody.get("comments"));
        }
        if (requestBody.containsKey("workflowType")) {
            dto.setWorkflowType((String) requestBody.get("workflowType"));
        }
        
        // Set approver details from security context if available
        try {
            // This would typically come from SecurityContext
            // For now, we'll set dummy values for testing
            dto.setApproverId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
            dto.setApproverName("Test Approver");
        } catch (Exception e) {
            log.warn("Could not set approver details: {}", e.getMessage());
        }
    }

    private Double extractDouble(Map<String, Object> requestBody, String key) {
        if (requestBody.containsKey(key)) {
            Object value = requestBody.get(key);
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            } else if (value instanceof String) {
                try {
                    return Double.parseDouble((String) value);
                } catch (NumberFormatException e) {
                    log.warn("Invalid number format for key {}: {}", key, value);
                }
            }
        }
        return null;
    }

    private Map<String, Object> createErrorResponse(String error, String message) {
        return Map.of(
            "error", error,
            "message", message,
            "timestamp", java.time.LocalDateTime.now().toString(),
            "success", false
        );
    }

    /**
     * 🎯 Get workflow status
     */
    @GetMapping("/{workflowId}/status")
    public ResponseEntity<?> getWorkflowStatus(@PathVariable UUID workflowId) {
        try {
            log.info("📊 Fetching status for workflow: {}", workflowId);
            // This would typically call a service to get workflow status
            // For now, return a mock response
            Map<String, Object> status = Map.of(
                "workflowId", workflowId,
                "status", "IN_PROGRESS",
                "currentStep", "MANAGER_APPROVAL",
                "currentApproverRole", "MANAGER",
                "lastUpdated", java.time.LocalDateTime.now().toString()
            );
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error fetching workflow status for {}: {}", workflowId, e.getMessage());
            return ResponseEntity.internalServerError().body(createErrorResponse("Server Error", "Failed to fetch workflow status"));
        }
    }

    /**
     * 🎯 Get workflow actions history
     */
    @GetMapping("/{workflowId}/actions")
    public ResponseEntity<?> getWorkflowActions(@PathVariable UUID workflowId) {
        try {
            log.info("📝 Fetching actions for workflow: {}", workflowId);
            // This would typically call a service to get action history
            // For now, return a mock response
            Map<String, Object> actions = Map.of(
                "workflowId", workflowId,
                "actions", java.util.List.of(
                    Map.of(
                        "actionId", UUID.randomUUID(),
                        "actionType", "SUBMIT",
                        "actorRole", "EMPLOYEE",
                        "timestamp", java.time.LocalDateTime.now().minusHours(2).toString(),
                        "comments", "Travel request submitted"
                    )
                ),
                "totalActions", 1
            );
            return ResponseEntity.ok(actions);
        } catch (Exception e) {
            log.error("Error fetching workflow actions for {}: {}", workflowId, e.getMessage());
            return ResponseEntity.internalServerError().body(createErrorResponse("Server Error", "Failed to fetch workflow actions"));
        }
    }

    /**
     * 🎯 Get workflow exceptions
     */
    @GetMapping("/{workflowId}/exceptions")
    public ResponseEntity<?> getWorkflowExceptions(@PathVariable UUID workflowId) {
        try {
            log.info("🚨 Fetching exceptions for workflow: {}", workflowId);
            // This would typically call a service to get exceptions
            // For now, return a mock response
            Map<String, Object> exceptions = Map.of(
                "workflowId", workflowId,
                "exceptions", java.util.List.of(),
                "totalExceptions", 0
            );
            return ResponseEntity.ok(exceptions);
        } catch (Exception e) {
            log.error("Error fetching workflow exceptions for {}: {}", workflowId, e.getMessage());
            return ResponseEntity.internalServerError().body(createErrorResponse("Server Error", "Failed to fetch workflow exceptions"));
        }
    }

    /**
     * 🎯 Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("🏥 Health check requested");
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Approval Workflow Service",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "version", "1.0.0"
        ));
    }

    /**
     * 🎯 Get supported actions for current user role
     */
    @GetMapping("/supported-actions")
    public ResponseEntity<?> getSupportedActions() {
        try {
            log.info("🎯 Fetching supported actions for current user");
            // This would determine actions based on user role from security context
            // For now, return all possible actions
            Map<String, Object> supportedActions = Map.of(
                "actions", java.util.List.of(
                    "APPROVE", "REJECT", "RETURN", "REQUEST_CLARIFICATION", 
                    "REQUEST_DOCUMENTATION", "SUGGEST_ALTERNATIVE", "RAISE_EXCEPTION"
                ),
                "role", "CURRENT_USER_ROLE", // Would come from security context
                "timestamp", java.time.LocalDateTime.now().toString()
            );
            return ResponseEntity.ok(supportedActions);
        } catch (Exception e) {
            log.error("Error fetching supported actions: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(createErrorResponse("Server Error", "Failed to fetch supported actions"));
        }
    }
}