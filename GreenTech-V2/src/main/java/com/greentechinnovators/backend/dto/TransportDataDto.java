package com.greentechinnovators.backend.dto;

import lombok.Data;

@Data
public class TransportDataDto {
    private String vehicleId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private String status;
    private String timestamp;
}