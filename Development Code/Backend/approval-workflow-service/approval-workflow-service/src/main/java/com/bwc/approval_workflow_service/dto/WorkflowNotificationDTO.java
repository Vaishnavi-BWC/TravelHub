package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNotificationDTO {
    private UUID workflowId;
    private String workflowType;
    private String currentStep;
    private String nextApproverRole;
    private String employeeName;
    private String employeeEmail;
    private LocalDateTime updatedAt;
    
    // Add getters for the fields used in NotificationFallback
    public UUID getWorkflowId() {
        return workflowId;
    }
    
    public String getEmployeeName() {
        return employeeName;
    }
    
    public String getNextApproverRole() {
        return nextApproverRole;
    }
}