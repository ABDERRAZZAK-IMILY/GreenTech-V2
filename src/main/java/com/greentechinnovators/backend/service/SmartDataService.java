package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.SmartDataDto;
import com.greentechinnovators.backend.entity.SmartData;
import com.greentechinnovators.backend.mapper.SmartDataMapper;
import com.greentechinnovators.backend.repository.SmartDataRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmartDataService {

    private final SmartDataRepository repository;
    private final SmartDataMapper mapper;

    public SmartDataService(SmartDataRepository repository, SmartDataMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public SmartDataDto saveReading(SmartDataDto dto) {
        SmartData entity = mapper.toEntity(dto);

        if ("ENERGY".equals(entity.getDataType())) {
            entity.setCo2Impact(entity.getValue() * 0.5);
        } else if ("WASTE".equals(entity.getDataType())) {
            entity.setCo2Impact(entity.getValue() * 2.0);
        }

        SmartData savedEntity = repository.save(entity);
        return mapper.toDto(savedEntity);
    }

    public List<SmartDataDto> getReadingsByType(String type) {
        return repository.findByDataTypeOrderByTimestampDesc(type)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}