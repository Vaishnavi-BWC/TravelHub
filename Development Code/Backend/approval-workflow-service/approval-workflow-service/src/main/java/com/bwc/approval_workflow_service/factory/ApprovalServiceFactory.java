package com.bwc.approval_workflow_service.factory;

import com.bwc.approval_workflow_service.dto.BaseApprovalActionRequestDTO;
import com.bwc.approval_workflow_service.dto.BaseApprovalActionResponseDTO;
import com.bwc.approval_workflow_service.service.ApprovalService;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ApprovalServiceFactory {

    private final Map<String, ApprovalService<?, ?>> serviceRegistry;

    public ApprovalServiceFactory(Map<String, ApprovalService<?, ?>> serviceRegistry) {
        this.serviceRegistry = serviceRegistry;
    }

    @SuppressWarnings("unchecked")
    public <I extends BaseApprovalActionRequestDTO, O extends BaseApprovalActionResponseDTO>
    ApprovalService<I, O> getService(String actorType) {

        String beanName = actorType.toLowerCase() + "ApprovalService";
        ApprovalService<?, ?> service = serviceRegistry.get(beanName);

        if (service == null) {
            throw new IllegalArgumentException("No ApprovalService found for actor type: " + actorType);
        }

        // ✅ Safe because you control bean naming and types
        return (ApprovalService<I, O>) service;
    }
}
