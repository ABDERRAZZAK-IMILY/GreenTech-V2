package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.service.report.CsvReportService;
import com.greentechinnovators.backend.service.report.ExcelReportService;
import com.greentechinnovators.backend.service.report.PdfReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final PdfReportService pdfReportService;
    private final CsvReportService csvReportService;

    @GetMapping("/monthly")
    public ResponseEntity<?> downloadMonthlyReport(HttpServletResponse response) throws IOException {
        try {
            String path = pdfReportService.generateMonthlyReport();
            return ResponseEntity.ok(" Rapport généré avec succès ici : " + path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(" Erreur : " + e.getMessage());
        }
    }

    @GetMapping("/generate-csv")
    public ResponseEntity<String> generateCsvReport() {
        try {
            String path = csvReportService.generateMonthlyCsv();
            return ResponseEntity.ok(" Rapport CSV généré avec succès : " + path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(" Erreur CSV : " + e.getMessage());
        }
    }

    private final ExcelReportService excelReportService;

    @GetMapping("/generate-excel")
    public ResponseEntity<String> generateExcelReport() {
        try {
            String path = excelReportService.generateMonthlyExcel();
            return ResponseEntity.ok(" Rapport Excel (XLSX) Pro généré : " + path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(" Erreur : " + e.getMessage());
        }
    }
}