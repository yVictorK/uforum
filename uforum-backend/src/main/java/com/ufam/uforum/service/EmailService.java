package com.ufam.uforum.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendTextEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Recuperação de Senha - UForum";
        String body = "Olá!\n\nVocê solicitou a recuperação de senha no UForum.\n" +
                "Para redefinir sua senha, clique no link abaixo:\n\n" +
                resetLink + "\n\n" +
                "Este link expira em 30 minutos.\n" +
                "Se você não solicitou isso, ignore este e-mail.";
        sendTextEmail(to, subject, body);
    }
}
