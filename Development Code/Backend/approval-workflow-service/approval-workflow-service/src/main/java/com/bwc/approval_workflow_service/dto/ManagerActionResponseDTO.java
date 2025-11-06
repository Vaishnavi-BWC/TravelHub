package com.bwc.approval_workflow_service.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerActionResponseDTO {
    private UUID workflowId;
    private String currentStep;
    private String status;
    private String message; // e.g. “Workflow moved to TRAVEL_DESK_CHECK”
    private ApprovalActionDTO action;
    private RaisedExceptionDTO raisedException;
}
