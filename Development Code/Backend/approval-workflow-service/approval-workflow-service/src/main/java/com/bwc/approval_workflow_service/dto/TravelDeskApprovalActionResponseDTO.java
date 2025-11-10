package com.bwc.approval_workflow_service.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
public class TravelDeskApprovalActionResponseDTO extends BaseApprovalActionResponseDTO {
    private String bookingReference;
    private Boolean travelArrangementsConfirmed;
    private String alternativeDetails;
    private String exceptionDetails;
    private Boolean exceptionRaised;        // Add this field
}