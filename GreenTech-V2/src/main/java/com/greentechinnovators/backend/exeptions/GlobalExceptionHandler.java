package com.greentechinnovators.backend.exeptions;

import com.greentechinnovators.backend.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.ResourceAccessException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {
        private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                String message = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                                .collect(Collectors.joining("; "));

                return new ResponseEntity<>(
                                buildErrorResponse(
                                                HttpStatus.BAD_REQUEST,
                                                "Validation Error",
                                                message,
                                                request.getRequestURI()),
                                HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(BusinessRuleViolationException.class)
        public ResponseEntity<ErrorResponseDTO> handleBusinessRuleViolation(BusinessRuleViolationException ex,
                        HttpServletRequest request) {
                return new ResponseEntity<>(
                                buildErrorResponse(
                                                HttpStatus.UNPROCESSABLE_ENTITY, // 422 Status
                                                "Business Rule Violation",
                                                ex.getMessage(),
                                                request.getRequestURI()),
                                HttpStatus.UNPROCESSABLE_ENTITY // 422
                );
        }

        @ExceptionHandler(ResourceAccessException.class)
        public ResponseEntity<ErrorResponseDTO> handleResourceAccessException(ResourceNotFoundException ex,
                        HttpServletRequest request) {
                return new ResponseEntity<>(
                                buildErrorResponse(
                                                HttpStatus.UNPROCESSABLE_ENTITY, // 422 Status
                                                "Business Rule Violation",
                                                ex.getMessage(),
                                                request.getRequestURI()),
                                HttpStatus.UNPROCESSABLE_ENTITY // 422
                );
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
                logger.warn(" Validation failed: {}", ex.getMessage());
                Map<String, String> response = new HashMap<>();
                response.put("error", ex.getMessage());
                response.put("message", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
                logger.error(" Unexpected error occurred: {}", ex.getMessage(), ex);
                Map<String, String> response = new HashMap<>();
                response.put("error", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleInternalServerError(Exception ex, HttpServletRequest request) {
                return new ResponseEntity<>(
                                buildErrorResponse(
                                                HttpStatus.INTERNAL_SERVER_ERROR,
                                                "Internal Server Error",
                                                "An unexpected error occurred: " + ex.getMessage(),
                                                request.getRequestURI()),
                                HttpStatus.INTERNAL_SERVER_ERROR // 500
                );
        }

        private ErrorResponseDTO buildErrorResponse(HttpStatus status, String type, String message, String path) {
                return ErrorResponseDTO.builder()
                                .timestamp(LocalDateTime.now())
                                .httpCode(status.value())
                                .errorType(type)
                                .message(message)
                                .path(path)
                                .build();
        }

}
