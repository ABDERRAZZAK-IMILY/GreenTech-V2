package com.greentechinnovators.backend.service;

import com.greentechinnovators.backend.service.ai.AiPromptStore;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    private final AiPromptStore aiPromptStore ;

    private static final String LOGIN_URL = "http://localhost:3000";

    public void sendAccountCreatedEmail(String toEmail, String name, String rawPassword) {

        String htmlContent = aiPromptStore.getAccountCreatedTemplate(name, toEmail, rawPassword, LOGIN_URL);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🚀 Bienvenue ! Vos accès GreenTech");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email de bienvenue envoyé à " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Erreur email: " + e.getMessage());
        }
    }
}