package com.greentechinnovators.backend.controller;

import com.greentechinnovators.backend.dto.ReportFileDto;
import com.greentechinnovators.backend.service.report.CsvReportService;
import com.greentechinnovators.backend.service.report.ExcelReportService;
import com.greentechinnovators.backend.service.report.PdfReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final PdfReportService pdfReportService;
    private final CsvReportService csvReportService;
    private final ExcelReportService excelReportService;
    private static final String REPORT_FOLDER = "iso-reports";


    @GetMapping("/monthly")
    public ResponseEntity<?> downloadMonthlyReport(HttpServletResponse response) {
        try {
            String path = pdfReportService.generateMonthlyReport();
            return ResponseEntity.ok("Rapport PDF généré : " + path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur : " + e.getMessage());
        }
    }

    @GetMapping("/generate-csv")
    public ResponseEntity<String> generateCsvReport() {
        try {
            String path = csvReportService.generateMonthlyCsv();
            return ResponseEntity.ok("Rapport CSV généré : " + path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur CSV : " + e.getMessage());
        }
    }

    @GetMapping("/generate-excel")
    public ResponseEntity<String> generateExcelReport() {
        try {
            String path = excelReportService.generateMonthlyExcel();
            return ResponseEntity.ok("Rapport Excel généré : " + path);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur : " + e.getMessage());
        }
    }


    @GetMapping("/list")
    public ResponseEntity<List<ReportFileDto>> listReports() {
        List<ReportFileDto> reports = new ArrayList<>();
        File folder = new File(System.getProperty("user.dir"), REPORT_FOLDER);

        if (folder.exists() && folder.isDirectory()) {
            File[] files = folder.listFiles((dir, name) ->
                    name.endsWith(".pdf") || name.endsWith(".csv") || name.endsWith(".xlsx"));

            if (files != null) {
                for (File file : files) {
                    reports.add(new ReportFileDto(
                            file.getName(),
                            file.lastModified(),
                            (file.length() / 1024) + " KB"
                    ));
                }
            }
        }
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadReport(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(System.getProperty("user.dir"), REPORT_FOLDER).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "application/octet-stream";
                if(filename.endsWith(".pdf")) contentType = "application/pdf";
                else if(filename.endsWith(".xlsx")) contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}