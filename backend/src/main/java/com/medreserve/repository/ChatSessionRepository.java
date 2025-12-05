package com.medreserve.repository;

import com.medreserve.entity.ChatSession;
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
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    
    Optional<ChatSession> findByAppointmentId(Long appointmentId);
    
    List<ChatSession> findByPatientId(Long patientId);
    
    Page<ChatSession> findByPatientId(Long patientId, Pageable pageable);
    
    List<ChatSession> findByDoctorId(Long doctorId);
    
    Page<ChatSession> findByDoctorId(Long doctorId, Pageable pageable);
    
    List<ChatSession> findByStatus(ChatSession.ChatStatus status);
    
    List<ChatSession> findByPatientIdAndStatus(Long patientId, ChatSession.ChatStatus status);
    
    List<ChatSession> findByDoctorIdAndStatus(Long doctorId, ChatSession.ChatStatus status);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.patient.id = :patientId OR cs.doctor.user.id = :userId")
    List<ChatSession> findByParticipantUserId(@Param("userId") Long userId, @Param("patientId") Long patientId);
    
    @Query("SELECT cs FROM ChatSession cs WHERE (cs.patient.id = :userId OR cs.doctor.user.id = :userId) AND cs.status = :status")
    List<ChatSession> findByParticipantUserIdAndStatus(@Param("userId") Long userId, @Param("status") ChatSession.ChatStatus status);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.lastMessageAt BETWEEN :startDate AND :endDate ORDER BY cs.lastMessageAt DESC")
    List<ChatSession> findByLastMessageDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.status = 'ACTIVE' AND cs.lastMessageAt < :cutoffTime")
    List<ChatSession> findInactiveSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.patient.id = :patientId")
    long countByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.doctor.id = :doctorId")
    long countByDoctorId(@Param("doctorId") Long doctorId);
    
    @Query("SELECT COUNT(cs) FROM ChatSession cs WHERE cs.status = :status")
    long countByStatus(@Param("status") ChatSession.ChatStatus status);
    
    Optional<ChatSession> findByIdAndPatientId(Long sessionId, Long patientId);
    
    Optional<ChatSession> findByIdAndDoctorId(Long sessionId, Long doctorId);
    
    @Query("SELECT cs FROM ChatSession cs WHERE cs.id = :sessionId AND (cs.patient.id = :userId OR cs.doctor.user.id = :userId)")
    Optional<ChatSession> findByIdAndParticipantUserId(@Param("sessionId") Long sessionId, @Param("userId") Long userId);
}
