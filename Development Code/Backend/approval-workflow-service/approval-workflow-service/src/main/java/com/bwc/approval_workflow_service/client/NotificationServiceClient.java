package com.bwc.approval_workflow_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.bwc.approval_workflow_service.config.FeignConfig;
import com.bwc.approval_workflow_service.dto.WorkflowNotificationDTO;

@FeignClient(
    name = "notification-service",
    url = "${services.notification.url:http://localhost:8084}",
    configuration = FeignConfig.class,
    fallback = NotificationFallback.class
)
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/next-approver")
    void notifyNextApprover(@RequestBody WorkflowNotificationDTO notification);

    @PostMapping("/api/notifications/exception")
    void notifyException(@RequestBody WorkflowNotificationDTO notification);

	void notifyEmployee(WorkflowNotificationDTO dto);
}
