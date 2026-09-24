package com.personalhub.api.web;

import java.time.Instant;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, Object>> handleApi(ApiException exception) {
        return ResponseEntity.status(exception.status()).body(Map.of(
            "timestamp", Instant.now(), "status", exception.status().value(), "error", exception.status().getReasonPhrase(), "message", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = exception.getBindingResult().getFieldErrors().stream()
            .collect(java.util.stream.Collectors.toMap(FieldError::getField, error -> error.getDefaultMessage() == null ? "Invalid value" : error.getDefaultMessage(), (a, b) -> a));
        return ResponseEntity.badRequest().body(Map.of("timestamp", Instant.now(), "status", 400, "error", "Bad Request", "message", "Validation failed", "fields", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException exception) {
        String message = "Invalid request payload";
        if (exception.getMessage() != null && exception.getMessage().contains("Status")) {
            message = "status must be one of TODO, IN_PROGRESS, WAITING, BLOCKED, DONE";
        }
        return ResponseEntity.badRequest().body(Map.of(
            "timestamp", Instant.now(), "status", 400, "error", "Bad Request", "message", message));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
            log.error("Unhandled API exception", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "timestamp", Instant.now(), "status", 500, "error", "Internal Server Error", "message", "Unexpected server error"));
    }
        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
}
