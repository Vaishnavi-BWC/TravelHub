package com.bwc.approval_workflow_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflowDTO {

    private UUID workflowId;
    private UUID travelRequestId;
    private UUID employeeId;
    private UUID policyId;

    private String employeeName;
    private String employeeEmail;
    private String employeeDepartment;

    private String workflowType;
    private String currentStep;
    private String currentApproverRole;
    private UUID currentApproverId;
    private String status;
    private String previousStep;
    private String nextStep;
    private String priority;

    private Double estimatedCost;
    private Double actualCost;
    private String bookingDetails;
    private Double totalBookingAmount;

    private Boolean isOverpriced;
    private String overpricedReason;
    private String comments; // ✅ Retained from previous DTO version (useful for communication)

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dueDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;

    private Long version;

    // ✅ Optional nested details (proxies or simplified responses)
    private TravelRequestProxyDTO travelRequestDetails;
    private EmployeeProxyDTO employeeDetails;

    // ✅ Optional collections for related data (usually shown in detail view)
    private Set<RaisedExceptionDTO> exceptions;
    private Set<ApprovalActionDTO> actions;

}
