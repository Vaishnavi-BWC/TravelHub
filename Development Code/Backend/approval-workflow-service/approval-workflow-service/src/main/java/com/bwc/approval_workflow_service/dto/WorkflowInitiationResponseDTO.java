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
public class WorkflowInitiationResponseDTO {
    private UUID workflowId;
    private String employeeName;
    private String currentStep;
    private String status;
    private LocalDateTime initiatedAt;
}
