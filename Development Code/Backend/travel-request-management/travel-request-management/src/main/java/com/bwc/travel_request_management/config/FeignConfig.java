package com.bwc.travel_request_management.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Enumeration;

@Slf4j
@Configuration
public class FeignConfig implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) 
            RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            // Copy all headers from the original request except Content-Length
            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    // Skip Content-Length as it will be recalculated
                    if (!"Content-Length".equalsIgnoreCase(headerName)) {
                        String headerValue = request.getHeader(headerName);
                        template.header(headerName, headerValue);
                    }
                }
            }
            
            // Ensure internal gateway secret is set
            template.header("X-Internal-Gateway-Secret", "bwc-secure-gateway");
            log.debug("🟢 [TRMS → Workflow] Headers forwarded for Feign call to: {}", template.url());
        } else {
            log.warn("⚠️ [TRMS → Workflow] No request context available for Feign call");
            template.header("X-Internal-Gateway-Secret", "bwc-secure-gateway");
        }
    }
}