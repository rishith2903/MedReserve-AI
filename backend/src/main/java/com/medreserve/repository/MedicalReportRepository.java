package com.medreserve.repository;

import com.medreserve.entity.MedicalReport;
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
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    
    List<MedicalReport> findByPatientId(Long patientId);
    
    Page<MedicalReport> findByPatientId(Long patientId, Pageable pageable);
    
    List<MedicalReport> findByPatientIdAndReportType(Long patientId, MedicalReport.ReportType reportType);
    
    Page<MedicalReport> findByPatientIdAndReportType(Long patientId, MedicalReport.ReportType reportType, Pageable pageable);
    
    List<MedicalReport> findByAppointmentId(Long appointmentId);
    
    @Query("SELECT mr FROM MedicalReport mr WHERE mr.patient.id = :patientId AND " +
           "mr.reportDate BETWEEN :startDate AND :endDate ORDER BY mr.reportDate DESC")
    List<MedicalReport> findByPatientAndDateRange(@Param("patientId") Long patientId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT mr FROM MedicalReport mr WHERE mr.patient.id = :patientId AND (" +
           "LOWER(mr.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(mr.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MedicalReport> searchByPatientAndKeyword(@Param("patientId") Long patientId,
                                                 @Param("keyword") String keyword);
    
    @Query("SELECT mr FROM MedicalReport mr WHERE mr.isSharedWithDoctor = true AND " +
           "mr.appointment.doctor.id = :doctorId ORDER BY mr.sharedAt DESC")
    List<MedicalReport> findSharedReportsByDoctor(@Param("doctorId") Long doctorId);
    
    @Query("SELECT mr FROM MedicalReport mr WHERE mr.isSharedWithDoctor = true AND " +
           "mr.appointment.doctor.id = :doctorId AND mr.patient.id = :patientId")
    List<MedicalReport> findSharedReportsByDoctorAndPatient(@Param("doctorId") Long doctorId,
                                                           @Param("patientId") Long patientId);
    
    Optional<MedicalReport> findByIdAndPatientId(Long reportId, Long patientId);
    
    @Query("SELECT COUNT(mr) FROM MedicalReport mr WHERE mr.patient.id = :patientId")
    long countByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(mr) FROM MedicalReport mr WHERE mr.patient.id = :patientId AND " +
           "mr.reportType = :reportType")
    long countByPatientIdAndReportType(@Param("patientId") Long patientId,
                                      @Param("reportType") MedicalReport.ReportType reportType);
    
    @Query("SELECT mr FROM MedicalReport mr WHERE mr.createdAt < :cutoffDate")
    List<MedicalReport> findOldReports(@Param("cutoffDate") LocalDateTime cutoffDate);
}
