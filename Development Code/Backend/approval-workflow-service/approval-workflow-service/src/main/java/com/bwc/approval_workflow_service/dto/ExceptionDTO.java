package com.bwc.approval_workflow_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionDTO {
    private UUID exceptionId;
    private UUID workflowId;
    private UUID travelRequestId;
    private String stepName;
    private String reason;
    private String raisedByName;
    private String raisedByRole;
    private LocalDateTime raisedAt;
    private String employeeName;
    private String workflowType;
    private String status;
    private WorkflowLinkDTO workflowLink;
}