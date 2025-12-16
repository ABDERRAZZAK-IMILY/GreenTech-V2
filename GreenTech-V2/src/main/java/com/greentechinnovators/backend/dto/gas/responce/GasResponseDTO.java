package com.greentechinnovators.backend.dto.gas.responce;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GasResponseDTO {
    private String id;
    private Double consumedGas;

    private String usage;
    private String gasType;
    private Double quantity;
    private String unit;
    private String capacity;
    private String status;

    private LocalDateTime createdAt;
}
