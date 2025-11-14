package com.bwc.approval_workflow_service.controller;

import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.service.WorkflowConfigurationService;
import com.bwc.approval_workflow_service.dto.WorkflowSettingsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/workflow-configs")
@RequiredArgsConstructor
@Tag(name = "Workflow Configuration Admin", description = "Manage workflow configurations and settings")
@PreAuthorize("hasRole('ADMIN')")
public class WorkflowConfigAdminController {

    private final WorkflowConfigurationService workflowConfigurationService;

    // Basic CRUD operations
    @Operation(summary = "Create new workflow configuration")
    @PostMapping
    public ResponseEntity<WorkflowConfiguration> createConfig(@RequestBody WorkflowConfigRequest request) {
        WorkflowConfiguration config = WorkflowConfiguration.builder()
                .workflowType(request.workflowType())
                .stepName(request.stepName())
                .approverRole(request.approverRole())
                .sequenceOrder(request.sequenceOrder())
                .isMandatory(request.isMandatory())
                .timeLimitHours(request.timeLimitHours())
                .autoApproveAfterTimeout(request.autoApproveAfterTimeout())
                .isActive(request.isActive())
                .build();
        
        WorkflowConfiguration saved = workflowConfigurationService.save(config);
        return ResponseEntity.ok(saved);
    }

    @Operation(summary = "Get all configurations for a workflow type")
    @GetMapping("/{workflowType}")
    public ResponseEntity<List<WorkflowConfiguration>> getConfigs(@PathVariable String workflowType) {
        List<WorkflowConfiguration> configs = workflowConfigurationService.getAllByType(workflowType);
        return ResponseEntity.ok(configs);
    }

    @Operation(summary = "Get active configurations for a workflow type")
    @GetMapping("/{workflowType}/active")
    public ResponseEntity<List<WorkflowConfiguration>> getActiveConfigs(@PathVariable String workflowType) {
        List<WorkflowConfiguration> configs = workflowConfigurationService.getActiveWorkflowByType(workflowType);
        return ResponseEntity.ok(configs);
    }

    @Operation(summary = "Update workflow configuration")
    @PutMapping("/{configId}")
    public ResponseEntity<WorkflowConfiguration> updateConfig(
            @PathVariable UUID configId, 
            @RequestBody WorkflowConfigRequest request) {
        
        WorkflowConfiguration existing = workflowConfigurationService.getById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found"));
        
        existing.setWorkflowType(request.workflowType());
        existing.setStepName(request.stepName());
        existing.setApproverRole(request.approverRole());
        existing.setSequenceOrder(request.sequenceOrder());
        existing.setIsMandatory(request.isMandatory());
        existing.setTimeLimitHours(request.timeLimitHours());
        existing.setAutoApproveAfterTimeout(request.autoApproveAfterTimeout());
        existing.setIsActive(request.isActive());
        
        WorkflowConfiguration updated = workflowConfigurationService.save(existing);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete workflow configuration")
    @DeleteMapping("/{configId}")
    public ResponseEntity<Void> deleteConfig(@PathVariable UUID configId) {
        workflowConfigurationService.delete(configId);
        return ResponseEntity.noContent().build();
    }

    // SETTINGS MANAGEMENT ENDPOINTS

    @Operation(summary = "Update SLA settings for a specific step")
    @PatchMapping("/{configId}/sla")
    public ResponseEntity<WorkflowConfiguration> updateStepSLA(
            @PathVariable UUID configId,
            @RequestBody SLASettingsRequest request) {
        
        WorkflowConfiguration updated = workflowConfigurationService.updateStepSLA(
                configId, request.timeLimitHours(), request.autoApproveAfterTimeout());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Toggle step activation")
    @PatchMapping("/{configId}/activation")
    public ResponseEntity<WorkflowConfiguration> toggleStepActivation(
            @PathVariable UUID configId,
            @RequestBody ActivationRequest request) {
        
        WorkflowConfiguration updated = workflowConfigurationService.toggleStepActivation(
                configId, request.isActive());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Update multiple step settings")
    @PatchMapping("/{configId}/settings")
    public ResponseEntity<WorkflowConfiguration> updateStepSettings(
            @PathVariable UUID configId,
            @RequestBody WorkflowSettingsDTO settings) {
        
        WorkflowConfiguration updated = workflowConfigurationService.updateStepSettings(configId, settings);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Bulk update SLA for all steps in a workflow")
    @PatchMapping("/{workflowType}/sla/bulk")
    public ResponseEntity<List<WorkflowConfiguration>> bulkUpdateSLA(
            @PathVariable String workflowType,
            @RequestBody BulkSLASettingsRequest request) {
        
        List<WorkflowConfiguration> updated = workflowConfigurationService.bulkUpdateSLA(
                workflowType, request.timeLimitHours());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Get workflow settings summary")
    @GetMapping("/{workflowType}/settings")
    public ResponseEntity<WorkflowSettingsDTO> getWorkflowSettings(@PathVariable String workflowType) {
        WorkflowSettingsDTO settings = workflowConfigurationService.getWorkflowSettingsSummary(workflowType);
        return ResponseEntity.ok(settings);
    }

    @Operation(summary = "Update step sequence order")
    @PatchMapping("/{configId}/sequence")
    public ResponseEntity<WorkflowConfiguration> updateStepSequence(
            @PathVariable UUID configId,
            @RequestBody SequenceRequest request) {
        
        WorkflowConfiguration updated = workflowConfigurationService.updateStepSequence(
                configId, request.newSequenceOrder());
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Validate workflow sequence")
    @GetMapping("/{workflowType}/validate")
    public ResponseEntity<ValidationResponse> validateSequence(@PathVariable String workflowType) {
        boolean isValid = workflowConfigurationService.validateWorkflowSequence(workflowType);
        return ResponseEntity.ok(new ValidationResponse(isValid, 
                isValid ? "Workflow sequence is valid" : "Workflow sequence has duplicate sequence orders"));
    }

    @Operation(summary = "Reload configurations")
    @PostMapping("/reload")
    public ResponseEntity<Void> reloadConfigs() {
        workflowConfigurationService.reloadConfigurations();
        return ResponseEntity.ok().build();
    }

    // Request/Response DTOs
    public record WorkflowConfigRequest(
        String workflowType,
        String stepName,
        String approverRole,
        Integer sequenceOrder,
        Boolean isMandatory,
        Integer timeLimitHours,
        Boolean autoApproveAfterTimeout,
        Boolean isActive
    ) {}

    public record SLASettingsRequest(Integer timeLimitHours, Boolean autoApproveAfterTimeout) {}
    
    public record ActivationRequest(Boolean isActive) {}
    
    public record BulkSLASettingsRequest(Integer timeLimitHours) {}
    
    public record SequenceRequest(Integer newSequenceOrder) {}
    
    public record ValidationResponse(Boolean isValid, String message) {}
}