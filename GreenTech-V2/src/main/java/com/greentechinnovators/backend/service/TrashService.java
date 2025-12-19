package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.Enums.Status;
import com.greentechinnovators.backend.Enums.TrashType;
import com.greentechinnovators.backend.dto.trash.request.TrashRequestDTO;
import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.dto.trash.response.TrashResponseDTO;
import com.greentechinnovators.backend.dto.vehicle.responce.DailyDistanceDTO;
import com.greentechinnovators.backend.entity.Energy;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.entity.TrashMonitor;
import com.greentechinnovators.backend.entity.VehicleLog;
import com.greentechinnovators.backend.mapper.TrashMapper;
import com.greentechinnovators.backend.repository.TrashMonitorRepository;
import com.greentechinnovators.backend.repository.TrashRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import com.greentechinnovators.backend.utils.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrashService {

    private final TrashRepository repository;
    private final TrashMonitorRepository trashMonitorRepository;
    private final CarbonFootprintService carbonFootprintService;

    private final TrashMapper mapper;

    public TrashResponseDTO saveReading(TrashRequestDTO dto) {

        String macAddress = dto.getMacAddress();

        if (macAddress == null || macAddress.trim().isEmpty()) {
            log.warn("Received trash data without MAC address, generating default");
            macAddress = "UNKNOWN-" + System.currentTimeMillis();
        }

        if ("MANUAL_ENTRY".equals(macAddress)) {
            return saveManualEntry(dto);
        }

        final String finalMacAddress = macAddress;

        TrashMonitor monitor = trashMonitorRepository.findByMacAddress(finalMacAddress)
                .orElseThrow(() -> {
                    log.warn(
                            "Received data from unregistered device with MAC address: {}. Device must be registered manually first.",
                            finalMacAddress);
                    return new IllegalArgumentException(
                            "Capteur non enregistré. L'adresse MAC '" + finalMacAddress
                                    + "' n'existe pas dans le système. " +
                                    "Veuillez d'abord créer le capteur manuellement dans le tableau de bord.");
                });

        Trash entity = mapper.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        Trash savedEntity = repository.save(entity);
        monitor.getTrash().add(savedEntity);
        trashMonitorRepository.save(monitor);
        return mapper.toResponse(savedEntity);
    }

    public TrashResponseDTO saveManualEntry(TrashRequestDTO dto) {
        log.info("Saving manual trash entry: {} kg", dto.getWeight());

        Trash entity = mapper.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        Trash savedEntity = repository.save(entity);

        log.info("Manual entry saved with ID: {}", savedEntity.getId());
        return mapper.toResponse(savedEntity);
    }

    public List<TrashResponseDTO> getAllReadings() {
        List<Trash> trashList = repository.findAll();

        return trashList.stream().map(mapper::toResponse).toList();
    }

    public List<TrashResponseDTO> getTodayReadings() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        List<Trash> trashList = repository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null &&
                        !t.getCreatedAt().isBefore(startOfToday) &&
                        t.getCreatedAt().isBefore(endOfToday))
                .toList();

        return trashList.stream().map(mapper::toResponse).toList();
    }

    public Double getConsumeTrashBetweenDates(LocalDateTime start, LocalDateTime end) {
        List<Trash> allTrash = repository.findAll();

        return allTrash.stream()
                .filter(t -> {
                    if (t.getCreatedAt() == null || t.getWight() == null)
                        return false;
                    boolean isAfterStart = !t.getCreatedAt().isBefore(start);
                    boolean isBeforeEnd = !t.getCreatedAt().isAfter(end);
                    return isAfterStart && isBeforeEnd;
                })
                .mapToDouble(Trash::getWight)
                .sum();
    }

    public List<DailyTrashDTO> TrashCarbonFootprint(LocalDateTime start, LocalDateTime end) {

        List<Trash> allTrash = repository.findAll();

        List<DailyTrashDTO> report = new ArrayList<>();
        LocalDateTime current = start;

        while (!current.isAfter(end)) {

            LocalDateTime startOfDay = current.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            Double totalWeight = allTrash.stream()
                    .filter(t -> {
                        if (t.getCreatedAt() == null || t.getWight() == null)
                            return false;

                        return !t.getCreatedAt().isBefore(startOfDay) &&
                                t.getCreatedAt().isBefore(endOfDay);
                    })
                    .mapToDouble(Trash::getWight)
                    .sum();

            Double dailyCarbon = calculateDailyFootPrint(totalWeight);

            report.add(DailyTrashDTO.builder()
                    .date(current)
                    .totalWeightKg(totalWeight)
                    .carbonFootprintKg(dailyCarbon)
                    .build());

            current = current.plusDays(1);
        }
        return report;
    }

    public Double calculateDailyFootPrint(Double weight) {
        return carbonFootprintService.calculateTrashFootprint(weight);
    }

}