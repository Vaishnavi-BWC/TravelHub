package com.bwc.approval_workflow_service.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowLinkDTO {
    private UUID workflowId;
    private String workflowType;
    private String status;
    private String uri;
}
