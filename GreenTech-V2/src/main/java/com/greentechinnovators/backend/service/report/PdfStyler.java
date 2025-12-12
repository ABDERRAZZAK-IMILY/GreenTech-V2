package com.greentechinnovators.backend.service.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import org.springframework.stereotype.Component;

import java.awt.Color;

@Component
public class PdfStyler {

    public static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
    public static final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(46, 125, 50)); // Vert
    public static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
    public static final Font DATA_FONT = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
    public static final Font AI_FONT = FontFactory.getFont(FontFactory.COURIER, 10, Color.DARK_GRAY);

    public void addSectionTitle(Document doc, String title) throws DocumentException {
        Paragraph section = new Paragraph(title, SECTION_FONT);
        section.setSpacingBefore(15);
        section.setSpacingAfter(5);
        doc.add(section);
    }

    public void addTable(Document doc, String[] headers, String... values) throws DocumentException {
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5);
        table.setSpacingAfter(10);

        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(new Color(67, 160, 71));
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, DATA_FONT));
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
        doc.add(table);
    }

    public void addAiBox(Document doc, String text) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(245, 245, 245)); // Gris fate7
        cell.setPadding(15);
        cell.setBorderColor(Color.LIGHT_GRAY);

        String cleanText = text.replace("**", "").replace("###", "");
        Paragraph p = new Paragraph("🤖 Rapport de l'Assistant IA:\n\n" + cleanText, AI_FONT);
        p.setLeading(14);

        cell.addElement(p);
        table.addCell(cell);
        doc.add(table);
    }
}