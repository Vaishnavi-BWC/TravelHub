package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class FinanceApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private Double budgetApproved;
    private String expenseCategory;
    private Boolean withinBudget;
    private String clarificationRequest;

    @Override
    public boolean canRaiseException() {
        return false; // Finance cannot raise exceptions
    }

    @Override
    protected String getRoleSpecificExceptionReason() {
        return null; // Finance doesn't have exception reasons
    }
}