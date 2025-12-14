package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.Enums.Status;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnergyService {

    private final EnergyRepository repository;
    private final EnergyMapper mapper;
    private final EnergyMonitorRepository monitorRepository;
    private final CarbonFootprintService carbonFootprintService;

    public EnergyResponseDTO createReading(EnergyRequestDTO dto) {
        Energy energy = mapper.toEntity(dto);
        
        String macAddress = dto.getMacAddress();
        if (macAddress == null || macAddress.trim().isEmpty()) {
            log.warn("Received energy data without MAC address, generating default");
            macAddress = "UNKNOWN-" + System.currentTimeMillis();
        }
        
        final String finalMacAddress = macAddress;
        
        // Find or create EnergyMonitor by MAC address
        EnergyMonitor monitor = monitorRepository.findByMacAddress(finalMacAddress)
                .orElseGet(() -> {
                    log.info("Creating new EnergyMonitor for MAC address: {}", finalMacAddress);
                    EnergyMonitor newMonitor = new EnergyMonitor();
                    newMonitor.setMacAddress(finalMacAddress);
                    newMonitor.setLocation("Auto-registered");
                    newMonitor.setSensorId("SENSOR-" + finalMacAddress.replace(":", ""));
                    newMonitor.setStatus(Status.ONLINE);
                    newMonitor.setTimestamp(LocalDateTime.now());
                    newMonitor.setEnergy(new ArrayList<>());
                    return monitorRepository.save(newMonitor);
                });
        
        Energy res = repository.save(energy);
        monitor.getEnergy().add(res);
        monitorRepository.save(monitor);
        return mapper.toResponse(res);
    }


    public List<EnergyResponseDTO> getAllReadings() {
        List<Energy> energyList =  repository.findAll();
        return energyList.stream().map(mapper::toResponse).toList();
    }

    public List<EnergyResponseDTO> getTodayReadings() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);
        
        List<Energy> energyList = repository.findAll().stream()
                .filter(e -> e.getCreatedAt() != null && 
                           !e.getCreatedAt().isBefore(startOfToday) && 
                           e.getCreatedAt().isBefore(endOfToday))
                .toList();
        
        return energyList.stream().map(mapper::toResponse).toList();
    }

    public List<EnergyResponseDTO> getConsumedKwhBetweenDates(LocalDateTime start, LocalDateTime end) {

        List<Energy> allEnergy = repository.findAll();

        return allEnergy.stream()
                .filter(e -> {
                    if (e.getCreatedAt() == null) return false;

                    boolean isAfterStart = !e.getCreatedAt().isBefore(start); // >= start
                    boolean isBeforeEnd = !e.getCreatedAt().isAfter(end);     // <= end

                    return isAfterStart && isBeforeEnd;
                })
                .map(e -> EnergyResponseDTO.builder()
                        .id(e.getId().toString())
                        .energyConsumed(e.getEnergyConsumed())
                        .createdAt(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}