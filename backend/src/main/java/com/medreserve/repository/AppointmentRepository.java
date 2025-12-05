package com.medreserve.repository;

import com.medreserve.entity.Appointment;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByPatientId(Long patientId);
    
    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);
    
    List<Appointment> findByDoctorId(Long doctorId);
    
    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);
    
    List<Appointment> findByPatientAndStatus(User patient, Appointment.AppointmentStatus status);
    
    List<Appointment> findByDoctorAndStatus(Doctor doctor, Appointment.AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.appointmentDateTime BETWEEN :startTime AND :endTime AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.appointmentDateTime BETWEEN :startTime AND :endTime AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS') AND " +
           "a.id != :excludeAppointmentId")
    List<Appointment> findConflictingAppointmentsExcluding(@Param("doctorId") Long doctorId,
                                                          @Param("startTime") LocalDateTime startTime,
                                                          @Param("endTime") LocalDateTime endTime,
                                                          @Param("excludeAppointmentId") Long excludeAppointmentId);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.appointmentDateTime >= :start AND a.appointmentDateTime < :end AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS') " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findDoctorAppointmentsByDateRange(@Param("doctorId") Long doctorId,
                                                       @Param("start") LocalDateTime start,
                                                       @Param("end") LocalDateTime end);
    
    // Convenience method for tests and service usage by single date
    default List<Appointment> findDoctorAppointmentsByDate(Long doctorId, java.time.LocalDate date) {
        java.time.LocalDateTime start = date.atStartOfDay();
        java.time.LocalDateTime end = date.plusDays(1).atStartOfDay();
        return findDoctorAppointmentsByDateRange(doctorId, start, end);
    }
    
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND " +
           "a.appointmentDateTime >= :start AND a.appointmentDateTime < :end AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS') " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findPatientAppointmentsByDateRange(@Param("patientId") Long patientId,
                                                        @Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDateTime BETWEEN :startDate AND :endDate AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED')")
    List<Appointment> findUpcomingAppointments(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS') " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findActiveAppointmentsByPatient(@Param("patientId") Long patientId);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS') " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findActiveAppointmentsByDoctor(@Param("doctorId") Long doctorId);
    
    @Query("SELECT a FROM Appointment a WHERE " +
           "a.appointmentDateTime < :currentTime AND " +
           "a.status = 'SCHEDULED'")
    List<Appointment> findOverdueAppointments(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.status = 'COMPLETED'")
    long countCompletedAppointmentsByDoctor(@Param("doctorId") Long doctorId);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patient.id = :patientId")
    long countAppointmentsByPatient(@Param("patientId") Long patientId);
    
    @Query("SELECT a FROM Appointment a " +
           "JOIN FETCH a.patient " +
           "JOIN FETCH a.doctor " +
           "WHERE a.appointmentDateTime BETWEEN :startTime AND :endTime AND " +
           "a.status IN ('SCHEDULED', 'CONFIRMED') " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findAppointmentsForReminder(@Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.followUpRequired = true AND " +
           "a.followUpDate <= :currentDate AND " +
           "a.status = 'COMPLETED'")
    List<Appointment> findDueFollowUps(@Param("currentDate") LocalDateTime currentDate);
    
    Optional<Appointment> findByIdAndPatientId(Long appointmentId, Long patientId);

    Optional<Appointment> findByIdAndDoctorId(Long appointmentId, Long doctorId);

    @Query("SELECT a FROM Appointment a " +
           "JOIN FETCH a.patient " +
           "JOIN FETCH a.doctor " +
           "WHERE a.id = :id")
    Optional<Appointment> findByIdWithPatientAndDoctor(@Param("id") Long id);
}
