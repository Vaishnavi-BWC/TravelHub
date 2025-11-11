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
    private String bookingReference;        // Optional for exceptions
    private Boolean travelArrangementsConfirmed;
    private String alternativeSuggestions;
    private String exceptionReason;

    @Override
    public boolean canRaiseException() {
        return true; // Travel Desk can raise exceptions
    }

    @Override
    protected String getRoleSpecificExceptionReason() {
        return this.exceptionReason;
    }

    /**
     * 🔒 Validate Travel Desk specific exception requirements
     */
    public void validateTravelDeskException() {
        if (this.getActionType() == ApprovalActionType.RAISE_EXCEPTION) {
            if (this.exceptionReason == null || this.exceptionReason.trim().isEmpty()) {
                throw new IllegalArgumentException("exceptionReason is required for RAISE_EXCEPTION");
            }
            // ✅ No booking reference validation - it's optional for exceptions
        }
    }
}