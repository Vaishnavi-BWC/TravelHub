package com.bwc.approval_workflow_service.engine;

import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.factory.ApprovalServiceFactory;
import com.bwc.approval_workflow_service.service.ApprovalService;
import org.springframework.stereotype.Service;

@Service
public class WorkflowEngine {

    private final ApprovalServiceFactory factory;

    public WorkflowEngine(ApprovalServiceFactory factory) {
        this.factory = factory;
    }

    public <I extends BaseApprovalActionRequestDTO, O> O process(String actorType, I requestDto) {
        ApprovalService<I, O> service = factory.getService(actorType);
        return service.processApproval(requestDto);
    }
}
