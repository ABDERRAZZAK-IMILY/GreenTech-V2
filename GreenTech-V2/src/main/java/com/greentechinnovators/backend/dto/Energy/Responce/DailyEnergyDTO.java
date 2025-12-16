package com.greentechinnovators.backend.dto.Energy.Responce;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class DailyEnergyDTO {
    private LocalDateTime date;
    private Double totalEnergyKwh;
    private Double carbonFootprintKg;
}
