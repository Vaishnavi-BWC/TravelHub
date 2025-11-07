package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor // Add this
public class HRApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private Boolean policyComplianceChecked;
    private String policySection;
    private String exceptionReason;
    private String documentationRequest;
}