package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyMonitorRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyMonitorResponseDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.entity.Energy;
import com.greentechinnovators.backend.entity.EnergyMonitor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EnergyMapper {

    // ========================================================================
    // 1. Energy (Child) Mappings
    // ========================================================================

    public Energy toEntity(EnergyRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Energy energy = new Energy();
        energy.setEnergyConsumed(dto.getEnergyConsumed());
        // createdAt is set by default in the Entity constructor/definition
        return energy;
    }

    public EnergyResponseDTO toResponse(Energy entity) {
        if (entity == null) {
            return null;
        }

        EnergyResponseDTO dto = new EnergyResponseDTO();
        dto.setId(entity.getId());
        dto.setEnergyConsumed(entity.getEnergyConsumed());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    // ========================================================================
    // 2. Energy Monitor (Parent) Mappings
    // ========================================================================

    public EnergyMonitor toEntity(EnergyMonitorRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        EnergyMonitor monitor = new EnergyMonitor();
        monitor.setLocation(dto.getLocation());
        monitor.setSensorId(dto.getSensorId());
        monitor.setStatus(dto.getStatus());
        monitor.setCo2Impact(dto.getCo2Impact());

        // We typically set the timestamp on creation
        monitor.setTimestamp(LocalDateTime.now());

        // Manual List Conversion: RequestDTO List -> Entity List
        if (dto.getEnergyReadings() != null) {
            List<Energy> energyList = dto.getEnergyReadings().stream()
                    .map(this::toEntity) // reusing the method above
                    .collect(Collectors.toList());
            monitor.setEnergy(energyList);
        } else {
            monitor.setEnergy(new ArrayList<>());
        }

        return monitor;
    }

    public EnergyMonitorResponseDTO toResponse(EnergyMonitor entity) {
        if (entity == null) {
            return null;
        }

        EnergyMonitorResponseDTO dto = new EnergyMonitorResponseDTO();
        dto.setId(entity.getId());
        dto.setLocation(entity.getLocation());
        dto.setSensorId(entity.getSensorId());
        dto.setStatus(entity.getStatus());
        dto.setCo2Impact(entity.getCo2Impact());
        dto.setTimestamp(entity.getTimestamp());

        // Manual List Conversion: Entity List -> ResponseDTO List
        if (entity.getEnergy() != null) {
            List<EnergyResponseDTO> energyDtoList = entity.getEnergy().stream()
                    .map(this::toResponse) // reusing the method above
                    .collect(Collectors.toList());
            dto.setEnergy(energyDtoList);
        } else {
            dto.setEnergy(new ArrayList<>());
        }

        return dto;
    }
}