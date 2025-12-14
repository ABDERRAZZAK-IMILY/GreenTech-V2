package com.greentechinnovators.backend.dto.gas.responce;

import com.greentechinnovators.backend.Enums.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GasMonitorResponseDTO {
    private String id;
    private String location;
    private String sensorId;
    private Status status;
    private Double co2Impact;
    private LocalDateTime timestamp;

    // Returns the detailed gas data
    private List<GasResponseDTO> gasReadings;
}