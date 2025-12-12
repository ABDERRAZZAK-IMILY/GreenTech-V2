package com.greentechinnovators.backend.dto.trash.request;

import com.greentechinnovators.backend.Enums.Status;
import com.greentechinnovators.backend.Enums.TrashType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class TrashMonitorRequestDTO {

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Sensor ID is required")
    private String sensorId;

    @NotNull(message = "Status is required")
    private Status status;

    @NotNull(message = "CO2 Impact is required")
    @PositiveOrZero(message = "CO2 Impact cannot be negative")
    private Double co2Impact;

    @NotNull(message = "Trash type is required")
    private TrashType trashType; // Assumes TrashType is an existing Enum

    // List of trash logs associated with this monitor
    private List<TrashRequestDTO> trashLogs;

    @NotEmpty(message = "mac address should not be empty")
    private String macAddress;
}