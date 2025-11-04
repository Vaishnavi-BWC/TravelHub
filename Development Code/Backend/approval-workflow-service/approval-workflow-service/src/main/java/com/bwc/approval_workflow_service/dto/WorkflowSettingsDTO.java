package com.bwc.approval_workflow_service.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowSettingsDTO {
    private String workflowType;
    private Integer totalSteps;
    private Integer activeSteps;
    private Integer defaultTimeLimitHours;
    private Boolean hasAutoApproveEnabled;
    private Map<String, StepSettings> stepSettings;
    private LocalDateTime lastUpdated;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepSettings {
    	private UUID configId;
        private String stepName;
        private String approverRole;
        private Integer sequenceOrder;
        private Integer timeLimitHours;
        private Boolean isMandatory;
        private Boolean autoApproveAfterTimeout;
        private Boolean isActive;
        private String status; // "ACTIVE", "INACTIVE", "OVERDUE"
    }
}