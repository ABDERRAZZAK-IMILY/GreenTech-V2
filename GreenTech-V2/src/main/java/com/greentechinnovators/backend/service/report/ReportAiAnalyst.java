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
                    "RÔLE : Tu es un Auditeur Environnemental Principal certifié IRCA (ISO 14001:2015). " +
                            "Ta mission est d'auditer la performance mensuelle d'une entreprise industrielle.\n\n" +

                            "DONNÉES D'ENTRÉE (MOIS EN COURS) :\n" +
                            "- Transport : %.2f km parcourus | Empreinte : %.2f kg CO2\n" +
                            "- Déchets   : %.2f kg générés   | Empreinte : %.2f kg CO2\n" +
                            "- Énergie   : %.2f kWh consommé | Empreinte : %.2f kg CO2\n\n" +

                            "CONSIGNES STRICTES DE RÉDACTION :\n" +
                            "1. Ton : Formel, factuel, autoritaire et constructif.\n" +
                            "2. Format : Texte brut uniquement. PAS de gras (**), PAS d'italique (*), PAS de titres Markdown (##).\n" +
                            "3. Structure : Tu dois suivre EXACTEMENT la structure ci-dessous pour que le parser PDF fonctionne.\n\n" +

                            "STRUCTURE DE LA RÉPONSE ATTENDUE :\n" +
                            "1. SYNTHÈSE DE CONFORMITÉ\n" +
                            "   - [Indique ici le statut global : 'Conforme', 'Non-conforme mineure' ou 'Non-conforme majeure' avec une phrase de justification technique.]\n\n" +

                            "2. ANALYSE DES ÉCARTS (ISO 14001 §9.1)\n" +
                            "   - [Analyse Transport : Compare ratio km/CO2. Utilise des termes comme 'Efficacité de la flotte' ou 'Dérive carburant'.]\n" +
                            "   - [Analyse Déchets : Mentionne le taux de valorisation ou l'impact pollution.]\n" +
                            "   - [Analyse Énergie : Identifie si la consommation est anormale (Point critique).]\n\n" +

                            "3. RISQUES ET OPPORTUNITÉS\n" +
                            "   - Risque Identifié : [Ex: Dépassement des seuils réglementaires, Coût carbone élevé...]\n" +
                            "   - Opportunité : [Ex: Installation LED, Optimisation des tournées, Recyclage...]\n\n" +

                            "4. PLAN D'ACTION CORRECTIF (PDCA)\n" +
                            "   - PLANIFIER : [Une action concrète pour analyser la cause racine.]\n" +
                            "   - RÉALISER : [Une action immédiate pour corriger le tir le mois prochain.]\n" +
                            "   - VÉRIFIER : [Quel indicateur surveiller pour confirmer l'efficacité ?]\n",

                    // Les variables Java
                    data.getTransportKm(), data.getTransportCo2(),
                    data.getTrashWeight(), data.getTrashCo2(),
                    data.getEnergyKwh(), data.getEnergyCo2()
            );

            return chatService.askAIStream(prompt, null)
                    .reduce("", String::concat)
                    .block();
        } catch (Exception e) {
            log.error("AI Analysis failed", e);
            return "Analyse indisponible - Veuillez consulter l'administrateur.";
        }
    }
}