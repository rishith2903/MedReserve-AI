package com.medreserve.repository;

import com.medreserve.entity.Role;
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
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByPhoneNumber(String phoneNumber);
    
    List<User> findByRole(Role role);
    
    List<User> findByRoleName(Role.RoleName roleName);
    
    Page<User> findByRoleName(Role.RoleName roleName, Pageable pageable);
    
    List<User> findByIsActiveTrue();
    
    List<User> findByEmailVerifiedFalse();
    
    @Query("SELECT u FROM User u WHERE u.role.name = :roleName AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("roleName") Role.RoleName roleName);
    
    @Query("SELECT u FROM User u WHERE u.lastLogin < :date")
    List<User> findUsersNotLoggedInSince(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName")
    long countByRoleName(@Param("roleName") Role.RoleName roleName);
}
