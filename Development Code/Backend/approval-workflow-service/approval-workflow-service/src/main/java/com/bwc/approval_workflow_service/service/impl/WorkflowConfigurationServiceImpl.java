package com.bwc.approval_workflow_service.service.impl;

import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;
import com.bwc.approval_workflow_service.service.WorkflowConfigurationService;
import com.bwc.approval_workflow_service.dto.WorkflowSettingsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowConfigurationServiceImpl implements WorkflowConfigurationService {

    private final WorkflowConfigurationRepository repository;

    @Override
    public List<WorkflowConfiguration> getActiveWorkflowByType(String workflowType) {
        log.debug("Fetching active workflow configurations for type: {}", workflowType);
        return repository.findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflowType);
    }

    @Override
    public List<WorkflowConfiguration> getAllByType(String workflowType) {
        log.debug("Fetching all workflow configurations for type: {}", workflowType);
        return repository.findByWorkflowTypeOrderBySequenceOrder(workflowType);
    }

    @Override
    public Optional<WorkflowConfiguration> getById(UUID configId) {
        log.debug("Fetching workflow configuration by ID: {}", configId);
        return repository.findById(configId);
    }

    @Override
    public WorkflowConfiguration save(WorkflowConfiguration configuration) {
        log.debug("Saving workflow configuration: {}", configuration.getStepName());
        validateSequenceOrder(configuration);
        WorkflowConfiguration saved = repository.save(configuration);
        log.info("Workflow configuration saved successfully: {}", saved.getConfigId());
        return saved;
    }

    @Override
    public void delete(UUID configId) {
        log.debug("Deleting workflow configuration: {}", configId);
        repository.deleteById(configId);
        log.info("Workflow configuration deleted: {}", configId);
    }

    @Override
    public boolean validateWorkflowSequence(String workflowType) {
        log.debug("Validating workflow sequence for type: {}", workflowType);
        List<WorkflowConfiguration> configs = getActiveWorkflowByType(workflowType);
        
        long distinctSequenceCount = configs.stream()
                .map(WorkflowConfiguration::getSequenceOrder)
                .distinct()
                .count();
        
        boolean isValid = distinctSequenceCount == configs.size();
        log.debug("Workflow sequence validation result for {}: {}", workflowType, isValid);
        return isValid;
    }

    @Override
    public void reloadConfigurations() {
        log.info("Workflow configurations reloaded - cache cleared if applicable");
    }

    // NEW METHODS IMPLEMENTATION

    @Override
    @Transactional
    public WorkflowConfiguration updateStepSLA(UUID configId, Integer timeLimitHours, Boolean autoApproveAfterTimeout) {
        log.info("Updating SLA for configuration {}: timeLimit={} hours, autoApprove={}", 
                configId, timeLimitHours, autoApproveAfterTimeout);
        
        WorkflowConfiguration config = repository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found with ID: " + configId));
        
        config.setTimeLimitHours(timeLimitHours);
        config.setAutoApproveAfterTimeout(autoApproveAfterTimeout != null ? autoApproveAfterTimeout : false);
        
        WorkflowConfiguration updated = repository.save(config);
        log.info("SLA updated successfully for step: {}", updated.getStepName());
        return updated;
    }

    @Override
    @Transactional
    public WorkflowConfiguration toggleStepActivation(UUID configId, Boolean isActive) {
        log.info("Toggling step activation for configuration {}: isActive={}", configId, isActive);
        
        WorkflowConfiguration config = repository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found with ID: " + configId));
        
        config.setIsActive(isActive);
        
        WorkflowConfiguration updated = repository.save(config);
        log.info("Step activation toggled successfully for step: {} -> {}", 
                updated.getStepName(), updated.getIsActive());
        return updated;
    }

    @Override
    @Transactional
    public WorkflowConfiguration updateStepSettings(UUID configId, WorkflowSettingsDTO settings) {
        log.info("Updating multiple settings for configuration: {}", configId);
        
        WorkflowConfiguration config = repository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found with ID: " + configId));
        
        // Update fields if provided in settings
        if (settings.getStepSettings() != null && !settings.getStepSettings().isEmpty()) {
            WorkflowSettingsDTO.StepSettings stepSettings = settings.getStepSettings().values().iterator().next();
            
            if (stepSettings.getTimeLimitHours() != null) {
                config.setTimeLimitHours(stepSettings.getTimeLimitHours());
            }
            if (stepSettings.getAutoApproveAfterTimeout() != null) {
                config.setAutoApproveAfterTimeout(stepSettings.getAutoApproveAfterTimeout());
            }
            if (stepSettings.getIsActive() != null) {
                config.setIsActive(stepSettings.getIsActive());
            }
            if (stepSettings.getIsMandatory() != null) {
                config.setIsMandatory(stepSettings.getIsMandatory());
            }
        }
        
        WorkflowConfiguration updated = repository.save(config);
        log.info("Step settings updated successfully for step: {}", updated.getStepName());
        return updated;
    }

    @Override
    @Transactional
    public List<WorkflowConfiguration> bulkUpdateSLA(String workflowType, Integer timeLimitHours) {
        log.info("Bulk updating SLA for workflow type {}: timeLimit={} hours", workflowType, timeLimitHours);
        
        List<WorkflowConfiguration> configs = repository.findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflowType);
        
        if (configs.isEmpty()) {
            throw new RuntimeException("No active configurations found for workflow type: " + workflowType);
        }
        
        configs.forEach(config -> {
            config.setTimeLimitHours(timeLimitHours);
            log.debug("Updated SLA for step: {} -> {} hours", config.getStepName(), timeLimitHours);
        });
        
        List<WorkflowConfiguration> updatedConfigs = repository.saveAll(configs);
        log.info("Bulk SLA update completed for {} steps", updatedConfigs.size());
        return updatedConfigs;
    }

    @Override
    public WorkflowSettingsDTO getWorkflowSettingsSummary(String workflowType) {
        log.debug("Generating workflow settings summary for type: {}", workflowType);
        
        List<WorkflowConfiguration> configs = repository.findByWorkflowTypeOrderBySequenceOrder(workflowType);
        
        if (configs.isEmpty()) {
            throw new RuntimeException("No configurations found for workflow type: " + workflowType);
        }
        
        Map<String, WorkflowSettingsDTO.StepSettings> stepSettingsMap = configs.stream()
                .collect(Collectors.toMap(
                        WorkflowConfiguration::getStepName,
                        config -> WorkflowSettingsDTO.StepSettings.builder()
                        .configId(config.getConfigId()) // ✅ Include config ID
                        .stepName(config.getStepName())
                        .approverRole(config.getApproverRole())
                        .sequenceOrder(config.getSequenceOrder())
                        .timeLimitHours(config.getTimeLimitHours())
                        .isMandatory(config.getIsMandatory())
                        .autoApproveAfterTimeout(config.getAutoApproveAfterTimeout())
                        .isActive(config.getIsActive())
                        .status(config.getIsActive() ? "ACTIVE" : "INACTIVE")
                        .build()

                ));
        
        long activeSteps = configs.stream().filter(WorkflowConfiguration::getIsActive).count();
        Integer defaultTimeLimit = configs.stream()
                .map(WorkflowConfiguration::getTimeLimitHours)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(72); // Default 72 hours if not set
        
        boolean hasAutoApprove = configs.stream()
                .anyMatch(WorkflowConfiguration::getAutoApproveAfterTimeout);
        
        return WorkflowSettingsDTO.builder()
                .workflowType(workflowType)
                .totalSteps(configs.size())
                .activeSteps((int) activeSteps)
                .defaultTimeLimitHours(defaultTimeLimit)
                .hasAutoApproveEnabled(hasAutoApprove)
                .stepSettings(stepSettingsMap)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public WorkflowConfiguration updateStepSequence(UUID configId, Integer newSequenceOrder) {
        log.info("Updating sequence order for configuration {}: newOrder={}", configId, newSequenceOrder);
        
        WorkflowConfiguration config = repository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration not found with ID: " + configId));
        
        String workflowType = config.getWorkflowType();
        
        // Check if new sequence order is already taken
        boolean sequenceExists = repository.findByWorkflowTypeOrderBySequenceOrder(workflowType).stream()
                .filter(c -> !c.getConfigId().equals(configId))
                .anyMatch(c -> c.getSequenceOrder().equals(newSequenceOrder));
        
        if (sequenceExists) {
            throw new RuntimeException("Sequence order " + newSequenceOrder + " already exists for workflow type " + workflowType);
        }
        
        config.setSequenceOrder(newSequenceOrder);
        WorkflowConfiguration updated = repository.save(config);
        log.info("Sequence order updated successfully for step: {} -> {}", updated.getStepName(), newSequenceOrder);
        return updated;
    }

    private void validateSequenceOrder(WorkflowConfiguration configuration) {
        List<WorkflowConfiguration> existingConfigs = getAllByType(configuration.getWorkflowType());
        
        boolean sequenceExists = existingConfigs.stream()
                .filter(c -> !c.getConfigId().equals(configuration.getConfigId()))
                .anyMatch(c -> c.getSequenceOrder().equals(configuration.getSequenceOrder()));
        
        if (sequenceExists) {
            String errorMsg = String.format("Sequence order %d already exists for workflow type %s", 
                    configuration.getSequenceOrder(), configuration.getWorkflowType());
            log.error(errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }
        
        log.debug("Sequence order validation passed for workflow type: {}", configuration.getWorkflowType());
    }
}