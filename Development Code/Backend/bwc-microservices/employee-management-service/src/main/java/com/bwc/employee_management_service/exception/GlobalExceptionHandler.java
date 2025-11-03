package com.bwc.employee_management_service.exception;

import com.bwc.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
@Hidden // Hide from OpenAPI documentation
public class GlobalExceptionHandler {

    // ✅ Constants to avoid Sonar warnings & improve readability
    private static final String URI_PREFIX = "uri=";
    private static final String CONSTRAINT_KEYWORD = "constraint";
    private static final String EMAIL_CONSTRAINT = "email";
    private static final String PROJECT_NAME_CONSTRAINT = "project_name";
    private static final String ROLE_NAME_CONSTRAINT = "role_name";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {} - Path: {}", ex.getMessage(), request.getDescription(false));

        ApiResponse<Void> response = ApiResponse.error(
                "Requested resource was not found: " + ex.getMessage(),
                HttpStatus.NOT_FOUND
        );
        response.setPath(getCleanPath(request));

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        log.warn("Invalid request: {} - Path: {}", ex.getMessage(), request.getDescription(false));

        ApiResponse<Void> response = ApiResponse.error(
                "Invalid request: " + ex.getMessage(),
                HttpStatus.BAD_REQUEST
        );
        response.setPath(getCleanPath(request));

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        log.warn("Validation error: {} - Path: {}", ex.getMessage(), request.getDescription(false));

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Map<String, String>> response = ApiResponse.error(
                "Validation failed. Please check the input data.",
                HttpStatus.BAD_REQUEST,
                errors
        );
        response.setPath(getCleanPath(request));

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {

        log.error("Data integrity violation: {} - Path: {}", ex.getMessage(), request.getDescription(false));

        String message = "Data integrity violation. This may be due to duplicate data or invalid references.";
        String exceptionMessage = ex.getMessage().toLowerCase();

        // ✅ Cleaned-up logic using constants (SonarQube compliant)
        if (exceptionMessage.contains(CONSTRAINT_KEYWORD)) {
            if (exceptionMessage.contains(EMAIL_CONSTRAINT)) {
                message = "An employee with this email already exists.";
            } else if (exceptionMessage.contains(PROJECT_NAME_CONSTRAINT)) {
                message = "A project with this name already exists.";
            } else if (exceptionMessage.contains(ROLE_NAME_CONSTRAINT)) {
                message = "A role with this name already exists.";
            }
        }

        ApiResponse<Void> response = ApiResponse.error(message, HttpStatus.CONFLICT);
        response.setPath(getCleanPath(request));

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex, WebRequest request) {
        log.error("Unexpected error: {} - Path: {}", ex.getMessage(), ex);

        ApiResponse<Void> response = ApiResponse.error(
                "An unexpected error occurred. Please try again later.",
                HttpStatus.INTERNAL_SERVER_ERROR
        );
        response.setPath(getCleanPath(request));

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ✅ Helper to clean URI in responses
    private String getCleanPath(WebRequest request) {
        return request.getDescription(false).replace(URI_PREFIX, "");
    }
}
