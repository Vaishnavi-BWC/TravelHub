package com.bwc.approval_workflow_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDetailDTO {
    private UUID workflowId;
    private UUID travelRequestId;
    private String employeeName;
    private String employeeEmail;
    private String employeeDepartment;
    private String workflowType;
    private String status;
    private String currentStep;
    private String currentApproverRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.List<ActionHistoryDTO> actions;
    private java.util.List<ExceptionDTO> exceptions;
    private java.util.List<WorkflowStepDTO> steps;
}
