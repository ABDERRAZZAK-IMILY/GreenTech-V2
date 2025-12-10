package com.greentechinnovators.backend.dto.Energy.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class EnergyRequestDTO {

    @NotNull(message = "Energy consumed value is required")
    @Positive(message = "Energy consumed must be a positive value")
    private Double energyConsumed;
}
