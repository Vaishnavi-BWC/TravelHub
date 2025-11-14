package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNotificationDTO {
    private UUID workflowId;
    private String workflowType;
    private String currentStep;
    private String nextApproverRole;
    private String employeeName;
    private String employeeEmail;
    private LocalDateTime timestamp;
    private Map<String, Object> additionalData;

    public void setAdditionalData(Map<String, Object> additionalData) {
        this.additionalData = additionalData;
    }
}