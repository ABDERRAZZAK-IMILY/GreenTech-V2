package com.greentechinnovators.backend.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponseDTO {

    // The required fields from the project context:
    private LocalDateTime timestamp;  // Timestamp
    private int httpCode;             // HTTP Code (e.g., 422)
    private String errorType;         // Type d'erreur (e.g., "Business Rule Violation")
    private String message;           // Message explicatif
    private String path;              // Chemin de la requête (Request URI)
}