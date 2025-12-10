package com.greentechinnovators.backend.dto.vehicle.responce;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VehicleResponseDTO {
    private String id;
    private String licensePlate;
    private String model;
    private LocalDateTime lastSignalTime;

    // You can return the full UserDTO here, or just the ID depending on your UI needs
    private String userId;
}
