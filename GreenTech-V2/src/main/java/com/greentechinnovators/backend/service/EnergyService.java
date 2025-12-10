package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.EnergyDtoRequest;
import com.greentechinnovators.backend.dto.EnergyDtoResponse;
import com.greentechinnovators.backend.entity.Energy;
import com.greentechinnovators.backend.mapper.EnergyMapper;
import com.greentechinnovators.backend.repository.EnergyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnergyService {

    private final EnergyRepository repository;
    private final EnergyMapper mapper;

    public EnergyDtoResponse createReading(EnergyDtoRequest dto) {

        Energy energy = mapper.toEntity(dto);

        Energy res =  repository.save(energy);

        return mapper.toDto(res);


    }



    public List<EnergyDtoResponse> getAllReadings() {
        List<Energy> energyList =  repository.findAllByOrderByTimestampDesc();

        return energyList.stream().map(mapper::toDto).toList();

    }
}