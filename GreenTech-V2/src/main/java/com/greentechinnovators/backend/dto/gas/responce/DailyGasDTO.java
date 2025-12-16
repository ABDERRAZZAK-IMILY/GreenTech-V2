package com.greentechinnovators.backend.dto.gas.responce;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class DailyGasDTO {
    private LocalDateTime date;
    private Double totalGasConsumed;
    private Double carbonFootprintKg;
}
