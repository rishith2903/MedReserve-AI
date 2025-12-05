package com.medreserve.security;

import com.medreserve.entity.User;
import com.medreserve.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("authzService")
@RequiredArgsConstructor
public class AuthzService {

    private final DoctorRepository doctorRepository;

    public boolean isSelfDoctorId(Long doctorId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return false;
        }
        User user = (User) auth.getPrincipal();
        return doctorRepository.findByUserId(user.getId())
                .map(d -> d.getId().equals(doctorId))
                .orElse(false);
    }
}
