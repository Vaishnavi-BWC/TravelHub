package com.bwc.approval_workflow_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class WorkflowExceptionSummaryDTO {
    private UUID workflowId;
    private String workflowType;
    private String employeeName;
    private String employeeDepartment;
    private String status;
    private String exceptionReasonse;
    private String currentStep;
    private String currentApproverRole;
    private String uri;
}