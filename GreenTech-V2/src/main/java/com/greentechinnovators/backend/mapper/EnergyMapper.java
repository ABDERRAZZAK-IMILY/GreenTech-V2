package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.EnergyDtoRequest;
import com.greentechinnovators.backend.dto.EnergyDtoResponse;
import com.greentechinnovators.backend.entity.Energy;
import org.springframework.stereotype.Component;

@Component
public class EnergyMapper {

    public Energy toEntity(EnergyDtoRequest request) {
        if (request == null) {
            return null;
        }

        return Energy.builder()
                .energyConsumed(request.getEnergyConsumed())
                .build();
    }

    public EnergyDtoResponse toDto(Energy energy) {
        if (energy == null) {
            return null;
        }

        return EnergyDtoResponse.builder()
                .id(energy.getId())
                .energyConsumed(energy.getEnergyConsumed())
                .createdAt(energy.getCreatedAt())
                .build();
    }
}
