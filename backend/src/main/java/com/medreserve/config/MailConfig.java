package com.medreserve.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Mail configuration that provides a no-op mail sender when email is not
 * configured.
 * This allows the application to start without email credentials.
 */
@Configuration
@Slf4j
public class MailConfig {

    /**
     * Provides a no-op JavaMailSender when spring.mail.username is empty or not
     * set.
     * This prevents startup failures when email is not configured.
     */
    @Bean
    @ConditionalOnProperty(name = "spring.mail.username", havingValue = "", matchIfMissing = true)
    public JavaMailSender noOpMailSender() {
        log.warn("Email is not configured. Using no-op mail sender. Email notifications will be disabled.");
        return new JavaMailSenderImpl() {
            @Override
            public void send(org.springframework.mail.SimpleMailMessage simpleMessage) {
                log.info("Email sending is disabled. Would have sent email to: {}",
                        simpleMessage.getTo() != null ? String.join(", ", simpleMessage.getTo()) : "unknown");
            }
        };
    }
}
