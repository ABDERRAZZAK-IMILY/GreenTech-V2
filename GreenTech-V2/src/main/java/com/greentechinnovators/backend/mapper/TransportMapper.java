package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.entity.TransportData;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class TransportMapper {

    public TransportDataDto toDto(TransportData entity) {
        if (entity == null) {
            return null;
        }

        TransportDataDto dto = new TransportDataDto();
        dto.setVehicleId(entity.getVehicleId());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setSpeed(entity.getSpeed());
        dto.setStatus(entity.getStatus());

        if (entity.getTimestamp() != null) {
            dto.setTimestamp(entity.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        }

        return dto;
    }

    public TransportData toEntity(TransportDataDto dto) {
        if (dto == null) {
            return null;
        }

        TransportData entity = new TransportData();
        entity.setVehicleId(dto.getVehicleId());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setSpeed(dto.getSpeed());
        entity.setStatus(dto.getStatus());

        entity.setTimestamp(LocalDateTime.now());

        return entity;
    }
}