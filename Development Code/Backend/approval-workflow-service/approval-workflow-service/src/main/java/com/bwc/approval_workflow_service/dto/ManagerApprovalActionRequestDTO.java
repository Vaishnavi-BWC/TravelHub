package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class ManagerApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private String returnReason;

    @Override
    public boolean canRaiseException() {
        return false; // Manager cannot raise exceptions
    }

    @Override
    protected String getRoleSpecificExceptionReason() {
        return null; // Managers don't have exception reasons
    }
}