package com.greentechinnovators.backend.dto.gas.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class GasRequestDTO {

    @NotNull(message = "Consumed gas value is required")
    @Positive(message = "Consumed gas must be a positive value")
    private Double consumedGas;

    private String usage;
    private String gasType;
    private Double quantity;
    private String unit;
    private String capacity;
    private String status;
}