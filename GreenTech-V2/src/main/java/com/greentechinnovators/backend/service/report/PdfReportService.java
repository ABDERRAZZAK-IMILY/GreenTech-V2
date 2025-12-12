package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.dto.ReportData;
import com.greentechinnovators.backend.service.report.PdfStyler;
import com.greentechinnovators.backend.service.report.ReportAiAnalyst;
import com.greentechinnovators.backend.service.report.ReportDataFetcher;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportService {

    private final ReportDataFetcher dataFetcher;
    private final ReportAiAnalyst aiAnalyst;
    private final PdfStyler styler;


    public String generateMonthlyReport() throws IOException {
        String folderName = "generated-reports";
        String rootPath = System.getProperty("user.dir");
        File directory = new File(rootPath, folderName);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if(created) log.info("Dossier créé : " + directory.getAbsolutePath());
        }

        String fileName = "Rapport_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm")) + ".pdf";

        File file = new File(directory, fileName);

        try (FileOutputStream fos = new FileOutputStream(file)) {
            generatePdfLogic(fos);
        }

        log.info("PDF Enregistré avec succès ici : " + file.getAbsolutePath());
        return file.getAbsolutePath();
    }

    private void generatePdfLogic(OutputStream outputStream) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime start = now.withDayOfMonth(1);

            ReportData data = dataFetcher.getMonthlyData(start, now);
            String aiAnalysis = aiAnalyst.generateAnalysis(data);

            // B. PDF Setup
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // C. Writing Content
            addHeader(document);

            // Transport
            styler.addSectionTitle(document, "1. Transport & Logistique");
            styler.addTable(document, new String[]{"Période", "Distance (km)", "CO2 (kg)"},
                    "Mois en cours", fmt(data.getTransportKm()) + " km", fmt(data.getTransportCo2()) + " kg");

            // Déchets
            styler.addSectionTitle(document, "2. Gestion des Déchets");
            styler.addTable(document, new String[]{"Période", "Poids (kg)", "CO2 (kg)"},
                    "Mois en cours", fmt(data.getTrashWeight()) + " kg", fmt(data.getTrashCo2()) + " kg");

            // Energie
            styler.addSectionTitle(document, "3. Consommation Énergétique");
            styler.addTable(document, new String[]{"Période", "Consommation (kWh)", "Empreinte CO2 (kg)"},
                    "Mois en cours", fmt(data.getEnergyKwh()) + " kWh", fmt(data.getEnergyCo2()) + " kg");

            // AI Section
            styler.addSectionTitle(document, "4. Analyse Intelligente");
            styler.addAiBox(document, aiAnalysis);

            addFooter(document);
            document.close();

        } catch (DocumentException e) {
            log.error("Erreur f l'creation dyal PDF", e);
            throw new RuntimeException("Erreur PDF", e);
        }
    }


    private void addHeader(Document doc) throws DocumentException {
        Paragraph title = new Paragraph("Rapport Mensuel - GreenTech", PdfStyler.TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        doc.add(title);

        Paragraph date = new Paragraph("Généré le: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), PdfStyler.DATA_FONT);
        date.setAlignment(Element.ALIGN_RIGHT);
        date.setSpacingAfter(20);
        doc.add(date);
    }

    private void addFooter(Document doc) throws DocumentException {
        Paragraph footer = new Paragraph("\n\nGénéré automatiquement par GreenTech System.",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, java.awt.Color.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }

    private String fmt(double val) {
        return String.format("%.2f", val);
    }
}