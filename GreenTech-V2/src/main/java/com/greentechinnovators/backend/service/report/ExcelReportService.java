package com.greentechinnovators.backend.service.report;

import com.greentechinnovators.backend.dto.ReportData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelReportService {

    private final ReportDataFetcher dataFetcher;
    private final ReportAiAnalyst aiAnalyst;
    private final ExcelStyler styler;
    public String generateMonthlyExcel() throws IOException {
        LocalDateTime now = LocalDateTime.now();
        ReportData data = dataFetcher.getMonthlyData(now.withDayOfMonth(1), now);
        String aiAnalysis = aiAnalyst.generateAnalysis(data);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Rapport Mensuel");

            CellStyle headerStyle = styler.createHeaderStyle(workbook);
            CellStyle dataStyle = styler.createDataStyle(workbook);
            CellStyle aiStyle = styler.createAiStyle(workbook);
            CellStyle titleStyle = styler.createTitleStyle(workbook);

            int rowNum = 0;

            Row titleRow = sheet.createRow(rowNum++);
            styler.createCell(titleRow, 0, "Rapport Mensuel - GreenTech", titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));
            rowNum++;

            rowNum = createSection(sheet, rowNum, "1. Transport & Logistique", headerStyle, dataStyle,
                    new String[]{"Mois en cours", fmt(data.getTransportKm()) + " km", fmt(data.getTransportCo2()) + " kg CO2"});

            rowNum = createSection(sheet, rowNum, "2. Gestion des Déchets", headerStyle, dataStyle,
                    new String[]{"Mois en cours", fmt(data.getTrashWeight()) + " kg", fmt(data.getTrashCo2()) + " kg CO2"});

            rowNum = createSection(sheet, rowNum, "3. Consommation Énergétique", headerStyle, dataStyle,
                    new String[]{"Mois en cours", fmt(data.getEnergyKwh()) + " kWh", fmt(data.getEnergyCo2()) + " kg CO2"});

            rowNum++;
            Row aiHeaderRow = sheet.createRow(rowNum++);
            styler.createCell(aiHeaderRow, 0, "🤖 Analyse Intelligente & Recommandations", headerStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

            Row aiTextRow = sheet.createRow(rowNum++);
            aiTextRow.setHeightInPoints(60);
            Cell aiCell = aiTextRow.createCell(0);
            aiCell.setCellValue(aiAnalysis);
            aiCell.setCellStyle(aiStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));

            for (int i = 0; i < 4; i++) {
                sheet.autoSizeColumn(i);
            }

            return saveToFile(workbook);
        }
    }


    private int createSection(Sheet sheet, int rowNum, String title, CellStyle headerStyle, CellStyle dataStyle, String[] values) {
        Row headerRow = sheet.createRow(rowNum++);
        styler.createCell(headerRow, 0, title, headerStyle);
        styler.createCell(headerRow, 1, "Valeur", headerStyle);
        styler.createCell(headerRow, 2, "Impact CO2", headerStyle);

        Row dataRow = sheet.createRow(rowNum++);
        styler.createCell(dataRow, 0, values[0], dataStyle);
        styler.createCell(dataRow, 1, values[1], dataStyle);
        styler.createCell(dataRow, 2, values[2], dataStyle);

        return rowNum + 1;
    }

    private String saveToFile(Workbook workbook) throws IOException {
        String folderName = "iso-reports";
        File directory = new File(System.getProperty("user.dir"), folderName);
        if (!directory.exists()) directory.mkdirs();

        String fileName = "Rapport_Excel_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm")) + ".xlsx";
        File file = new File(directory, fileName);

        try (FileOutputStream fos = new FileOutputStream(file)) {
            workbook.write(fos);
        }

        log.info("Excel Généré : " + file.getAbsolutePath());
        return file.getAbsolutePath();
    }

    private String fmt(double val) {
        return String.format("%.2f", val);
    }
}