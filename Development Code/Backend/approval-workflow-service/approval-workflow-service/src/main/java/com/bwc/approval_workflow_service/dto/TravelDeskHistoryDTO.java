package com.bwc.approval_workflow_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelDeskHistoryDTO {
    private UUID actionId;
    private UUID workflowId;
    private UUID travelRequestId;
    private String approverName;
    private String action;
    private String step;
    private String comments;
    private LocalDateTime actionTakenAt;
    private Boolean isEscalated;
    private String escalationReason;
    private Double amountApproved;
    private Double reimbursementAmount;
    
    // Additional context fields
    private String employeeName;
    private String travelPurpose;
    private Double estimatedCost;
}