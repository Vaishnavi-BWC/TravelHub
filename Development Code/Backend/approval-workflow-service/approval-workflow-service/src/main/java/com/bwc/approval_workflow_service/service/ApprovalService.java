package com.bwc.approval_workflow_service.service;

import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;

public interface ApprovalService<
        I extends BaseApprovalActionRequestDTO,
        O extends BaseApprovalActionResponseDTO> {

    O processApproval(I actionDTO);
    O approve(I actionDTO);
    O reject(I actionDTO);
    O returnRequest(I actionDTO);
}