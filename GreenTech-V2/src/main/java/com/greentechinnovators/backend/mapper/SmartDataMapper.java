package com.greentechinnovators.backend.mapper;

import com.greentechinnovators.backend.dto.SmartDataDto;
import com.greentechinnovators.backend.entity.SmartData;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class SmartDataMapper {

    public SmartDataDto toDto(SmartData entity) {
        if (entity == null) return null;

        SmartDataDto dto = new SmartDataDto();
        dto.setId(entity.getId());
        dto.setDataType(entity.getDataType());
        dto.setValue(entity.getValue());
        dto.setUnit(entity.getUnit());
        dto.setLocation(entity.getLocation());
        dto.setSensorId(entity.getSensorId());
        dto.setWasteType(entity.getWasteType());

        if (entity.getTimestamp() != null) {
            dto.setFormattedTimestamp(entity.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }

        dto.setStatus(calculateStatus(entity.getDataType(), entity.getValue()));

        return dto;
    }

    public SmartData toEntity(SmartDataDto dto) {
        if (dto == null) return null;

        SmartData entity = new SmartData();
        entity.setDataType(dto.getDataType());
        entity.setValue(dto.getValue());
        entity.setUnit(dto.getUnit());
        entity.setLocation(dto.getLocation());
        entity.setSensorId(dto.getSensorId());
        entity.setWasteType(dto.getWasteType());

        entity.setTimestamp(LocalDateTime.now());

        return entity;
    }

    private String calculateStatus(String type, Double value) {
        if ("ENERGY".equals(type) && value > 100) return "HIGH_CONSUMPTION";
        if ("WASTE".equals(type) && value > 50) return "FULL_BIN";
        return "NORMAL";
    }
}