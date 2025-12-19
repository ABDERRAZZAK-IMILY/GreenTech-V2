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

        String macAddress = dto.getMacAddress();
        if (macAddress == null || macAddress.trim().isEmpty()) {
            log.warn("Received energy data without MAC address, generating default");
            macAddress = "UNKNOWN-" + System.currentTimeMillis();
        }

        if ("MANUAL_ENTRY".equals(macAddress)) {
            return saveManualEntry(dto);
        }

        final String finalMacAddress = macAddress;
        Energy energy = mapper.toEntity(dto);

        EnergyMonitor monitor = monitorRepository.findByMacAddress(finalMacAddress)
                .orElseThrow(() -> {
                    log.warn(
                            "Received data from unregistered device with MAC address: {}. Device must be registered manually first.",
                            finalMacAddress);
                    return new IllegalArgumentException(
                            "Capteur non enregistré. L'adresse MAC '" + finalMacAddress
                                    + "' n'existe pas dans le système. " +
                                    "Veuillez d'abord créer le capteur manuellement dans le tableau de bord.");
                });

        Energy res = repository.save(energy);
        monitor.getEnergy().add(res);
        monitorRepository.save(monitor);
        return mapper.toResponse(res);
    }

    public EnergyResponseDTO saveManualEntry(EnergyRequestDTO dto) {
        log.info("Saving manual energy entry: {} kWh", dto.getEnergyConsumed());

        Energy energy = mapper.toEntity(dto);
        if (energy.getCreatedAt() == null) {
            energy.setCreatedAt(LocalDateTime.now());
        }
        Energy savedEntity = repository.save(energy);

        log.info("Manual energy entry saved with ID: {}", savedEntity.getId());
        return mapper.toResponse(savedEntity);
    }

    public List<EnergyResponseDTO> getAllReadings() {
        List<Energy> energyList = repository.findAll();
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
                    if (e.getCreatedAt() == null)
                        return false;

                    boolean isAfterStart = !e.getCreatedAt().isBefore(start);
                    boolean isBeforeEnd = !e.getCreatedAt().isAfter(end);

                    return isAfterStart && isBeforeEnd;
                })
                .map(e -> EnergyResponseDTO.builder()
                        .id(e.getId().toString())
                        .energyConsumed(e.getEnergyConsumed())
                        .createdAt(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<com.greentechinnovators.backend.dto.Energy.Responce.DailyEnergyDTO> getDailyEnergy(LocalDateTime start,
            LocalDateTime end) {
        List<Energy> allEnergy = repository.findAll();
        List<com.greentechinnovators.backend.dto.Energy.Responce.DailyEnergyDTO> report = new ArrayList<>();
        LocalDateTime current = start;

        while (!current.isAfter(end)) {
            LocalDateTime startOfDay = current.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            double totalEnergy = allEnergy.stream()
                    .filter(e -> e.getCreatedAt() != null &&
                            !e.getCreatedAt().isBefore(startOfDay) &&
                            e.getCreatedAt().isBefore(endOfDay))
                    .mapToDouble(Energy::getEnergyConsumed)
                    .sum();

            double carbonFootprint = carbonFootprintService.calculateEnergyFootprint(totalEnergy);

            report.add(com.greentechinnovators.backend.dto.Energy.Responce.DailyEnergyDTO.builder()
                    .date(current)
                    .totalEnergyKwh(totalEnergy)
                    .carbonFootprintKg(carbonFootprint)
                    .build());

            current = current.plusDays(1);
        }
        return report;
    }

}