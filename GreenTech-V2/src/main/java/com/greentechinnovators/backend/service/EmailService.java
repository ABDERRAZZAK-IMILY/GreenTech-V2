package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.service.ai.AiPromptStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
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
        log.info("Using from email: {}", fromEmail);
        log.info("API key present: {}", resendApiKey != null && !resendApiKey.isBlank());

        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("Resend API key not configured. Email will not be sent.");
            return;
        }

        String htmlContent = aiPromptStore.getAccountCreatedTemplate(name, toEmail, rawPassword, LOGIN_URL);

        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(RESEND_API_URL)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            Map<String, Object> emailRequest = Map.of(
                    "from", fromEmail,
                    "to", List.of(toEmail),
                    "subject", "Bienvenue ! Vos acces GreenTech",
                    "html", htmlContent);

            log.info("Sending email request to Resend API...");

            String response = webClient.post()
                    .bodyValue(emailRequest)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.bodyToMono(String.class)
                            .flatMap(errorBody -> {
                                log.error("Resend API error response: {}", errorBody);
                                return Mono.error(new RuntimeException("Resend API error: " + errorBody));
                            }))
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .doOnError(e -> log.error("WebClient error: {}", e.getMessage()))
                    .block();

            log.info("Email sent successfully to {}. Response: {}", toEmail, response);

        } catch (WebClientResponseException e) {
            log.error("Resend API response error for {}: Status={}, Body={}",
                    toEmail, e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
