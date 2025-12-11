package com.greentechinnovators.backend.dto.Energy.Request;

import com.greentechinnovators.backend.Enums.Status;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class EnergyMonitorRequestDTO {
    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Sensor ID is required")
    private String sensorId;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|INACTIVE|MAINTENANCE)$", message = "Status must be ACTIVE, INACTIVE, or MAINTENANCE")
    private Status status;

    @NotNull(message = "CO2 Impact is required")
    @PositiveOrZero(message = "CO2 Impact cannot be negative")
    private Double co2Impact;

    @NotEmpty(message = "mac address should not be empty")
    private String macAddress;

    private List<EnergyRequestDTO> energyReadings;
}
