package com.bwc.travel_request_management.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TravelRequestDTO {

    private UUID travelRequestId;

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Origin location is required")
    @Size(max = 255, message = "Origin cannot exceed 255 characters")
    private String origin;

    @NotBlank(message = "Destination location is required")
    @Size(max = 255, message = "Destination cannot exceed 255 characters")
    private String travelDestination;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotBlank(message = "Purpose is required")
    @Size(max = 1000, message = "Purpose cannot exceed 1000 characters")
    private String purpose;

    @Builder.Default
    private boolean managerPresent = true;

    private Double estimatedBudget;

    /** Employee requests advance */
    @Builder.Default
    private boolean advancedMoneyWanted = false;

    /** Finance grants advance */
    @Builder.Default
    private boolean advancedGranted = false;

    /** Amount of advance requested/granted */
    private BigDecimal advancedMoneyTaken;

    @Builder.Default
    private String status = "DRAFT";

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ========================= VALIDATION LOGIC ============================= //

    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateAfterStartDate() {
        if (startDate == null || endDate == null) return true;
        return endDate.isAfter(startDate);
    }

    /**
     * Ensures:
     *  - If advance is wanted, amount must be given
     *  - If advance is granted, amount must be given
     */
    @AssertTrue(message = "Please specify 'advancedMoneyTaken' when advance money is wanted or granted")
    public boolean isAdvanceMoneyProvidedWhenRequired() {
        if (advancedMoneyWanted || advancedGranted) {
            return advancedMoneyTaken != null && advancedMoneyTaken.compareTo(BigDecimal.ZERO) > 0;
        }
        return true;
    }
}
