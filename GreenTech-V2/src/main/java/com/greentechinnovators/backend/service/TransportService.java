package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.TransportDataDto;
import com.greentechinnovators.backend.entity.TransportData;
import com.greentechinnovators.backend.mapper.TransportMapper;
import com.greentechinnovators.backend.repository.TransportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransportService {

    private final TransportRepository transportRepository;
    private final TransportMapper transportMapper;

    public TransportService(TransportRepository transportRepository, TransportMapper transportMapper) {
        this.transportRepository = transportRepository;
        this.transportMapper = transportMapper;
    }

    public void saveLocation(TransportDataDto dto) {
        TransportData entity = transportMapper.toEntity(dto);
        transportRepository.save(entity);
    }

    public List<TransportDataDto> getFleetStatus() {
        List<TransportData> allData = transportRepository.findAll();

        Map<String, TransportData> latestPositions = allData.stream()
                .collect(Collectors.toMap(
                        TransportData::getVehicleId,
                        data -> data,
                        (existing, replacement) -> existing.getTimestamp().isAfter(replacement.getTimestamp()) ? existing : replacement
                ));

        return latestPositions.values().stream()
                .map(transportMapper::toDto)
                .collect(Collectors.toList());
    }
}