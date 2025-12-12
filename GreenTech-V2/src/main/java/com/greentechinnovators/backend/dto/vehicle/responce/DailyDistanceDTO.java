package com.greentechinnovators.backend.dto.vehicle.responce;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class DailyDistanceDTO {
    private LocalDate date;
    private Double totalDistanceKm;
    private Double carbonFootprintKg; // Optional: if you want to include carbon
}
