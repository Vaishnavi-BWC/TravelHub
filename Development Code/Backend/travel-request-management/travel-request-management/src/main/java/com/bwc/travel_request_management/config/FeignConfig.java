package com.bwc.travel_request_management.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * ✅ Adds required headers for internal secure communication between microservices.
 */
@Slf4j
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor internalGatewayHeaderInterceptor() {
        return requestTemplate -> {
            // Always add internal secret
            requestTemplate.header("X-Internal-Gateway-Secret", "bwc-secure-gateway");

            // Propagate X-User-Id header if available in current request
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest currentRequest = attributes.getRequest();
                String userId = currentRequest.getHeader("X-User-Id");
                if (userId != null && !userId.isBlank()) {
                    requestTemplate.header("X-User-Id", userId);
                    log.debug("🟢 [TRMS → Workflow] Propagated X-User-Id header: {}", userId);
                } else {
                    log.warn("⚠️ [TRMS → Workflow] X-User-Id header not found in current request context!");
                }
            } else {
                log.warn("⚠️ [TRMS → Workflow] No current request context — unable to propagate X-User-Id header.");
            }

            log.debug("🟢 [TRMS → Workflow] Added X-Internal-Gateway-Secret header");
        };
    }
}