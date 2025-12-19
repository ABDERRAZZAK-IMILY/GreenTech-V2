package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.service.ai.AiPromptStore;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    private final AiPromptStore aiPromptStore;

    private static final String LOGIN_URL = "https://greentechinnovators.me/login";

    @Async
    public void sendAccountCreatedEmail(String toEmail, String name, String rawPassword) {
        log.info(" Attempting to send welcome email to: {}", toEmail);
        log.info(" Using from email: {}", fromEmail);

        String htmlContent = aiPromptStore.getAccountCreatedTemplate(name, toEmail, rawPassword, LOGIN_URL);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🚀 Bienvenue ! Vos accès GreenTech");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Email de bienvenue envoyé à {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ MessagingException - Erreur email pour {}: {}", toEmail, e.getMessage(), e);
        } catch (MailException e) {
            log.error("❌ MailException - Erreur SMTP pour {}: {}", toEmail, e.getMessage(), e);
        } catch (Exception e) {
            log.error("❌ Exception inattendue lors de l'envoi email à {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
