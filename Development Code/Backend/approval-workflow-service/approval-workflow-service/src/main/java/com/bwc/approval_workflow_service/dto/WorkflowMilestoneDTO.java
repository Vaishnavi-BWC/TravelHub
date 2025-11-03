package com.bwc.approval_workflow_service.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowMilestoneDTO {
    private String stepName;
    private String displayName;
    private String role;
    private String status;         // COMPLETED / CURRENT / UPCOMING
    private String approverName;
    private String action;
    private String comments;
    private LocalDateTime actionTime;
}
