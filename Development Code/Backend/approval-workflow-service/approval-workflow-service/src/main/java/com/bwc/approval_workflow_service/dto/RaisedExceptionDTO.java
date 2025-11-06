package com.bwc.approval_workflow_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RaisedExceptionDTO {

    private UUID exceptionId;
    private Boolean isException;
    private String exceptionReason;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime raisedAt;

    private UUID raisedById;
    private String raisedByName;
    private String raisedByRole;

    private UUID workflowId; // to link back to ApprovalWorkflow (for reference)
    private UUID actionId;   // to identify which action caused this exception
}
