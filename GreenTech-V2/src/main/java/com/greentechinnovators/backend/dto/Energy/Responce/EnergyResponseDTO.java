package com.greentechinnovators.backend.dto.Energy.Responce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyResponseDTO {
    private String id;
    private Double energyConsumed;
    private LocalDateTime createdAt;
}
