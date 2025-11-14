// BillReviewDetailsDTO.java
package com.bwc.approval_workflow_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class BillReviewDetailsDTO {
    private ApprovalWorkflowDTO workflow;
    private TravelRequestProxyDTO travelRequest;
    private EmployeeProxyDTO employee;
    private List<ApprovalActionDTO> billActions;
    private Double actualCost;
    private Double estimatedCost;
    private LocalDateTime submittedAt;
    private Long daysPending;
    
    // Calculate days pending
    public Long getDaysPending() {
        if (submittedAt != null) {
            return java.time.temporal.ChronoUnit.DAYS.between(submittedAt, LocalDateTime.now());
        }
        return null;
    }
}