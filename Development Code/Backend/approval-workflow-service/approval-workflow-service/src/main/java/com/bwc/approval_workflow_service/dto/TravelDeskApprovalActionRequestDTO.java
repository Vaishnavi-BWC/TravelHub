package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor // Add this
public class TravelDeskApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private String bookingReference;
    private String alternativeSuggestions;
    private String exceptionReason;
    private Boolean travelArrangementsConfirmed;
}