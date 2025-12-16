package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.entity.*;
import com.greentechinnovators.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j

public class RagService {

    // 1. Inject Repositories
    private final DepartmentRepository departmentRepository;
    private final EnergyRepository energyMonitorRepository;
    private final GasRepository gasMonitorRepository;
    private final TrashRepository trashMonitorRepository;
    private final UserRepository userRepository;
    private final VehicleLogRepository vehicleRepository;
    private final SmartDataRepository smartDataRepository;

    private final EmbeddingModel embeddingModel;
    private SimpleVectorStore vectorStore;

    @Bean
    public VectorStore vectorStore() {
        this.vectorStore = new SimpleVectorStore(embeddingModel);
        File file = new File("src/main/resources/vector_store.json");
        if (file.exists()) {
            this.vectorStore.load(file);
            log.info(" Vector Store successfully loaded from file.");
        }
        return this.vectorStore;
    }

    @Async
    public void loadDataToVectorStore() {
        log.info("🔄 Starting ingestion of all data from MongoDB...");

        List<Document> allDocuments = new ArrayList<>();


        List<Department> departments = departmentRepository.findAll();
        List<Document> departmentDocs = departments.stream().map(d -> {
            String usersList = d.getUsers().stream()
                    .map(User::getName)
                    .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);

            String content = "Department: " + d.getName() +
                    ", Employees: " + (usersList.isEmpty() ? "None" : usersList);
            return new Document(content);
        }).toList();
        allDocuments.addAll(departmentDocs);

        // 2. Users
        List<User> users = userRepository.findAll();
        List<Document> userDocs = users.stream().map(u -> {
            // Content in English
            String content = "User: " + u.getName() +
                    ", Email: " + u.getEmail() +
                    ", Job Title: " + u.getJobTitle() +
                    ", Role: " + u.getRole().name();
            return new Document(content);
        }).toList();
        allDocuments.addAll(userDocs);

        // 3. Vehicles
        List<VehicleLog> vehicleLogs = vehicleRepository.findAll();
        List<Document> vehicleLogDocs = vehicleLogs.stream().map(vl -> {
            String content = "Vehicle Log: Vehicle ID " + vl.getVehicleId() +
                    ", Coordinates: Latitude " + vl.getLatitude() +
                    ", Longitude: " + vl.getLongitude() +
                    ", Timestamp: " + vl.getCreatedAt();
            return new Document(content);
        }).toList();
        allDocuments.addAll(vehicleLogDocs);


        List<Energy> energies = energyMonitorRepository.findAll();
        List<Document> energyDocs = energies.stream().map(e -> {
            String content = "Energy Reading: Consumed " + e.getEnergyConsumed() + " units," +
                    " Recorded at: " + e.getCreatedAt();
            return new Document(content);
        }).toList();
        allDocuments.addAll(energyDocs);

        // 5. Gas Monitors
        List<Gas> gases = gasMonitorRepository.findAll();
        List<Document> gasDocs = gases.stream().map(g -> {
            String content = "Gas Reading: Type " + g.getGasType() +
                    ", Consumed: " + g.getConsumedGas() +
                    ", Status: " + g.getStatus() +
                    ", Usage: " + g.getUsage();
            return new Document(content);
        }).toList();
        allDocuments.addAll(gasDocs);

        List<Trash> trashItems = trashMonitorRepository.findAll();
        List<Document> trashDocs = trashItems.stream().map(t -> {
            String content = "Trash Reading: Weight " + t.getWight() + " kg," +
                    " Recorded at: " + t.getCreatedAt();
            return new Document(content);
        }).toList();
        allDocuments.addAll(trashDocs);



        if (allDocuments.isEmpty()) {
            // ⚠️ Warning in English
            log.warn("⚠️ No data found to read! Ensure MongoDB contains documents.");
            return;
        }

        vectorStore.add(allDocuments);

        File file = new File("src/main/resources/vector_store.json");
        vectorStore.save(file);
        log.info(" SUCCESS: Loaded and saved " + allDocuments.size() + " documents.");
    }

    public List<Document> searchSimilarData(String userQuery) {
        return vectorStore.similaritySearch(userQuery);
    }
}