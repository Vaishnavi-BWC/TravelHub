package com.bwc.approval_workflow_service.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;
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

    @PostMapping("/{workflowId}/process")
    public ResponseEntity<?> processApproval(@PathVariable UUID workflowId,
                                             @Validated @RequestBody BaseApprovalActionRequestDTO request) {
        request.setWorkflowId(workflowId);
        
        Object response = workflowEngine.process(request);
        return ResponseEntity.ok(response);
    }

    // Standard actions
    @PostMapping("/{workflowId}/approve")
    public ResponseEntity<?> approve(@PathVariable UUID workflowId,
                                     @RequestBody(required = false) BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.APPROVE);
    }

    @PostMapping("/{workflowId}/reject")
    public ResponseEntity<?> reject(@PathVariable UUID workflowId,
                                    @RequestBody(required = false) BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.REJECT);
    }

    @PostMapping("/{workflowId}/return")
    public ResponseEntity<?> returnRequest(@PathVariable UUID workflowId,
                                           @RequestBody(required = false) BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.RETURN);
    }

    // Department-specific actions
    @PostMapping("/{workflowId}/request-clarification")
    public ResponseEntity<?> requestClarification(@PathVariable UUID workflowId,
                                                  @RequestBody BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.REQUEST_CLARIFICATION);
    }

    @PostMapping("/{workflowId}/request-documentation")
    public ResponseEntity<?> requestDocumentation(@PathVariable UUID workflowId,
                                                  @RequestBody BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.REQUEST_DOCUMENTATION);
    }

    @PostMapping("/{workflowId}/suggest-alternative")
    public ResponseEntity<?> suggestAlternative(@PathVariable UUID workflowId,
                                                @RequestBody BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.SUGGEST_ALTERNATIVE);
    }

    @PostMapping("/{workflowId}/raise-exception")
    public ResponseEntity<?> raiseException(@PathVariable UUID workflowId,
                                            @RequestBody BaseApprovalActionRequestDTO request) {
        return processStandardAction(workflowId, request, ApprovalActionType.RAISE_EXCEPTION);
    }

    private ResponseEntity<?> processStandardAction(UUID workflowId, 
                                                   BaseApprovalActionRequestDTO request, 
                                                   ApprovalActionType actionType) {
        
        BaseApprovalActionRequestDTO actionRequest = workflowEngine.createActionRequest(workflowId, actionType, request);
        Object response = workflowEngine.process(actionRequest);
        return ResponseEntity.ok(response);
    }
}