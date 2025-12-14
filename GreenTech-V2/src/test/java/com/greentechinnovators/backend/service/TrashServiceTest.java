package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.repository.TrashRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class) // Darouri bach Mockito ykhdem
class TrashServiceTest {

    @Mock
    private TrashRepository trashRepository;

    @Mock
    private CarbonFootprintService carbonFootprintService;

    @InjectMocks
    private TrashService trashService;

    // --- LE TEST PRINCIPAL (Mslou7) ---

    @Test
    void testTrashCarbonFootprint_GeneratesReportCorrectly() {
        // Arrange
        LocalDateTime start = LocalDateTime.of(2025, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2025, 1, 2, 0, 0); // 2 Days total

        Trash t1 = new Trash();
        t1.setWight(10.0);
        t1.setCreatedAt(LocalDateTime.of(2025, 1, 1, 10, 0)); // Nhar 1

        Trash t2 = new Trash();
        t2.setWight(10.0);
        t2.setCreatedAt(LocalDateTime.of(2025, 1, 1, 15, 0)); // Nhar 1

        List<Trash> trashList = Arrays.asList(t1, t2); // Total = 20.0 le 1 Janvier

        when(trashRepository.findAll()).thenReturn(trashList);


        when(carbonFootprintService.calculateTransportFootprint(20.0)).thenReturn(5.0);

        List<DailyTrashDTO> result = trashService.TrashCarbonFootprint(start, end);

        assertNotNull(result);


        DailyTrashDTO day1 = result.stream()
                .filter(d -> d.getDate().toLocalDate().isEqual(start.toLocalDate()))
                .findFirst()
                .orElse(null);

        assertNotNull(day1);
        assertEquals(20.0, day1.getTotalWeightKg());
        assertEquals(5.0, day1.getCarbonFootprintKg());
    }

    @Test
    void testTrashCarbonFootprint_EmptyList_ReturnsZero() {
        LocalDateTime start = LocalDateTime.of(2025, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2025, 1, 1, 23, 59);

        when(trashRepository.findAll()).thenReturn(Collections.emptyList());
        List<DailyTrashDTO> result = trashService.TrashCarbonFootprint(start, end);

        DailyTrashDTO day1 = result.get(0);
        assertEquals(0.0, day1.getTotalWeightKg());
    }
}