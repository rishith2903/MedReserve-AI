package com.medreserve.repository;

import com.medreserve.entity.Prescription;
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
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    List<Prescription> findByPatientId(Long patientId);
    
    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);
    
    List<Prescription> findByDoctorId(Long doctorId);
    
    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);
    
    List<Prescription> findByAppointmentId(Long appointmentId);
    
    Optional<Prescription> findByIdAndPatientId(Long prescriptionId, Long patientId);
    
    Optional<Prescription> findByIdAndDoctorId(Long prescriptionId, Long doctorId);
    
    List<Prescription> findByPatientIdAndStatus(Long patientId, Prescription.PrescriptionStatus status);
    
    List<Prescription> findByDoctorIdAndStatus(Long doctorId, Prescription.PrescriptionStatus status);
    
    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND " +
           "p.prescriptionDate BETWEEN :startDate AND :endDate ORDER BY p.prescriptionDate DESC")
    List<Prescription> findByPatientAndDateRange(@Param("patientId") Long patientId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Prescription p WHERE p.doctor.id = :doctorId AND " +
           "p.prescriptionDate BETWEEN :startDate AND :endDate ORDER BY p.prescriptionDate DESC")
    List<Prescription> findByDoctorAndDateRange(@Param("doctorId") Long doctorId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND " +
           "(LOWER(p.medications) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.diagnosis) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.notes) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Prescription> searchByPatientAndKeyword(@Param("patientId") Long patientId,
                                               @Param("keyword") String keyword);
    
    @Query("SELECT p FROM Prescription p WHERE p.validUntil < :currentDate AND p.status = 'ACTIVE'")
    List<Prescription> findExpiredPrescriptions(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.patient.id = :patientId")
    long countByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId")
    long countByDoctorId(@Param("doctorId") Long doctorId);
    
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId AND " +
           "p.prescriptionDate BETWEEN :startDate AND :endDate")
    long countByDoctorAndDateRange(@Param("doctorId") Long doctorId,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);
}
