package com.greentechinnovators.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class EnergyDtoResponse {

    private String id;
    private Double energyConsumed;
    private LocalDateTime createdAt =  LocalDateTime.now();


}
