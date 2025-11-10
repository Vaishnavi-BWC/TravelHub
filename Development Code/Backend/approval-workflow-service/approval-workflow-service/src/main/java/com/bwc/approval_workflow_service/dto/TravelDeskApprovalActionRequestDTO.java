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
public class TravelDeskApprovalActionRequestDTO extends BaseApprovalActionRequestDTO {
    private String bookingReference;
    private String alternativeSuggestions;
    private String exceptionReason;
    private Boolean travelArrangementsConfirmed;

    @Override
    public boolean canRaiseException() {
        return true; // Travel Desk can raise exceptions
    }

    @Override
    protected String getRoleSpecificExceptionReason() {
        return exceptionReason;
    }

    /**
     * 🔒 Validate Travel Desk-specific business rules for exceptions
     */
    public void validateTravelDeskException() {
        if (getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            if (exceptionReason == null || exceptionReason.trim().isEmpty()) {
                throw new IllegalArgumentException("Exception reason is required for Travel Desk");
            }
            if (bookingReference == null || bookingReference.trim().isEmpty()) {
                throw new IllegalArgumentException("Booking reference must be specified when raising exception");
            }
        }
    }
}