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

    /**
     * 🔒 Validate if the current role can raise exceptions
     */
    public boolean canRaiseException() {
        return false; // Default - override in specific DTOs
    }

    /**
     * 🔒 Validate action permission for the role
     */
    public void validateActionPermission() {
        if (actionType == ApprovalActionType.RAISE_EXCEPTION && !canRaiseException()) {
            throw new SecurityException("Role not allowed to raise exceptions");
        }
    }

    /**
     * 🔒 Get exception reason if allowed, otherwise null
     */
    public String getExceptionReason() {
        return canRaiseException() ? getRoleSpecificExceptionReason() : null;
    }

    protected abstract String getRoleSpecificExceptionReason();
}