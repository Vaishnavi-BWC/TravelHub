package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor // Add this
public class FinanceApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private Double budgetApproved;
    private String expenseCategory;
    private Boolean withinBudget;
    private String clarificationRequest;
}