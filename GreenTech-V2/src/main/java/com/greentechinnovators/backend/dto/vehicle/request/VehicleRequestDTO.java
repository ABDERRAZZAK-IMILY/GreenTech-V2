package com.greentechinnovators.backend.dto.vehicle.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VehicleRequestDTO {

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotBlank(message = "Vehicle model is required")
    private String model;

    // We accept the User ID to link this vehicle to a specific user
    @NotBlank(message = "User ID is required")
    private String userId;
}
