package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.Energy.Request.EnergyRequestDTO;
import com.greentechinnovators.backend.dto.Energy.Responce.EnergyResponseDTO;
import com.greentechinnovators.backend.entity.Energy;
import com.greentechinnovators.backend.entity.EnergyMonitor;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.mapper.EnergyMapper;
import com.greentechinnovators.backend.repository.EnergyMonitorRepository;
import com.greentechinnovators.backend.repository.EnergyRepository;
import com.greentechinnovators.backend.repository.GasMonitorRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnergyService {

    private final EnergyRepository repository;
    private final EnergyMapper mapper;
    private final EnergyMonitorRepository monitorRepository;
    private final CarbonFootprintService carbonFootprintService;

    public EnergyResponseDTO createReading(EnergyRequestDTO dto) {
        Energy energy = mapper.toEntity(dto);
        EnergyMonitor monitor = monitorRepository.findByMacAddress(dto.getMacAddress()).orElseThrow(()->{
            throw new RuntimeException("Mac address not found");
        });
        Energy res =  repository.save(energy);
        monitor.getEnergy().add(res);
        monitorRepository.save(monitor);
        return mapper.toResponse(res);
    }


    public List<EnergyResponseDTO> getAllReadings() {
        List<Energy> energyList =  repository.findAll();
        return energyList.stream().map(mapper::toResponse).toList();
    }





    public Double getConsumedKwhBetweenDates(LocalDateTime start, LocalDateTime end) {

        List<Energy> allEnergy = repository.findAll();


        Double consumedEnergy = allEnergy.stream()
                .filter(e -> {
                    if (e.getCreatedAt() == null || e.getEnergyConsumed() == null) return false;

                    boolean isAfterStart = !e.getCreatedAt().isBefore(start);
                    boolean isBeforeEnd = !e.getCreatedAt().isAfter(end);

                    return isAfterStart && isBeforeEnd;
                })
                .mapToDouble(Energy::getEnergyConsumed)
                .sum();


        return consumedEnergy;
    }
}