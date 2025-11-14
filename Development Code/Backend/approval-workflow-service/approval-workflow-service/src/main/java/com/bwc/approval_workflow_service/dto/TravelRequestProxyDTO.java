package com.bwc.approval_workflow_service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TravelRequestProxyDTO(
        UUID travelRequestId,
        UUID policyId,
        UUID employeeId,
        UUID projectId,
        UUID managerId,
        UUID categoryId,
        LocalDate startDate,
        LocalDate endDate,
        String purpose,
        Double estimatedBudget,
        BigDecimal advancedTaken,
        String travelDestination,
        String origin
) {}
