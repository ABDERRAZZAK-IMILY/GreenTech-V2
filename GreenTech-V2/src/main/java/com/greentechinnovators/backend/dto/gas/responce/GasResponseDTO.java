package com.greentechinnovators.backend.dto.gas.responce;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GasResponseDTO {
    private String id;
    private Double consumedGas;
    private LocalDateTime createdAt;
}
