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
@Document("Vehicle")
public class Vehicle {
    @Id
    private String id;
    private String licensePlate;
    private String model;
    private User user;
    @DBRef
    private List<VehicleLog>  vehicleLogs;


    private LocalDateTime lastSignalTime;
}
