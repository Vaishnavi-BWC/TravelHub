package com.bwc.travel_request_management.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
    name = "policy-service",
    url = "${services.policy.url}",   // e.g., http://policy-service:8080
    path = "/api/policies"            // base path for your PolicyController
)
public interface PolicyServiceClient {

	@GetMapping("/active/id")
	UUID getActiveGradePolicyId(
	        @RequestParam(name = "city", required = false) String city,
	        @RequestParam(name = "cityCategory", required = false) UUID cityCategory,
	        @RequestParam(name = "grade") String grade
	);

}
