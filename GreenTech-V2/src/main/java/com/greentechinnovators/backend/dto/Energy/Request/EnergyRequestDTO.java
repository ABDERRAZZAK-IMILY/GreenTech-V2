package com.greentechinnovators.backend.dto.Energy.Request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnergyRequestDTO {
    @NotNull(message = "Energy consumed value is required")
    @Positive(message = "Energy consumed must be a positive value")
    private Double energyConsumed;
    @NotEmpty(message = "mac address can not be empty")
    private String macAddress;
}
