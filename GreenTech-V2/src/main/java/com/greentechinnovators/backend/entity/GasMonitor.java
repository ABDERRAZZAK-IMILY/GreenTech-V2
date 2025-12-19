package com.greentechinnovators.backend.entity;

import com.greentechinnovators.backend.Enums.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document("GasMonitor")
public class GasMonitor {
    @Id
    private String id;

    private String location;
    private String sensorId;
    private Status status;
    private Double co2Impact;
    @DBRef
    private List<Gas> gas = new ArrayList<>();

    private LocalDateTime timestamp;
}
