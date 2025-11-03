package com.bwc.approval_workflow_service.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowProgressResponseDTO {
    private String workflowId;
    private String workflowType;
    private String currentStep;
    private String nextApproverRole;
    private String nextApproverName;
    private String overallStatus;
    private LocalDateTime lastUpdatedAt;
    private List<WorkflowMilestoneDTO> milestones;
}
