package com.bwc.approval_workflow_service.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public abstract class BaseApprovalActionRequestDTO {
	
	@NotNull
    private UUID workflowId;
    @NotBlank
    private String actionType; // APPROVE, REJECT, ESCALATE, RETURN, OVERPRICE
    private UUID approverId;
    private String approverName;
    private String comments;
    private String workflowType;

}
