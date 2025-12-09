package com.greentechinnovators.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document("EnergyMonitor")
public class EnergyMonitor {
    @Id
    private String id;

    private String location;
    private String sensorId;
    private String status;
    private Double co2Impact;
    @DBRef
    private List<Energy> energy;

    private LocalDateTime timestamp;

}
