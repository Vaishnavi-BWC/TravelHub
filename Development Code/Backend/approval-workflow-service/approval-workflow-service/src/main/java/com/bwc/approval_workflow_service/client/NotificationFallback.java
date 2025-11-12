package com.bwc.approval_workflow_service.client;

import com.bwc.approval_workflow_service.dto.WorkflowNotificationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationFallback implements NotificationServiceClient {

    @Override
    public void notifyNextApprover(WorkflowNotificationDTO notificationDTO) {
        log.warn("📧 Notification service unavailable - Would notify {} for workflow {} (Employee: {})",
                notificationDTO.getNextApproverRole(),
                notificationDTO.getWorkflowId(),
                notificationDTO.getEmployeeName());
    }

    @Override
    public void notifyException(WorkflowNotificationDTO notification) {
        log.warn("⚠️ Notification service unavailable - Exception notification for workflow {}. Details: {}",
                notification.getWorkflowId(),
                notification.getAdditionalData());
    }

	@Override
	public void notifyEmployee(WorkflowNotificationDTO dto) {
		// TODO Auto-generated method stub
		
	}
}
