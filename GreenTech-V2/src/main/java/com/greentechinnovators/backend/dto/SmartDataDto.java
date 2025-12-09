package com.greentechinnovators.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SmartDataDto {
    private String id;
    private String dataType;   // ENERGY, WASTE
    private Double value;
    private String unit;
    private String location;
    private String sensorId;
    private String wasteType;  // organic, recyclable, non-recyclable, electronic, dangerous

    private String formattedTimestamp;

    private String status;
}