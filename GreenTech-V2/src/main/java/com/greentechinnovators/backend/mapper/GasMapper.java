package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.gas.request.GasMonitorRequestDTO;
import com.greentechinnovators.backend.dto.gas.request.GasRequestDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasMonitorResponseDTO;
import com.greentechinnovators.backend.dto.gas.responce.GasResponseDTO;
import com.greentechinnovators.backend.entity.Gas;
import com.greentechinnovators.backend.entity.GasMonitor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GasMapper {

    // ========================================================================
    // 1. Gas (Child) Mappings
    // ========================================================================

    public Gas toEntity(GasRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Gas gas = new Gas();
        gas.setConsumedGas(dto.getConsumedGas());
        // createdAt is set by default in the Entity
        return gas;
    }

    public GasResponseDTO toResponse(Gas entity) {
        if (entity == null) {
            return null;
        }

        GasResponseDTO dto = new GasResponseDTO();
        dto.setId(entity.getId());
        dto.setConsumedGas(entity.getConsumedGas());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    // ========================================================================
    // 2. Gas Monitor (Parent) Mappings
    // ========================================================================

    public GasMonitor toEntity(GasMonitorRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        GasMonitor monitor = new GasMonitor();
        monitor.setLocation(dto.getLocation());
        monitor.setSensorId(dto.getSensorId());
        monitor.setStatus(dto.getStatus());
        monitor.setCo2Impact(dto.getCo2Impact());

        // Set timestamp for new monitor creation
        monitor.setTimestamp(LocalDateTime.now());

        // Map List<GasRequestDTO> -> List<Gas>
        // Assuming your GasMonitor entity field is named 'gas' or 'gasReadings'
        if (dto.getGasReadings() != null) {
            List<Gas> gasList = dto.getGasReadings().stream()
                    .map(this::toEntity)
                    .collect(Collectors.toList());
            monitor.setGas(gasList); // Make sure your Entity has setGas(List<Gas>)
        } else {
            monitor.setGas(new ArrayList<>());
        }

        return monitor;
    }

    public GasMonitorResponseDTO toResponse(GasMonitor entity) {
        if (entity == null) {
            return null;
        }

        GasMonitorResponseDTO dto = new GasMonitorResponseDTO();
        dto.setId(entity.getId());
        dto.setLocation(entity.getLocation());
        dto.setSensorId(entity.getSensorId());
        dto.setStatus(entity.getStatus());
        dto.setCo2Impact(entity.getCo2Impact());
        dto.setTimestamp(entity.getTimestamp());

        // Map List<Gas> -> List<GasResponseDTO>
        if (entity.getGas() != null) {
            List<GasResponseDTO> gasDtoList = entity.getGas().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            dto.setGasReadings(gasDtoList);
        } else {
            dto.setGasReadings(new ArrayList<>());
        }

        return dto;
    }
}