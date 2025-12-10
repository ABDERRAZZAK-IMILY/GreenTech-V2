package com.greentechinnovators.backend.dto.trash.response;

import com.greentechinnovators.backend.Enums.TrashType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TrashMonitorResponseDTO {
    private String id;
    private String location;
    private String sensorId;
    private String status;
    private Double co2Impact;
    private TrashType trashType;
    private LocalDateTime timestamp;

    // Returns the detailed trash data
    private List<TrashResponseDTO> trashLogs;
}
