package com.bwc.approval_workflow_service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepDTO {
    private String stepName;
    private String approverRole;
    private Integer sequenceOrder;
    private String status;
    private LocalDateTime completedAt;
}