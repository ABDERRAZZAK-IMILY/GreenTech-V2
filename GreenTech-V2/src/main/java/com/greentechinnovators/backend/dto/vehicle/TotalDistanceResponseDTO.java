package com.greentechinnovators.backend.dto.vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TotalDistanceResponseDTO {
    private String id;       // The Vehicle ID
    private Double distance; // The total distance calculated
}