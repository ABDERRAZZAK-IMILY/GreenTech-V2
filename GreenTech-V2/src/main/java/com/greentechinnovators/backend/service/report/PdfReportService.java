package com.greentechinnovators.backend.service.report;

import com.greentechinnovators.backend.dto.ReportData;
import com.lowagie.text.*;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPageEventHelper;
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
        String folderName = "iso-reports";
        String rootPath = System.getProperty("user.dir");
        File directory = new File(rootPath, folderName);
        if (!directory.exists()) directory.mkdirs();

        String fileName = "Audit_ISO14001_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmm")) + ".pdf";
        File file = new File(directory, fileName);

        try (FileOutputStream fos = new FileOutputStream(file)) {
            generatePdfLogic(fos);
        }
        log.info("✅ Audit PDF ISO Généré : " + file.getAbsolutePath());
        return file.getAbsolutePath();
    }

    private void generatePdfLogic(OutputStream outputStream) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime start = now.withDayOfMonth(1);
            ReportData data = dataFetcher.getMonthlyData(start, now);

            // L'AI fait l'audit complet
            String aiAuditResult = aiAnalyst.generateAnalysis(data);

            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);

            // Footer event (Numéro de page)
            writer.setPageEvent(new PdfPageEventHelper() {
                public void onEndPage(PdfWriter writer, Document document) {
                    PdfContentByte cb = writer.getDirectContent();
                    ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                            new Phrase("Page " + writer.getPageNumber() + " - GreenTech ISO System", PdfStyler.DATA_FONT),
                            (document.right() - document.left()) / 2 + document.leftMargin(),
                            document.bottom() - 10, 0);
                }
            });

            document.open();
            addIsoHeader(document);

            // 1. Synthèse des Données (Check)
            styler.addSectionTitle(document, "1. SURVEILLANCE & MESURES (CHECK)");

            // Tableau Transport
            styler.addAuditTable(document, "Flotte & Transport",
                    fmt(data.getTransportKm()) + " km",
                    fmt(data.getTransportCo2()) + " kg",
                    checkLimit(data.getTransportCo2(), 500)); // Exemple de seuil (Target)

            // Tableau Déchets
            styler.addAuditTable(document, "Gestion des Déchets",
                    fmt(data.getTrashWeight()) + " kg",
                    fmt(data.getTrashCo2()) + " kg",
                    checkLimit(data.getTrashCo2(), 200));

            // Tableau Energie
            styler.addAuditTable(document, "Efficacité Énergétique",
                    fmt(data.getEnergyKwh()) + " kWh",
                    fmt(data.getEnergyCo2()) + " kg",
                    checkLimit(data.getEnergyCo2(), 1000));

            // 2. Rapport d'Audit Détaillé (L'AI)
            styler.addSectionTitle(document, "2. RAPPORT D'AUDIT & PLAN D'ACTION (ACT)");
            document.add(new Paragraph("Analyse générée par le système Eco-Intelligence selon ISO 14001:2015", PdfStyler.DATA_FONT));
            styler.addAiBox(document, aiAuditResult);

            // 3. Signature
            addSignatureSection(document);

            document.close();

        } catch (DocumentException e) {
            log.error("Erreur PDF", e);
            throw new RuntimeException(e);
        }
    }

    private void addIsoHeader(Document doc) throws DocumentException {
        Paragraph title = new Paragraph("RAPPORT D'AUDIT INTERNE ISO 14001", PdfStyler.TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);

        Paragraph sub = new Paragraph("Système de Management Environnemental (SME)", PdfStyler.SUBTITLE_FONT);
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(20);
        doc.add(sub);

        Paragraph info = new Paragraph("Date d'audit: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                "\nAuditeur: Système Automatisé GreenTech", PdfStyler.DATA_FONT);
        info.setAlignment(Element.ALIGN_RIGHT);
        info.setSpacingAfter(10);
        doc.add(info);
    }

    private void addSignatureSection(Document doc) throws DocumentException {
        Paragraph p = new Paragraph("\n\n\napprobation Direction : ____________________        Responsable HSE : ____________________", PdfStyler.DATA_FONT);
        p.setAlignment(Element.ALIGN_CENTER);
        doc.add(p);
    }

    // Fonction simple pour simuler une vérification d'objectif (Target)
    private String checkLimit(double value, double limit) {
        return value <= limit ? "Conforme" : "À Surveiller";
    }

    private String fmt(double val) {
        return String.format("%.2f", val);
    }
}