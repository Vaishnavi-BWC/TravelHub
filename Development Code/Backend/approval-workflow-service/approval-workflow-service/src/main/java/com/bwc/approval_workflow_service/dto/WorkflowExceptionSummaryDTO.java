package com.bwc.approval_workflow_service.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

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