package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.service.ai.AiPromptStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final AiPromptStore aiPromptStore;
    private final WebClient.Builder webClientBuilder;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";
    private static final String LOGIN_URL = "https://greentechinnovators.me/login";

    @Async
    public void sendAccountCreatedEmail(String toEmail, String name, String rawPassword) {
        log.info("Attempting to send welcome email to: {}", toEmail);

        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("Resend API key not configured. Email will not be sent.");
            return;
        }

        String htmlContent = aiPromptStore.getAccountCreatedTemplate(name, toEmail, rawPassword, LOGIN_URL);

        try {
            WebClient webClient = webClientBuilder.build();

            Map<String, Object> emailRequest = Map.of(
                    "from", fromEmail,
                    "to", List.of(toEmail),
                    "subject", "Bienvenue ! Vos acces GreenTech",
                    "html", htmlContent);

            String response = webClient.post()
                    .uri(RESEND_API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(emailRequest)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Email sent successfully to {}. Response: {}", toEmail, response);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
