package com.greentechinnovators.backend.dto.trash.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrashRequestDTO {

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be a positive number")
    private Double weight; // Corrected from 'wight'
    @NotEmpty(message = "mac address can not be empty")
    private String macAddress;
}
