package com.greentechinnovators.backend.dto.gas.responce;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class GasMonitorResponseDTO {
    private String id;
    private String location;
    private String sensorId;
    private String status;
    private Double co2Impact;
    private LocalDateTime timestamp;

    // Returns the detailed gas data
    private List<GasResponseDTO> gasReadings;
}