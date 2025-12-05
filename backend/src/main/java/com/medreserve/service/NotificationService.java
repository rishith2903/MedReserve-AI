package com.medreserve.service;

import com.medreserve.entity.Appointment;
import com.medreserve.entity.User;
import com.medreserve.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final JavaMailSender mailSender;
    private final AppointmentRepository appointmentRepository;
    
    @Value("${spring.mail.username:noreply@medreserve.com}")
    private String fromEmail;
    
    @Async
    @Transactional
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            // Refresh the appointment with eager fetching to ensure session is active
            Appointment freshAppointment = appointmentRepository.findByIdWithPatientAndDoctor(appointment.getId())
                    .orElse(appointment);

            String subject = "Appointment Confirmation - MedReserve";
            String body = buildAppointmentConfirmationEmail(freshAppointment);

            sendEmail(freshAppointment.getPatient().getEmail(), subject, body);
            sendEmail(freshAppointment.getDoctor().getEmail(), subject, body);

            log.info("Appointment confirmation sent for appointment ID: {}", appointment.getId());

        } catch (Exception e) {
            log.error("Failed to send appointment confirmation: {}", e.getMessage());
        }
    }
    
    @Async
    @Transactional
    public void sendAppointmentReminder(Appointment appointment) {
        try {
            // Refresh the appointment with eager fetching to ensure session is active
            Appointment freshAppointment = appointmentRepository.findByIdWithPatientAndDoctor(appointment.getId())
                    .orElse(appointment);

            String subject = "Appointment Reminder - MedReserve";
            String body = buildAppointmentReminderEmail(freshAppointment);

            sendEmail(freshAppointment.getPatient().getEmail(), subject, body);

            log.info("Appointment reminder sent for appointment ID: {}", appointment.getId());

        } catch (Exception e) {
            log.error("Failed to send appointment reminder: {}", e.getMessage());
        }
    }
    
    @Async
    public void sendAppointmentCancellation(Appointment appointment, String reason) {
        try {
            String subject = "Appointment Cancelled - MedReserve";
            String body = buildAppointmentCancellationEmail(appointment, reason);
            
            sendEmail(appointment.getPatient().getEmail(), subject, body);
            sendEmail(appointment.getDoctor().getEmail(), subject, body);
            
            log.info("Appointment cancellation notification sent for appointment ID: {}", appointment.getId());
            
        } catch (Exception e) {
            log.error("Failed to send appointment cancellation: {}", e.getMessage());
        }
    }
    
    @Async
    public void sendRiskAlert(User patient, String riskType, String description) {
        try {
            String subject = "Health Risk Alert - MedReserve";
            String body = buildRiskAlertEmail(patient, riskType, description);
            
            sendEmail(patient.getEmail(), subject, body);
            
            log.info("Risk alert sent to patient: {}", patient.getEmail());
            
        } catch (Exception e) {
            log.error("Failed to send risk alert: {}", e.getMessage());
        }
    }
    
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void sendScheduledReminders() {
        try {
            // Send reminders for appointments in the next 24 hours
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime tomorrow = now.plusDays(1);
            
            List<Appointment> upcomingAppointments = appointmentRepository
                    .findAppointmentsForReminder(now, tomorrow);
            
            for (Appointment appointment : upcomingAppointments) {
                // Check if appointment is within 24 hours and hasn't been reminded yet
                LocalDateTime appointmentTime = appointment.getAppointmentDateTime();
                long hoursUntilAppointment = java.time.Duration.between(now, appointmentTime).toHours();
                
                if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 0) {
                    sendAppointmentReminder(appointment);
                }
            }
            
            log.info("Processed {} appointment reminders", upcomingAppointments.size());
            
        } catch (Exception e) {
            log.error("Error sending scheduled reminders: {}", e.getMessage());
        }
    }
    
    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
    
    private String buildAppointmentConfirmationEmail(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        
        return String.format("""
                Dear %s,
                
                Your appointment has been confirmed!
                
                Appointment Details:
                - Doctor: Dr. %s (%s)
                - Date & Time: %s
                - Type: %s
                - Duration: %d minutes
                - Consultation Fee: $%.2f
                
                %s
                
                If you need to reschedule or cancel, please do so at least 24 hours in advance.
                
                Best regards,
                MedReserve Team
                """,
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getDoctor().getSpecialty(),
                appointment.getAppointmentDateTime().format(formatter),
                appointment.getAppointmentType().getDescription(),
                appointment.getDurationMinutes(),
                appointment.getConsultationFee(),
                appointment.getChiefComplaint() != null ? 
                        "Reason for visit: " + appointment.getChiefComplaint() : ""
        );
    }
    
    private String buildAppointmentReminderEmail(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        
        return String.format("""
                Dear %s,
                
                This is a reminder that you have an upcoming appointment:
                
                - Doctor: Dr. %s (%s)
                - Date & Time: %s
                - Type: %s
                
                Please arrive 15 minutes early for your appointment.
                
                If you need to reschedule or cancel, please contact us as soon as possible.
                
                Best regards,
                MedReserve Team
                """,
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getDoctor().getSpecialty(),
                appointment.getAppointmentDateTime().format(formatter),
                appointment.getAppointmentType().getDescription()
        );
    }
    
    private String buildAppointmentCancellationEmail(Appointment appointment, String reason) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");
        
        return String.format("""
                Dear %s,
                
                Your appointment has been cancelled.
                
                Cancelled Appointment Details:
                - Doctor: Dr. %s (%s)
                - Date & Time: %s
                - Reason: %s
                
                If you would like to reschedule, please book a new appointment through our platform.
                
                Best regards,
                MedReserve Team
                """,
                appointment.getPatient().getFullName(),
                appointment.getDoctor().getFullName(),
                appointment.getDoctor().getSpecialty(),
                appointment.getAppointmentDateTime().format(formatter),
                reason != null ? reason : "Not specified"
        );
    }
    
    private String buildRiskAlertEmail(User patient, String riskType, String description) {
        return String.format("""
                Dear %s,
                
                We have identified a potential health risk that requires your attention:
                
                Risk Type: %s
                Description: %s
                
                We recommend that you:
                1. Schedule an appointment with your healthcare provider
                2. Discuss this alert with your doctor
                3. Follow any existing treatment plans
                
                This is an automated alert based on your health data analysis. 
                Please consult with a healthcare professional for proper medical advice.
                
                Best regards,
                MedReserve AI Health Monitoring Team
                """,
                patient.getFullName(),
                riskType,
                description
        );
    }
}
