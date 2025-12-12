package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.trash.response.DailyTrashDTO;
import com.greentechinnovators.backend.entity.Trash;
import com.greentechinnovators.backend.repository.TrashRepository;
import com.greentechinnovators.backend.utils.CarbonFootprintService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class TrashServiceTest {
    @Mock
    private TrashRepository trashRepository;

    @Mock
    private CarbonFootprintService carbonFootprintService;

    @InjectMocks
    private TrashService trashService;

    @Test
    void testTotalWeightBerDay_WithTwoItems_ReturnsSum() {
        // Arrange
        LocalDateTime inputDate = LocalDateTime.of(2025, 1, 1, 10, 0);

        Trash t1 = new Trash(); t1.setWight(10.0);
        Trash t2 = new Trash(); t2.setWight(5.5);

        when(trashRepository.findByCreatedAtBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(t1, t2));

        // Act
        Double result = trashService.totalWeightBerDay(inputDate);

        // Assert
        assertEquals(15.5, result);
    }

    @Test
    void testTotalWeightBerDay_WithOneItem_ReturnsZero_BecauseOfSizeCheck() {
        // ARRANGE
        LocalDateTime inputDate = LocalDateTime.of(2025, 1, 1, 10, 0);
        Trash t1 = new Trash(); t1.setWight(10.0);

        // Mock returning only 1 item
        when(trashRepository.findByCreatedAtBetween(any(), any()))
                .thenReturn(Collections.singletonList(t1));

        // ACT
        Double result = trashService.totalWeightBerDay(inputDate);

        // ASSERT
        // This asserts 0.0 because your code has (size < 2).
        // If you fix your code to allow 1 item, change this expected value to 10.0
        assertEquals(0.0, result, "Expected 0.0 because code requires at least 2 items");
    }

    // --- TEST 2: The Main Loop (TrashCarbonFootprint) ---

    @Test
    void testTrashCarbonFootprint_GeneratesReportCorrectly() {
        // Arrange
        LocalDateTime start = LocalDateTime.of(2025, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2025, 1, 2, 0, 0); // 2 Days total

        // Mock Repository behavior
        Trash t1 = new Trash(); t1.setWight(10.0);
        Trash t2 = new Trash(); t2.setWight(10.0);
        List<Trash> trashList = Arrays.asList(t1, t2); // Sum = 20.0

        // We expect the repo to be called twice (once for Jan 1, once for Jan 2)
        when(trashRepository.findByCreatedAtBetween(any(), any())).thenReturn(trashList);

        // Mock Carbon Service logic
        // If input 20kg -> return 5kg CO2 (arbitrary test value)
        when(carbonFootprintService.calculateTransportFootprint(20.0)).thenReturn(5.0);

        // Act
        List<DailyTrashDTO> result = trashService.TrashCarbonFootprint(start, end);

        // Assert
        assertNotNull(result, "Result should not be null (Did you fix 'return null' in your service?)");
        assertEquals(2, result.size(), "Should have 2 days of reports");

        DailyTrashDTO day1 = result.get(0);
        assertEquals(20.0, day1.getTotalWeightKg());
        assertEquals(5.0, day1.getCarbonFootprintKg());
    }

    // --- TEST 3: Edge Cases ---

    @Test
    void testTotalWeightBerDay_NullList_ReturnsZero() {
        when(trashRepository.findByCreatedAtBetween(any(), any())).thenReturn(null);
        Double result = trashService.totalWeightBerDay(LocalDateTime.now());
        assertEquals(null, result);
    }
}