package com.greentechinnovators.backend.seeder;

import com.greentechinnovators.backend.entity.SmartData;
import com.greentechinnovators.backend.repository.SmartDataRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final SmartDataRepository smartDataRepository;
    private final Random random = new Random();

    public DataSeeder(SmartDataRepository smartDataRepository) {
        this.smartDataRepository = smartDataRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // smartDataRepository.deleteAll();

        System.out.println("Starting Data Seeding...");

        seedEnergyData();

        seedWasteData();

        seedGasData();

        seedTransportData();

        System.out.println(" Data Seeding Completed!");
        System.out.println("Total records: " + smartDataRepository.count());
    }

    private void seedEnergyData() {
        List<SmartData> energyData = new ArrayList<>();
        String[] locations = {"production", "Bureaux", "Entrepôt", "Cafeteria"};

        for (int day = 30; day >= 0; day--) {
            for (int hour = 0; hour < 24; hour++) {
                for (String location : locations) {
                    SmartData data = new SmartData();
                    data.setDataType("ENERGY");
                    data.setValue(generateEnergyValue(hour));
                    data.setUnit("kWh");
                    data.setSensorId("ESP32-ELEC-" + location.substring(0, 3).toUpperCase());
                    data.setLocation(location);
                    data.setTimestamp(LocalDateTime.now().minusDays(day).minusHours(24 - hour));
                    data.setStatus("NORMAL");

                    energyData.add(data);
                }
            }
        }

        smartDataRepository.saveAll(energyData);
        System.out.println("⚡ Energy data seeded: " + energyData.size() + " records");
    }

    private void seedWasteData() {
        List<SmartData> wasteData = new ArrayList<>();
        String[] locations = {"production", "Bureaux", "Cafeteria", "Entrepôt"};
        String[] wasteTypes = {"organic", "recyclable", "non-recyclable", "electronic", "dangerous"};

        for (int day = 30; day >= 0; day--) {
            for (int reading = 0; reading < 12; reading++) {
                for (String location : locations) {
                    SmartData data = new SmartData();
                    data.setDataType("WASTE");
                    data.setValue(generateWasteValue());
                    data.setUnit("kg");
                    data.setSensorId("ESP32-WASTE-" + location.substring(0, 3).toUpperCase());
                    data.setLocation(location);
                    data.setWasteType(wasteTypes[random.nextInt(wasteTypes.length)]);
                    data.setTimestamp(LocalDateTime.now().minusDays(day).minusHours(reading * 2));
                    data.setStatus("NORMAL");

                    wasteData.add(data);
                }
            }
        }

        smartDataRepository.saveAll(wasteData);
        System.out.println("  Waste data seeded: " + wasteData.size() + " records");
    }

    private void seedGasData() {
        List<SmartData> gasData = new ArrayList<>();
        String[] locations = {"production", "Chaufferie", "Cuisine"};

        for (int day = 30; day >= 0; day--) {
            for (int hour = 0; hour < 24; hour++) {
                for (String location : locations) {
                    SmartData data = new SmartData();
                    data.setDataType("GAS");
                    data.setValue(generateGasValue(hour));
                    data.setUnit("m³");
                    data.setSensorId("ESP32-GAS-" + location.substring(0, 3).toUpperCase());
                    data.setLocation(location);
                    data.setTimestamp(LocalDateTime.now().minusDays(day).minusHours(24 - hour));
                    data.setStatus("NORMAL");

                    gasData.add(data);
                }
            }
        }

        smartDataRepository.saveAll(gasData);
        System.out.println(" Gas data seeded: " + gasData.size() + " records");
    }

    private void seedTransportData() {
        List<SmartData> transportData = new ArrayList<>();
        String[] vehicles = {"VH-001", "VH-002", "VH-003", "VH-004"};

        for (int day = 30; day >= 0; day--) {
            for (String vehicle : vehicles) {
                int trips = 2 + random.nextInt(3);
                for (int trip = 0; trip < trips; trip++) {
                    SmartData data = new SmartData();
                    data.setDataType("TRANSPORT");
                    data.setValue(generateTransportValue());
                    data.setUnit("km");
                    data.setSensorId("GPS-" + vehicle);
                    data.setLocation("Fleet");
                    data.setTimestamp(LocalDateTime.now().minusDays(day).minusHours(trip * 6));
                    data.setStatus("NORMAL");

                    transportData.add(data);
                }
            }
        }

        smartDataRepository.saveAll(transportData);
        System.out.println(" Transport data seeded: " + transportData.size() + " records");
    }

    private double generateEnergyValue(int hour) {
        double baseValue = (hour >= 8 && hour <= 18) ? 15.0 : 5.0;
        return baseValue + (random.nextDouble() * 10.0);
    }

    private double generateWasteValue() {
        return 1.0 + (random.nextDouble() * 15.0); // 1-16 kg
    }

    private double generateGasValue(int hour) {
        double baseValue = (hour >= 11 && hour <= 14) ? 3.0 : 1.0;
        return baseValue + (random.nextDouble() * 2.0);
    }

    private double generateTransportValue() {
        return 10.0 + (random.nextDouble() * 40.0); // 10-50 km
    }
}