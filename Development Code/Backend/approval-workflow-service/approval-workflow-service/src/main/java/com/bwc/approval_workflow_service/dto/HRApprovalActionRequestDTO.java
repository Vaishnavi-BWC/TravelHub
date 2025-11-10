package com.bwc.approval_workflow_service.dto;

import com.bwc.approval_workflow_service.enums.ApprovalActionType;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class HRApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private Boolean policyComplianceChecked;
    private String policySection;
    private String exceptionReason;
    private String documentationRequest;

    @Override
    public boolean canRaiseException() {
        return true; // HR can raise exceptions
    }

    @Override
    protected String getRoleSpecificExceptionReason() {
        return exceptionReason;
    }

    /**
     * 🔒 Validate HR-specific business rules for exceptions
     */
    public void validateHRException() {
        if (getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            if (exceptionReason == null || exceptionReason.trim().isEmpty()) {
                throw new IllegalArgumentException("Exception reason is required for HR");
            }
            if (policySection == null || policySection.trim().isEmpty()) {
                throw new IllegalArgumentException("Policy section must be specified when raising exception");
            }
        }
    }
}