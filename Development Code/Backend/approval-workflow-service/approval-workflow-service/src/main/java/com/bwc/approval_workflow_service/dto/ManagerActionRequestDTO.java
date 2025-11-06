package com.bwc.approval_workflow_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerActionRequestDTO {

    @NotNull
    private UUID workflowId;

    @NotBlank
    private String action; // APPROVE, REJECT, ESCALATE, RETURN, OVERPRICE

    private UUID approverId;
    private String approverName;

    private String comments;

    // Optional financials
    private Double amountApproved;
    private Double reimbursementAmount;

    // Optional escalation context
    private String escalationReason;
    private String escalateToRole;
    private UUID escalateToApproverId;

    // Optional overpriced flag context
    private Boolean markOverpriced;
    private String overpricedReason;

    // Optional exception details (if REJECT or policy violation)
    private Boolean isExceptionRaised;
    private String exceptionReason;
}
