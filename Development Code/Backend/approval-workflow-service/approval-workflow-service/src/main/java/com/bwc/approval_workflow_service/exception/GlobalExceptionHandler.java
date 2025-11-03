package com.bwc.approval_workflow_service.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Constants for response field names
    private static final String FIELD_TIMESTAMP = "timestamp";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_ERROR = "error";
    private static final String FIELD_MESSAGE = "message";
    private static final String FIELD_PATH = "path";
    private static final String FIELD_DETAILS = "details";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        log.error("Resource not found: {}", ex.getMessage());
        var body = Map.of(
                FIELD_TIMESTAMP, LocalDateTime.now(),
                FIELD_STATUS, HttpStatus.NOT_FOUND.value(),
                FIELD_ERROR, HttpStatus.NOT_FOUND.getReasonPhrase(),
                FIELD_MESSAGE, ex.getMessage(),
                FIELD_PATH, request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(WorkflowException.class)
    public ResponseEntity<Object> handleWorkflowException(WorkflowException ex, WebRequest request) {
        log.error("Workflow error: {}", ex.getMessage());
        var body = Map.of(
                FIELD_TIMESTAMP, LocalDateTime.now(),
                FIELD_STATUS, HttpStatus.BAD_REQUEST.value(),
                FIELD_ERROR, HttpStatus.BAD_REQUEST.getReasonPhrase(),
                FIELD_MESSAGE, ex.getMessage(),
                FIELD_PATH, request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        log.error("Authentication error: {}", ex.getMessage());
        var body = Map.of(
                FIELD_TIMESTAMP, LocalDateTime.now(),
                FIELD_STATUS, HttpStatus.UNAUTHORIZED.value(),
                FIELD_ERROR, HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                FIELD_MESSAGE, ex.getMessage(),
                FIELD_PATH, request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationErrors(MethodArgumentNotValidException ex, WebRequest request) {
        log.error("Validation errors: {}", ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        var body = Map.of(
                FIELD_TIMESTAMP, LocalDateTime.now(),
                FIELD_STATUS, HttpStatus.BAD_REQUEST.value(),
                FIELD_ERROR, HttpStatus.BAD_REQUEST.getReasonPhrase(),
                FIELD_MESSAGE, "Validation failed",
                FIELD_DETAILS, errors,
                FIELD_PATH, request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        var body = Map.of(
                FIELD_TIMESTAMP, LocalDateTime.now(),
                FIELD_STATUS, HttpStatus.INTERNAL_SERVER_ERROR.value(),
                FIELD_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                FIELD_MESSAGE, "An unexpected error occurred",
                FIELD_PATH, request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}