package com.bwc.policymanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;

@Configuration(proxyBeanMethods = false)
public class ValidationConfig {

    public ValidationConfig() {
        // Default constructor (Spring requires it)
    }

    @Bean
    public static MethodValidationPostProcessor methodValidationPostProcessor() {
        return new MethodValidationPostProcessor();
    }
}
