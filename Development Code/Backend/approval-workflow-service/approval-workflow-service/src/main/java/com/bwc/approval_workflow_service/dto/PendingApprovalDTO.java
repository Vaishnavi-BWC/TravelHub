package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingApprovalDTO {
    private UUID workflowId;
    private UUID travelRequestId;
    private UUID policyId;
    private String employeeName;
    private String employeeDepartment;
    private String currentStep;
    private String workflowType;
    private LocalDateTime submittedAt;
    private Integer pendingDays;
    private String purpose;
    private String travelDestination;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Double estimatedBudget;
}