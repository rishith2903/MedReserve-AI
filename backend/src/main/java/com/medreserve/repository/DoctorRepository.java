package com.medreserve.repository;

import com.medreserve.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    Optional<Doctor> findByUserId(Long userId);
    
    Optional<Doctor> findByLicenseNumber(String licenseNumber);
    
    boolean existsByLicenseNumber(String licenseNumber);
    
    List<Doctor> findByIsAvailableTrue();
    
    @Query(value = "SELECT d FROM Doctor d WHERE d.isAvailable = true",
           countQuery = "SELECT COUNT(d) FROM Doctor d WHERE d.isAvailable = true")
    Page<Doctor> findByIsAvailableTrue(Pageable pageable);
    
    List<Doctor> findBySpecialty(String specialty);
    
    Page<Doctor> findBySpecialty(String specialty, Pageable pageable);
    
    List<Doctor> findBySpecialtyAndIsAvailableTrue(String specialty);
    
    @Query(value = "SELECT d FROM Doctor d WHERE d.specialty = :specialty AND d.isAvailable = true",
           countQuery = "SELECT COUNT(d) FROM Doctor d WHERE d.specialty = :specialty AND d.isAvailable = true")
    Page<Doctor> findBySpecialtyAndIsAvailableTrue(@Param("specialty") String specialty, Pageable pageable);
    
    @Query("SELECT DISTINCT d.specialty FROM Doctor d WHERE d.isAvailable = true ORDER BY d.specialty")
    List<String> findAllAvailableSpecialties();
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND (" +
           "LOWER(d.user.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(d.user.lastName) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<Doctor> findByNameContainingIgnoreCase(@Param("name") String name);
    
    @Query(value = "SELECT d FROM Doctor d JOIN d.user u WHERE d.isAvailable = true AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.specialty) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.subSpecialty) LIKE LOWER(CONCAT('%', :keyword, '%')))",
           countQuery = "SELECT COUNT(d) FROM Doctor d JOIN d.user u WHERE d.isAvailable = true AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.specialty) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.subSpecialty) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Doctor> searchDoctors(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND " +
           "d.consultationFee BETWEEN :minFee AND :maxFee")
    List<Doctor> findByConsultationFeeBetween(@Param("minFee") BigDecimal minFee, 
                                             @Param("maxFee") BigDecimal maxFee);
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND " +
           "d.averageRating >= :minRating ORDER BY d.averageRating DESC")
    List<Doctor> findByMinimumRating(@Param("minRating") BigDecimal minRating);
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND " +
           "d.yearsOfExperience >= :minExperience ORDER BY d.yearsOfExperience DESC")
    List<Doctor> findByMinimumExperience(@Param("minExperience") Integer minExperience);
    
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND " +
           "d.consultationType IN (:consultationTypes)")
    List<Doctor> findByConsultationTypes(@Param("consultationTypes") List<Doctor.ConsultationType> consultationTypes);
    
    @Query("SELECT COUNT(d) FROM Doctor d WHERE d.specialty = :specialty AND d.isAvailable = true")
    long countBySpecialtyAndAvailable(@Param("specialty") String specialty);
    
    @Query("SELECT d FROM Doctor d ORDER BY d.averageRating DESC, d.totalReviews DESC")
    Page<Doctor> findTopRatedDoctors(Pageable pageable);
}
