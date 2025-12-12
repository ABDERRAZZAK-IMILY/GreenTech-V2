package com.greentechinnovators.backend.dto.trash.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
public class DailyTrashDTO {
    private LocalDateTime date;
    private Double totalWeightKg;
    private Double carbonFootprintKg;
}
