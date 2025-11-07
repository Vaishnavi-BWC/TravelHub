package com.bwc.approval_workflow_service.dto;

import java.util.UUID;

import com.bwc.approval_workflow_service.enums.ApprovalActionType;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseApprovalActionRequestDTO {
    
    @NotNull
    private UUID workflowId;
    
    @NotNull
    private ApprovalActionType actionType;
    
    private String comments;
    private String workflowType;
    private UUID approverId;
    private String approverName;
}