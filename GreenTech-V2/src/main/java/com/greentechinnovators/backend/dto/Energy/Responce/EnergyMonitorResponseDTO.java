package com.greentechinnovators.backend.dto.Energy.Responce;
import com.greentechinnovators.backend.Enums.Status;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EnergyMonitorResponseDTO {
    private String id;
    private String location;
    private String sensorId;
    private Status status;
    private Double co2Impact;
    private LocalDateTime timestamp;

    private List<EnergyResponseDTO> energy;
}