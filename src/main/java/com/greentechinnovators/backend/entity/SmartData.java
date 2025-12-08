package com.greentechinnovators.backend.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "smart_data")
public class SmartData {
    @Id
    private String id;

    private String dataType;   // "ENERGY", "WASTE", "TRANSPORT", "GAS"
    private Double value;
    private String unit;       // "kWh", "kg", "km", "m3"
    private String location;   // "Production", "Office"
    private String sensorId;   // "ESP32-001"
    private String wasteType;  // "organic", "recyclable", "non-recyclable", "electronic", "dangerous"

    private String status;

    private Double co2Impact;
    private LocalDateTime timestamp;

    public SmartData() {
        this.timestamp = LocalDateTime.now();
    }
}