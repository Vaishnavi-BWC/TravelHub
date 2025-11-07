package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ManagerApprovalActionResponseDTO extends BaseApprovalActionResponseDTO {
    // Add manager-specific fields if needed
    // Example:
    // private boolean exceptionRaised;
}
