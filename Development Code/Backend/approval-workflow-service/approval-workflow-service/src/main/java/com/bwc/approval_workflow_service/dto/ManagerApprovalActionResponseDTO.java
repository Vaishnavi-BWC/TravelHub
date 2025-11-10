package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class ManagerApprovalActionResponseDTO extends BaseApprovalActionResponseDTO {
    private String returnReason;
}