package com.greentechinnovators.backend.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "transport_data")
public class TransportData {
    @Id
    private String id;

    private String vehicleId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private LocalDateTime timestamp;

    public TransportData(String vehicleId, Double latitude, Double longitude, Double speed) {
        this.vehicleId = vehicleId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.timestamp = LocalDateTime.now();
    }
}