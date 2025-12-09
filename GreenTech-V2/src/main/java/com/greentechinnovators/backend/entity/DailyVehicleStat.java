package com.greentechinnovators.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Document("DailyVehicleStats")
// This index ensures you can quickly find a record by Vehicle AND Date
@CompoundIndexes({
        @CompoundIndex(name = "vehicle_date_idx", def = "{'vehicleId': 1, 'date': 1}", unique = true)
})
public class DailyVehicleStat {
    @Id
    private String id;

    private String vehicleId;

    // Using LocalDate because we only care about the Day (YYYY-MM-DD), not the time
    private LocalDate date;

    private Double dailyDistanceKm;
}
