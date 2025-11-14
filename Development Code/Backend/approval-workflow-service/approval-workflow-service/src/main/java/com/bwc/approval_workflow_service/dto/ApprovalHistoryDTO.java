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
public class ApprovalHistoryDTO {
    private UUID actionId;
    private UUID workflowId;
    private UUID travelRequestId;
    private String approverRole;
    private String action; // APPROVE, REJECT, ESCALATE, RETURN
    private String step;
    private String comments;
    private LocalDateTime actionTakenAt;
    private String employeeName;
    private String travelPurpose;
    private String destination;
    private Double estimatedCost;
    private Double amountApproved;
    private String escalationReason;
    
    // Helper method to get status summary
    public String getStatus() {
        if ("APPROVE".equals(action)) {
            return "Approved";
        } else if ("REJECT".equals(action)) {
            return "Rejected";
        } else if ("ESCALATE".equals(action)) {
            return "Escalated";
        } else if ("RETURN".equals(action)) {
            return "Returned";
        }
        return action;
    }
}