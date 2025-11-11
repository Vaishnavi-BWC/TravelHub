package com.bwc.approval_workflow_service.config;

import feign.Logger;
import feign.RequestInterceptor;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.FeignLoggerFactory;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Scope;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import feign.form.spring.SpringFormEncoder;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;

@Slf4j
@Configuration
public class FeignConfig {

    // ==========================================================
    // 🔧 FEIGN ENCODER CONFIGURATION (Multipart Support)
    // ==========================================================

    @Bean
    @Primary
    @Scope("prototype")
    public feign.codec.Encoder feignFormEncoder(ObjectFactory<HttpMessageConverters> messageConverters) {
        return new SpringFormEncoder(new SpringEncoder(messageConverters));
    }

    // ==========================================================
    // 🔒 SECURITY HEADER FORWARDER
    // ==========================================================

    @Bean
    public RequestInterceptor securityHeaderForwarder() {
        return new SecurityHeaderForwarder();
    }

    // ==========================================================
    // 📊 LOGGING & ERROR HANDLING
    // ==========================================================

    @Bean
    public Logger.Level feignLoggerLevel() {
        return Logger.Level.HEADERS; // Enhanced from BASIC to HEADERS for better debugging
    }

    @Bean
    public ErrorDecoder feignErrorDecoder() {
        return new FeignSecurityErrorDecoder();
    }

    @Bean
    public FeignLoggerFactory feignLoggerFactory() {
        return new Slf4jFeignLoggerFactory();
    }

    // ==========================================================
    // 🔒 SECURITY HEADER FORWARDER IMPLEMENTATION
    // ==========================================================

    public static class SecurityHeaderForwarder implements RequestInterceptor {
        private static final List<String> ALLOWED_HEADERS = List.of(
            "X-User-Id", 
            "X-User-Roles",
            "X-Trace-Id",
            "X-Correlation-Id",
            "X-Request-Id"
        );
        
        private static final List<String> SENSITIVE_HEADERS = List.of(
            "Authorization", 
            "Cookie",
            "X-Internal-Gateway-Secret"
        );

        @Override
        public void apply(feign.RequestTemplate template) {
            ServletRequestAttributes attributes = (ServletRequestAttributes) 
                RequestContextHolder.getRequestAttributes();
            
            if (attributes == null) {
                log.warn("No request context available for Feign header forwarding");
                addCorrelationId(template);
                return;
            }

            HttpServletRequest request = attributes.getRequest();
            
            // Forward allowed security headers
            ALLOWED_HEADERS.forEach(header -> {
                String value = request.getHeader(header);
                if (value != null && !value.trim().isEmpty()) {
                    template.header(header, value);
                    log.debug("Forwarded header: {} for Feign call to: {}", header, template.url());
                }
            });

            // Add correlation ID for tracing if not present
            if (request.getHeader("X-Correlation-Id") == null) {
                addCorrelationId(template);
            }

            // Remove sensitive headers
            SENSITIVE_HEADERS.forEach(template::removeHeader);
        }

        private void addCorrelationId(feign.RequestTemplate template) {
            String correlationId = "CORR-" + UUID.randomUUID() + "-" + System.currentTimeMillis();
            template.header("X-Correlation-Id", correlationId);
        }
    }

    // ==========================================================
    // 🚨 SECURITY ERROR DECODER
    // ==========================================================

    public static class FeignSecurityErrorDecoder implements ErrorDecoder {
        private final ErrorDecoder defaultErrorDecoder = new ErrorDecoder.Default();
        
        @Override
        public Exception decode(String methodKey, feign.Response response) {
            if (response.status() == 401 || response.status() == 403) {
                log.warn("🔒 Security error in Feign call {}: {}", methodKey, response.status());
            } else if (response.status() >= 400) {
                log.error("❌ Feign client error in {}: {}", methodKey, response.status());
            }
            return defaultErrorDecoder.decode(methodKey, response);
        }
    }

    // ==========================================================
    // 📝 ENHANCED LOGGER FACTORY
    // ==========================================================

    public static class Slf4jFeignLoggerFactory implements FeignLoggerFactory {
        @Override
        public Logger create(Class<?> type) {
            return new feign.slf4j.Slf4jLogger(type);
        }
    }
}