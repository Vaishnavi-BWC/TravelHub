package com.bwc.approval_workflow_service.service;

import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;

public interface ApprovalService<I extends BaseApprovalActionRequestDTO, O> {
    O processApproval(I actionDTO);
}


