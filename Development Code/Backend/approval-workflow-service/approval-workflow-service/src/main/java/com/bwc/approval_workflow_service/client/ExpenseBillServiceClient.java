package com.bwc.approval_workflow_service.client;

import com.bwc.approval_workflow_service.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(
    name = "travel-request-service",
    contextId = "expenseBillClient",  // ✅ Unique context ID added
    url = "${services.travel-request.url:http://localhost:8090/travel-management}",
    configuration = FeignConfig.class
)
public interface ExpenseBillServiceClient {

    @PostMapping("/api/expense-bills/workflow/{workflowId}/submit")
    ResponseEntity<Void> submitBillsForReview(
            @PathVariable UUID workflowId,
            @RequestHeader("X-User-Id") UUID employeeId);

    @GetMapping("/api/expense-bills/workflow/{workflowId}/summary")
    ResponseEntity<Object> getExpenseBillSummary(@PathVariable UUID workflowId);
}
