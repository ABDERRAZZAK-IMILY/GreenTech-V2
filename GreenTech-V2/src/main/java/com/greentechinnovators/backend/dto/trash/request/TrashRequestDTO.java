package com.greentechinnovators.backend.dto.trash.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TrashRequestDTO {

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be a positive number")
    private Double weight; // Corrected from 'wight'
}
