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
public class ActionHistoryDTO {
    private UUID workflowId;
    private UUID travelRequestId;
    private String status;
    private String stepName;
    private String decision;
    private String comments;
    private String actorName;
    private String actorRole;
    private LocalDateTime actionTakenAt;
    private String employeeName;
    private String workflowType;
}
