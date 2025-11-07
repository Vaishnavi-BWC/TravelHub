package com.bwc.approval_workflow_service.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseApprovalActionResponseDTO {
    private UUID workflowId;
    private String status;   // e.g. APPROVED_BY_MANAGER
    private String nextStep; // next workflow stage
    private String message;  // optional display message
}
