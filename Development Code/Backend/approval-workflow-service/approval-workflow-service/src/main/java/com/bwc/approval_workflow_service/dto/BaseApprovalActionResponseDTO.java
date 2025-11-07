package com.bwc.approval_workflow_service.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseApprovalActionResponseDTO {
    private UUID workflowId;
    private String status;
    private String nextStep;
    private String message;
}