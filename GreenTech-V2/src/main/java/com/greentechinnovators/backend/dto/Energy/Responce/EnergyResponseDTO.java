package com.greentechinnovators.backend.dto.Energy.Responce;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EnergyResponseDTO {
    private String id;
    private Double energyConsumed;
    private LocalDateTime createdAt;
}
