package com.greentechinnovators.backend.dto.vehicle.responce;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class DailyDistanceDTO {
    private LocalDateTime date;
    private Double totalDistanceKm;
    private Double carbonFootprintKg;
}
