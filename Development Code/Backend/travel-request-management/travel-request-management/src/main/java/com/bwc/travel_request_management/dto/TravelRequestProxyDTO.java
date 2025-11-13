package com.bwc.travel_request_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelRequestProxyDTO {
    private UUID travelRequestId;
    private UUID policyId;
    private UUID employeeId;
    private UUID projectId;
    private UUID managerId;
    private UUID categoryId;          //  added (to match workflow service)
    private LocalDate startDate;
    private LocalDate endDate;
    private String purpose;
    private Double estimatedBudget;
    private BigDecimal advancedTaken; //  corrected case (lowercase)
    private String travelDestination;
    private String origin;
}
