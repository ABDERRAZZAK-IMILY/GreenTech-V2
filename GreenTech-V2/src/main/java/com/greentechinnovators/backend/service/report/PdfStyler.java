package com.greentechinnovators.backend.service.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import org.springframework.stereotype.Component;

import java.awt.Color;

@Component
public class PdfStyler {

    public static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(27, 94, 32));
    public static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(46, 125, 50));
    public static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
    public static final Font DATA_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
    public static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY);

    // AI Fonts
    public static final Font AI_HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(33, 33, 33));
    public static final Font AI_BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
    public static final Font AI_BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

    public void addSectionTitle(Document doc, String title) throws DocumentException {
        Paragraph section = new Paragraph("\n" + title, SECTION_FONT);
        section.setSpacingAfter(8);
        doc.add(section);
        doc.add(new Paragraph("_____________________________________________________________________________",
                FontFactory.getFont(FontFactory.HELVETICA, 8, Color.LIGHT_GRAY)));
    }

    public void addAuditTable(Document doc, String category, String realValue, String co2Value, String status) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 2f, 2f, 2f});
        table.setSpacingBefore(10);

        String[] headers = {"Indicateur Clé (KPI)", "Valeur Réelle", "Impact CO2", "Statut"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, HEADER_FONT));
            cell.setBackgroundColor(new Color(67, 160, 71));
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        addCell(table, category);
        addCell(table, realValue);
        addCell(table, co2Value);

        PdfPCell statusCell = new PdfPCell(new Phrase(status, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE)));
        statusCell.setBackgroundColor(status.equalsIgnoreCase("Conforme") ? new Color(46, 125, 50) : new Color(230, 81, 0));
        statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        statusCell.setPadding(6);
        table.addCell(statusCell);

        doc.add(table);
    }

    private void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, DATA_FONT));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    // 🔥 HADA HOWA FIX DYAL L-ESPACE
    public void addAiBox(Document doc, String rawAiText) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(10);

        // ✅ FIX IMPORTANT: Hado homa li kaymn3o l-boite tahrb l page jaya
        table.setSplitLate(false); // Matstannach hta lkher, 9assam dba
        table.setSplitRows(true);  // Kheli stoura yt9assmo

        // 1. Header Cell
        PdfPCell headerCell = new PdfPCell(new Phrase("  🤖 ANALYSE INTELLIGENTE & RECOMMANDATIONS (ISO 14001)",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE)));
        headerCell.setBackgroundColor(new Color(46, 125, 50));
        headerCell.setPadding(8);
        headerCell.setBorderColor(new Color(46, 125, 50));
        table.addCell(headerCell);

        // 2. Content Cell
        PdfPCell contentCell = new PdfPCell();
        contentCell.setBackgroundColor(new Color(241, 248, 233));
        contentCell.setPadding(12);
        contentCell.setBorderColor(new Color(46, 125, 50));

        // Parsing du texte
        String[] lines = rawAiText.split("\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            line = line.replace("**", "").replace("###", "").trim();

            Paragraph p;
            if (line.matches("^\\d+\\..*")) {
                p = new Paragraph("\n" + line, AI_HEADER_FONT);
                p.setSpacingAfter(4);
            }
            else if (line.startsWith("-")) {
                p = new Paragraph("     • " + line.substring(1).trim(), AI_BODY_FONT);
                p.setSpacingAfter(2);
            }
            else if (line.contains(":")) {
                String[] parts = line.split(":", 2);
                Chunk title = new Chunk(parts[0] + ":", AI_BOLD_FONT);
                Chunk content = new Chunk(parts[1], AI_BODY_FONT);
                p = new Paragraph();
                p.add(title);
                p.add(content);
                p.setSpacingAfter(2);
            }
            else {
                p = new Paragraph(line, AI_BODY_FONT);
                p.setSpacingAfter(2);
            }
            contentCell.addElement(p);
        }

        table.addCell(contentCell);
        doc.add(table);
    }
}