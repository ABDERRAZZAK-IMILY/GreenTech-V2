package com.greentechinnovators.backend.dto.vehicle.responce;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VehicleLogResponseDTO {
    private String id;
    private String vehicleId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;

    // Embedding the basic vehicle info is often helpful in logs
    private VehicleResponseDTO vehicle;
}
