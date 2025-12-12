package com.greentechinnovators.backend.service.report;

import com.greentechinnovators.backend.dto.ReportData;
import com.greentechinnovators.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReportAiAnalyst {

    private final ChatService chatService;

    public String generateAnalysis(ReportData data) {
        try {
            String prompt = String.format(
                    "Agis en tant qu'expert RSE pour GreenTech. Analyse ces données mensuelles : " +
                            "- Transport: %.2f km (%.2f kg CO2) " +
                            "- Déchets: %.2f kg (%.2f kg CO2) " +
                            "- Energie: %.2f kWh (%.2f kg CO2). " +
                            "Donne un résumé de performance (3 lignes max) et 2 recommandations stratégiques concrètes. " +
                            "Réponds en texte brut (pas de markdown, pas de gras, pas d'italique).",
                    data.getTransportKm(), data.getTransportCo2(),
                    data.getTrashWeight(), data.getTrashCo2(),
                    data.getEnergyKwh(), data.getEnergyCo2()
            );

            return chatService.askAIStream(prompt, null)
                    .reduce("", String::concat)
                    .block();
        } catch (Exception e) {
            log.error("AI Analysis failed", e);
            return "Le module d'analyse IA est temporairement indisponible.";
        }
    }
}