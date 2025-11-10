package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class HRApprovalActionResponseDTO extends BaseApprovalActionResponseDTO {
    private Boolean policyComplianceChecked;
    private String complianceStatus;
    private String exceptionDetails;
    private String policySectionReference;  // Add this field
    private Boolean exceptionRaised;        // Add this field
}