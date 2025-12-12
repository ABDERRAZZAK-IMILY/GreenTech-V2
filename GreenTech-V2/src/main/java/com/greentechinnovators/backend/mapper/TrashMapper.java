package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.trash.request.TrashMonitorRequestDTO;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashMonitorResponseDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.entity.TrashMonitor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TrashMapper {

    // ========================================================================
    // 1. Trash (Child) Mappings
    // ========================================================================

    public Trash toEntity(TrashRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Trash trash = new Trash();
        trash.setWight(dto.getWeight()); // Note: Ensure entity setter matches typo or fix in entity
        // createdAt is set by default in the Entity
        return trash;
    }

    public TrashResponseDTO toResponse(Trash entity) {
        if (entity == null) {
            return null;
        }

        TrashResponseDTO dto = new TrashResponseDTO();
        dto.setId(entity.getId());
        dto.setWeight(entity.getWight()); // Matching entity getter
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }

    // ========================================================================
    // 2. Trash Monitor (Parent) Mappings
    // ========================================================================

    public TrashMonitor toEntity(TrashMonitorRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        TrashMonitor monitor = new TrashMonitor();
        monitor.setLocation(dto.getLocation());
        monitor.setSensorId(dto.getSensorId());
        monitor.setMacAddress(dto.getMacAddress());
        monitor.setStatus(dto.getStatus());
        monitor.setCo2Impact(dto.getCo2Impact());
        monitor.setTrashType(dto.getTrashType());

        // Set timestamp for new monitor creation
        monitor.setTimestamp(LocalDateTime.now());

        // Map List<TrashRequestDTO> -> List<Trash>
        if (dto.getTrashLogs() != null) {
            List<Trash> trashList = dto.getTrashLogs().stream()
                    .map(this::toEntity)
                    .collect(Collectors.toList());
            monitor.setTrash(trashList);
        } else {
            monitor.setTrash(new ArrayList<>());
        }

        return monitor;
    }

    public TrashMonitorResponseDTO toResponse(TrashMonitor entity) {
        if (entity == null) {
            return null;
        }

        TrashMonitorResponseDTO dto = new TrashMonitorResponseDTO();
        dto.setId(entity.getId());
        dto.setLocation(entity.getLocation());
        dto.setSensorId(entity.getSensorId());
        dto.setMacAddress(entity.getMacAddress());
        dto.setStatus(entity.getStatus());
        dto.setCo2Impact(entity.getCo2Impact());
        dto.setTrashType(entity.getTrashType());
        dto.setTimestamp(entity.getTimestamp());

        // Map List<Trash> -> List<TrashResponseDTO>
        if (entity.getTrash() != null) {
            List<TrashResponseDTO> trashDtoList = entity.getTrash().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            dto.setTrashLogs(trashDtoList);
        } else {
            dto.setTrashLogs(new ArrayList<>());
        }

        return dto;
    }
}
