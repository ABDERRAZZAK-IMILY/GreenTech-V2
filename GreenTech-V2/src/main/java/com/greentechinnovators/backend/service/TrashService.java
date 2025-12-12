package com.greentechinnovators.backend.service;

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
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashService {

    private final TrashRepository repository;
    private final TrashMonitorRepository trashMonitorRepository;
    private final CarbonFootprintService carbonFootprintService;

    private final TrashMapper mapper;

    public TrashResponseDTO saveReading(TrashRequestDTO dto) {

        TrashMonitor monitor = trashMonitorRepository.findByMacAddress(dto.getMacAddress()).orElseThrow(() -> {
            throw new RuntimeException("Mac address not found");
        });
        Trash entity = mapper.toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        Trash savedEntity = repository.save(entity);
        monitor.getTrash().add(savedEntity);
        trashMonitorRepository.save(monitor);
        return mapper.toResponse(savedEntity);


    }

    public List<TrashResponseDTO> getAllReadings() {
        List<Trash> trashList = repository.findAll();

        return trashList.stream().map(mapper::toResponse).toList();
    }
    public Double getConsumeTrashBetweenDates(LocalDateTime start, LocalDateTime end) {
        List<Trash> allTrash = repository.findAll();

        Double consumedTrash = allTrash.stream()
                .filter(t -> {
                    if (t.getCreatedAt() == null || t.getWight() == null) return false;

                    boolean isAfterStart = !t.getCreatedAt().isBefore(start);
                    boolean isBeforeEnd = !t.getCreatedAt().isAfter(end);

                    return isAfterStart && isBeforeEnd;
                })
                .mapToDouble(Trash::getWight)
                .sum();


        return consumedTrash;
    }
    public List<DailyTrashDTO> TrashCarbonFootprint(LocalDateTime start, LocalDateTime end) {
        List<DailyTrashDTO> report = new ArrayList<>();
        LocalDateTime current = start;
        while (!current.isAfter(end)) {

            // 1. Calculate distance for THIS specific day
            Double totalWight = totalWeightBerDay(current);
            Double dailyCarbon = calculateDailyFootPrint(totalWight);


            // 3. Add to report
            report.add(DailyTrashDTO.builder()
                    .date(current)
                    .totalWeightKg(totalWight)
                    .carbonFootprintKg(dailyCarbon)
                    .build());

            // Move to next day
            current = current.plusDays(1);
        }
        return null;
    }
    public Double calculateDailyFootPrint(Double weight) {
        return carbonFootprintService.calculateTransportFootprint(weight);
    }
    public Double totalWeightBerDay(LocalDateTime dateTimeInput) {
        LocalDate date = dateTimeInput.toLocalDate();

        LocalDateTime startOfDay = date.atStartOfDay();

        LocalDateTime startOfNextDay = date.plusDays(1).atStartOfDay();
        List<Trash> trashes = repository.findByCreatedAtBetween(startOfDay, startOfNextDay);
        if (trashes == null || trashes.size() < 2) {
            return 0.0;
        }

        return trashes.stream().mapToDouble(Trash::getWight).sum();
    }
}