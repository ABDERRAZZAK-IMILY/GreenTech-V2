package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.gas.request.GasMonitorRequestDTO;
import com.greentechinnovators.backend.dto.gas.request.GasRequestDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasMonitorResponseDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.entity.Gas;
import com.greentechinnovators.backend.entity.GasMonitor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GasMapper {

    public Gas toEntity(GasRequestDTO dto) {
        if (dto == null)
            return null;

        Gas gas = new Gas();
        gas.setConsumedGas(dto.getConsumedGas());

        gas.setUsage(dto.getUsage());
        gas.setGasType(dto.getGasType());
        gas.setQuantity(dto.getQuantity());
        gas.setUnit(dto.getUnit());
        gas.setCapacity(dto.getCapacity());
        gas.setStatus(dto.getStatus());

        return gas;
    }

    public GasResponseDTO toResponse(Gas entity) {
        if (entity == null)
            return null;

        return GasResponseDTO.builder()
                .id(entity.getId())
                .consumedGas(entity.getConsumedGas())

                .usage(entity.getUsage())
                .gasType(entity.getGasType())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .capacity(entity.getCapacity())
                .status(entity.getStatus())

                .createdAt(entity.getCreatedAt())
                .build();
    }

    public GasMonitor toEntity(GasMonitorRequestDTO dto) {
        if (dto == null)
            return null;

        GasMonitor monitor = new GasMonitor();
        monitor.setLocation(dto.getLocation());
        monitor.setSensorId(dto.getSensorId());
        monitor.setStatus(dto.getStatus());
        monitor.setCo2Impact(dto.getCo2Impact());
        monitor.setTimestamp(LocalDateTime.now());

        List<Gas> gasList = (dto.getGasReadings() == null) ? Collections.emptyList()
                : dto.getGasReadings().stream()
                        .map(this::toEntity)
                        .collect(Collectors.toList());

        monitor.setGas(gasList);
        return monitor;
    }

    public GasMonitorResponseDTO toResponse(GasMonitor entity) {
        if (entity == null)
            return null;

        return GasMonitorResponseDTO.builder()
                .id(entity.getId())
                .location(entity.getLocation())
                .sensorId(entity.getSensorId())
                .status(entity.getStatus())
                .co2Impact(entity.getCo2Impact())
                .timestamp(entity.getTimestamp())
                .gasReadings(entity.getGas() == null ? Collections.emptyList()
                        : entity.getGas().stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList()))
                .build();
    }
}