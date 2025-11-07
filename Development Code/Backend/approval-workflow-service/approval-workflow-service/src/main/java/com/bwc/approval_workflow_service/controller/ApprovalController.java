package com.bwc.approval_workflow_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bwc.approval_workflow_service.dto.ManagerActionRequestDTO;
import com.bwc.approval_workflow_service.engine.WorkflowEngine;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final WorkflowEngine workflowEngine;

    public ApprovalController(WorkflowEngine workflowEngine) {
        this.workflowEngine = workflowEngine;
    }

    @PostMapping("/process/{actorType}")
    public ResponseEntity<Object> processApproval(
            @PathVariable String actorType,
            @RequestBody ManagerActionRequestDTO request) {

        Object response = workflowEngine.process(actorType, request);
        return ResponseEntity.ok(response);
    }

}
