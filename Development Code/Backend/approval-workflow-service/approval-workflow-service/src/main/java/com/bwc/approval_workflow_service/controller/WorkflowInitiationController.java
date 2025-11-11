package com.bwc.approval_workflow_service.controller;

import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.dto.TravelRequestProxyDTO;
import com.bwc.approval_workflow_service.dto.WorkflowInitiationResponseDTO;
import com.bwc.approval_workflow_service.service.WorkflowInitiationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/workflows/initiation")
@RequiredArgsConstructor
public class WorkflowInitiationController {

    private final WorkflowInitiationService initiationService;
    private final TravelRequestServiceClient travelRequestServiceClient;

    @PostMapping("/start")
    public ResponseEntity<WorkflowInitiationResponseDTO> initiateWorkflow(
            @RequestBody(required = false) TravelRequestProxyDTO travelRequest,
            @RequestParam String workflowType,
            @RequestParam(required = false) Double estimatedCost) {

        log.info("🔹 Received workflow initiation request - type: {}, estimatedCost: {}", workflowType, estimatedCost);

        if (travelRequest == null) {
            log.warn("⚠️ TravelRequestProxyDTO is null in request body");
            throw new IllegalArgumentException("Travel request data is required");
        }

        log.info("🔹 Processing workflow for travel request: {}", travelRequest.travelRequestId());

        WorkflowInitiationResponseDTO response =
                initiationService.initiateWorkflow(travelRequest, workflowType, estimatedCost);

        log.info("✅ Workflow initiated successfully: {}", response.getWorkflowId());

        // 🟢 Update status of travel request to "INITIATED"
        try {
            travelRequestServiceClient.updateRequestStatus(travelRequest.travelRequestId(), "IN_PROGRESS");
            log.info("📦 Travel request {} status updated to INITIATED", travelRequest.travelRequestId());
        } catch (Exception e) {
            log.error("❌ Failed to update travel request status for {}: {}", travelRequest.travelRequestId(), e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
