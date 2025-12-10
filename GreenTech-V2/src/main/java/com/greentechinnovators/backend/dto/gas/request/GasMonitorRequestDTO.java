package com.greentechinnovators.backend.dto.gas.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.List;

@Data
public class GasMonitorRequestDTO {

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Sensor ID is required")
    private String sensorId;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|INACTIVE|MAINTENANCE)$", message = "Status must be ACTIVE, INACTIVE, or MAINTENANCE")
    private String status;

    @NotNull(message = "CO2 Impact is required")
    @PositiveOrZero(message = "CO2 Impact cannot be negative")
    private Double co2Impact;

    // List of gas readings associated with this monitor
    private List<GasRequestDTO> gasReadings;
}
