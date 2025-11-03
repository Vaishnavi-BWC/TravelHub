package com.bwc.approval_workflow_service.service;

import java.util.List;
import java.util.UUID;

import com.bwc.approval_workflow_service.dto.WorkflowMilestoneDTO;
import com.bwc.approval_workflow_service.dto.WorkflowProgressResponseDTO;

public interface WorkflowMilestoneService {
    List<WorkflowMilestoneDTO> getWorkflowMilestones(UUID travelRequestId);
    WorkflowProgressResponseDTO getWorkflowProgress(UUID travelRequestId);
}
