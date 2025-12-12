package com.greentechinnovators.backend.service.report;

import com.greentechinnovators.backend.dto.ReportData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvReportService {

    private final ReportDataFetcher dataFetcher;
    private final ReportAiAnalyst aiAnalyst;

    public String generateMonthlyCsv() throws IOException {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.withDayOfMonth(1);

        ReportData data = dataFetcher.getMonthlyData(start, now);
        String aiAnalysis = aiAnalyst.generateAnalysis(data);

        String folderName = "generated-reports";
        String rootPath = System.getProperty("user.dir");
        File directory = new File(rootPath, folderName);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = "Rapport_Data_" + now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm")) + ".csv";
        File file = new File(directory, fileName);

        try (PrintWriter pw = new PrintWriter(new FileWriter(file, java.nio.charset.StandardCharsets.UTF_8))) {
            pw.write('\ufeff');

            pw.println("Date;Transport_Km;Transport_CO2_kg;Dechets_Kg;Dechets_CO2_kg;Energie_kWh;Energie_CO2_kg;Analyse_IA");

            pw.printf("%s;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%s%n",
                    now.format(DateTimeFormatter.ISO_DATE),
                    data.getTransportKm(),
                    data.getTransportCo2(),
                    data.getTrashWeight(),
                    data.getTrashCo2(),
                    data.getEnergyKwh(),
                    data.getEnergyCo2(),
                    escapeCsv(aiAnalysis)
            );
        }

        log.info("CSV Généré : " + file.getAbsolutePath());
        return file.getAbsolutePath();
    }


    private String escapeCsv(String text) {
        if (text == null) return "";
        return "\"" + text.replace(";", ",").replace("\n", " ").replace("\r", " ") + "\"";
    }
}