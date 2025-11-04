package com.bwc.approval_workflow_service.service;

import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.dto.WorkflowSettingsDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowConfigurationService {
    
    // Get active configurations for a workflow type
    List<WorkflowConfiguration> getActiveWorkflowByType(String workflowType);
    
    // Get all configurations for a workflow type (active and inactive)
    List<WorkflowConfiguration> getAllByType(String workflowType);
    
    // Get configuration by ID
    Optional<WorkflowConfiguration> getById(UUID configId);
    
    // Save or update configuration
    WorkflowConfiguration save(WorkflowConfiguration configuration);
    
    // Delete configuration
    void delete(UUID configId);
    
    // Validate workflow configuration sequence
    boolean validateWorkflowSequence(String workflowType);
    
    // Reload configurations (clear cache, etc.)
    void reloadConfigurations();
    
    // NEW METHODS FOR SETTINGS MANAGEMENT
    
    // Update SLA/time limit for a specific step
    WorkflowConfiguration updateStepSLA(UUID configId, Integer timeLimitHours, Boolean autoApproveAfterTimeout);
    
    // Toggle step activation
    WorkflowConfiguration toggleStepActivation(UUID configId, Boolean isActive);
    
    // Update multiple settings at once
    WorkflowConfiguration updateStepSettings(UUID configId, WorkflowSettingsDTO settings);
    
    // Bulk update SLA for all steps of a workflow type
    List<WorkflowConfiguration> bulkUpdateSLA(String workflowType, Integer timeLimitHours);
    
    // Get workflow settings summary
    WorkflowSettingsDTO getWorkflowSettingsSummary(String workflowType);
    
    // Update step sequence order
    WorkflowConfiguration updateStepSequence(UUID configId, Integer newSequenceOrder);
}