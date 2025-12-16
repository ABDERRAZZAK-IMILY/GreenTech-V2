package com.greentechinnovators.backend.service;

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


    private static final String LOGIN_URL = "http://localhost:3000";

    public void sendAccountCreatedEmail(String toEmail, String name, String rawPassword) {
        String htmlContent = """
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 40px; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
                
                <div style="background-color: #2E7D32; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Bienvenue chez GreenTech! 🌱</h1>
                </div>

                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #555;">Bonjour <strong>%s</strong>,</p>
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Votre compte administrateur a été créé avec succès. Vous pouvez désormais accéder au tableau de bord backend.
                    </p>
                    
                    <div style="background-color: #f0f7f1; border-left: 5px solid #2E7D32; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Votre Identifiant :</p>
                        <p style="margin: 0 0 20px 0; font-weight: bold; color: #333;">%s</p>
                        
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Votre Mot de passe provisoire :</p>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2E7D32; letter-spacing: 2px;">%s</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #2E7D32; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 16px;">
                            Se connecter à la plateforme
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #888; margin-top: 20px;">
                        Pour des raisons de sécurité, nous vous recommandons de changer ce mot de passe dès votre première connexion.
                    </p>
                </div>

                <div style="background-color: #eeeeee; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    &copy; 2025 GreenTech Innovators. Tous droits réservés.
                </div>
            </div>
        </div>
        """.formatted(name, toEmail, rawPassword, LOGIN_URL); // <-- Zedt LOGIN_URL hna

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