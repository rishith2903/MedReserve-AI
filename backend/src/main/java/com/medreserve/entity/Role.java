package com.medreserve.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private RoleName name;
    
    @Column(length = 500)
    private String description;
    
    public enum RoleName {
        PATIENT("Patient - Can book appointments and view medical records"),
        DOCTOR("Doctor - Can manage appointments and patient records"),
        ADMIN("Admin - Can manage users and system settings"),
        MASTER_ADMIN("Master Admin - Full system access and admin management");
        
        private final String description;
        
        RoleName(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
