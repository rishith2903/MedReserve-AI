package com.medreserve.config;

import com.medreserve.entity.Role;
import com.medreserve.entity.User;
import com.medreserve.entity.Doctor;
import com.medreserve.entity.Appointment;
import com.medreserve.repository.RoleRepository;
import com.medreserve.repository.UserRepository;
import com.medreserve.repository.DoctorRepository;
import com.medreserve.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.data.init.enabled", havingValue = "true", matchIfMissing = false)
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener
    @Transactional
    public void onApplicationReady(ApplicationReadyEvent event) {
        initializeData();
    }

    @Transactional
    private void initializeData() {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        // Create roles
        Role patientRole = createRole(Role.RoleName.PATIENT, "Patient role");
        Role doctorRole = createRole(Role.RoleName.DOCTOR, "Doctor role");
        Role adminRole = createRole(Role.RoleName.ADMIN, "Admin role");

        // Create 25 patients with realistic data
        createUser("patient1@medreserve.com", "password123", "John", "Doe", patientRole);
        createUser("patient2@medreserve.com", "password123", "Sarah", "Johnson", patientRole);
        createUser("patient3@medreserve.com", "password123", "Michael", "Brown", patientRole);
        createUser("patient4@medreserve.com", "password123", "Emily", "Davis", patientRole);
        createUser("patient5@medreserve.com", "password123", "David", "Wilson", patientRole);
        createUser("patient6@medreserve.com", "password123", "Jessica", "Miller", patientRole);
        createUser("patient7@medreserve.com", "password123", "Christopher", "Garcia", patientRole);
        createUser("patient8@medreserve.com", "password123", "Amanda", "Martinez", patientRole);
        createUser("patient9@medreserve.com", "password123", "Matthew", "Anderson", patientRole);
        createUser("patient10@medreserve.com", "password123", "Ashley", "Taylor", patientRole);
        createUser("patient11@medreserve.com", "password123", "Daniel", "Thomas", patientRole);
        createUser("patient12@medreserve.com", "password123", "Stephanie", "Jackson", patientRole);
        createUser("patient13@medreserve.com", "password123", "Ryan", "White", patientRole);
        createUser("patient14@medreserve.com", "password123", "Nicole", "Harris", patientRole);
        createUser("patient15@medreserve.com", "password123", "Kevin", "Martin", patientRole);
        createUser("patient16@medreserve.com", "password123", "Rachel", "Thompson", patientRole);
        createUser("patient17@medreserve.com", "password123", "Brandon", "Moore", patientRole);
        createUser("patient18@medreserve.com", "password123", "Lauren", "Clark", patientRole);
        createUser("patient19@medreserve.com", "password123", "Justin", "Rodriguez", patientRole);
        createUser("patient20@medreserve.com", "password123", "Megan", "Lewis", patientRole);
        createUser("patient21@medreserve.com", "password123", "Tyler", "Lee", patientRole);
        createUser("patient22@medreserve.com", "password123", "Samantha", "Walker", patientRole);
        createUser("patient23@medreserve.com", "password123", "Jordan", "Hall", patientRole);
        createUser("patient24@medreserve.com", "password123", "Brittany", "Allen", patientRole);
        createUser("patient25@medreserve.com", "password123", "Nathan", "Young", patientRole);

        // Create doctors with diverse specializations (4-5 per specialty)
        log.info("Creating doctor profiles...");

        // Cardiology Specialists
        User cardio1 = createUser("cardio1@medreserve.com", "password123", "Dr. Jane", "Smith", doctorRole);
        createDoctorProfile(cardio1, "Cardiology", "MD, FACC", "CARD001", 15, new BigDecimal("800.00"));

        User cardio2 = createUser("cardio2@medreserve.com", "password123", "Dr. Michael", "Johnson", doctorRole);
        createDoctorProfile(cardio2, "Cardiology", "MD, FACC, FSCAI", "CARD002", 18, new BigDecimal("950.00"));

        User cardio3 = createUser("cardio3@medreserve.com", "password123", "Dr. Sarah", "Williams", doctorRole);
        createDoctorProfile(cardio3, "Cardiology", "MD, FACC", "CARD003", 12, new BigDecimal("750.00"));

        User cardio4 = createUser("cardio4@medreserve.com", "password123", "Dr. David", "Brown", doctorRole);
        createDoctorProfile(cardio4, "Cardiology", "MD, FACC, FHRS", "CARD004", 20, new BigDecimal("1200.00"));

        User cardio5 = createUser("cardio5@medreserve.com", "password123", "Dr. Anita", "Verma", doctorRole);
        createDoctorProfile(cardio5, "Cardiology", "MD, FACC", "CARD005", 10, new BigDecimal("700.00"));

        // Neurology Specialists
        User neuro1 = createUser("neuro1@medreserve.com", "password123", "Dr. Robert", "Miller", doctorRole);
        createDoctorProfile(neuro1, "Neurology", "MD, PhD", "NEUR001", 12, new BigDecimal("900.00"));

        User neuro2 = createUser("neuro2@medreserve.com", "password123", "Dr. Emily", "Davis", doctorRole);
        createDoctorProfile(neuro2, "Neurology", "MD, FAAN", "NEUR002", 14, new BigDecimal("850.00"));

        User neuro3 = createUser("neuro3@medreserve.com", "password123", "Dr. James", "Wilson", doctorRole);
        createDoctorProfile(neuro3, "Neurology", "MD, PhD, FAAN", "NEUR003", 16, new BigDecimal("1100.00"));

        User neuro4 = createUser("neuro4@medreserve.com", "password123", "Dr. Lisa", "Moore", doctorRole);
        createDoctorProfile(neuro4, "Neurology", "MD, FAAN", "NEUR004", 10, new BigDecimal("750.00"));

        User neuro5 = createUser("neuro5@medreserve.com", "password123", "Dr. Suresh", "Reddy", doctorRole);
        createDoctorProfile(neuro5, "Neurology", "MD, DM", "NEUR005", 13, new BigDecimal("800.00"));

        // Dermatology Specialists
        User derma1 = createUser("derma1@medreserve.com", "password123", "Dr. Lisa", "Anderson", doctorRole);
        createDoctorProfile(derma1, "Dermatology", "MD, FAAD", "DERM001", 8, new BigDecimal("650.00"));

        User derma2 = createUser("derma2@medreserve.com", "password123", "Dr. Kevin", "Taylor", doctorRole);
        createDoctorProfile(derma2, "Dermatology", "MD, FAAD", "DERM002", 11, new BigDecimal("700.00"));

        User derma3 = createUser("derma3@medreserve.com", "password123", "Dr. Rachel", "Garcia", doctorRole);
        createDoctorProfile(derma3, "Dermatology", "MD, FAAD, FACMS", "DERM003", 9, new BigDecimal("750.00"));

        User derma4 = createUser("derma4@medreserve.com", "password123", "Dr. Mark", "Martinez", doctorRole);
        createDoctorProfile(derma4, "Dermatology", "MD, FAAD", "DERM004", 13, new BigDecimal("680.00"));

        User derma5 = createUser("derma5@medreserve.com", "password123", "Dr. Kavya", "Nair", doctorRole);
        createDoctorProfile(derma5, "Dermatology", "MD, FAAD", "DERM005", 7, new BigDecimal("600.00"));

        // Orthopedics Specialists
        User ortho1 = createUser("ortho1@medreserve.com", "password123", "Dr. James", "Taylor", doctorRole);
        createDoctorProfile(ortho1, "Orthopedics", "MD, FAAOS", "ORTH001", 20, new BigDecimal("1000.00"));

        User ortho2 = createUser("ortho2@medreserve.com", "password123", "Dr. Amanda", "Clark", doctorRole);
        createDoctorProfile(ortho2, "Orthopedics", "MD, FAAOS", "ORTH002", 15, new BigDecimal("850.00"));

        User ortho3 = createUser("ortho3@medreserve.com", "password123", "Dr. Steven", "Lewis", doctorRole);
        createDoctorProfile(ortho3, "Orthopedics", "MD, FAAOS", "ORTH003", 17, new BigDecimal("900.00"));

        User ortho4 = createUser("ortho4@medreserve.com", "password123", "Dr. Jennifer", "Walker", doctorRole);
        createDoctorProfile(ortho4, "Orthopedics", "MD, FAAOS", "ORTH004", 12, new BigDecimal("750.00"));

        User ortho5 = createUser("ortho5@medreserve.com", "password123", "Dr. Arjun", "Mehta", doctorRole);
        createDoctorProfile(ortho5, "Orthopedics", "MD, FAAOS", "ORTH005", 11, new BigDecimal("800.00"));

        // Pediatrics Specialists
        User pedia1 = createUser("pedia1@medreserve.com", "password123", "Dr. Maria", "Garcia", doctorRole);
        createDoctorProfile(pedia1, "Pediatrics", "MD, FAAP", "PEDI001", 10, new BigDecimal("600.00"));

        User pedia2 = createUser("pedia2@medreserve.com", "password123", "Dr. Thomas", "Hall", doctorRole);
        createDoctorProfile(pedia2, "Pediatrics", "MD, FAAP", "PEDI002", 14, new BigDecimal("650.00"));

        User pedia3 = createUser("pedia3@medreserve.com", "password123", "Dr. Nancy", "Young", doctorRole);
        createDoctorProfile(pedia3, "Pediatrics", "MD, FAAP", "PEDI003", 8, new BigDecimal("550.00"));

        User pedia4 = createUser("pedia4@medreserve.com", "password123", "Dr. Christopher", "King", doctorRole);
        createDoctorProfile(pedia4, "Pediatrics", "MD, FAAP", "PEDI004", 16, new BigDecimal("700.00"));

        User pedia5 = createUser("pedia5@medreserve.com", "password123", "Dr. Deepika", "Joshi", doctorRole);
        createDoctorProfile(pedia5, "Pediatrics", "MD, FAAP", "PEDI005", 9, new BigDecimal("580.00"));

        // Additional Specialties - Psychiatry
        User psych1 = createUser("psych1@medreserve.com", "password123", "Dr. Elena", "Rodriguez", doctorRole);
        createDoctorProfile(psych1, "Psychiatry", "MD, MRCPsych", "PSYC001", 12, new BigDecimal("800.00"));

        User psych2 = createUser("psych2@medreserve.com", "password123", "Dr. Marcus", "Thompson", doctorRole);
        createDoctorProfile(psych2, "Psychiatry", "MD, PhD", "PSYC002", 15, new BigDecimal("850.00"));

        User psych3 = createUser("psych3@medreserve.com", "password123", "Dr. Ravi", "Agarwal", doctorRole);
        createDoctorProfile(psych3, "Psychiatry", "MD, DPM", "PSYC003", 8, new BigDecimal("750.00"));

        User psych4 = createUser("psych4@medreserve.com", "password123", "Dr. Meera", "Kapoor", doctorRole);
        createDoctorProfile(psych4, "Psychiatry", "MD, MRCPsych", "PSYC004", 11, new BigDecimal("780.00"));

        User psych5 = createUser("psych5@medreserve.com", "password123", "Dr. Sanjay", "Malhotra", doctorRole);
        createDoctorProfile(psych5, "Psychiatry", "MD, DPM", "PSYC005", 14, new BigDecimal("820.00"));

        // Oncology Specialists
        User onco1 = createUser("onco1@medreserve.com", "password123", "Dr. Priya", "Sharma", doctorRole);
        createDoctorProfile(onco1, "Oncology", "MD, FASCO", "ONCO001", 18, new BigDecimal("1200.00"));

        User onco2 = createUser("onco2@medreserve.com", "password123", "Dr. Richard", "Chen", doctorRole);
        createDoctorProfile(onco2, "Oncology", "MD, PhD, FASCO", "ONCO002", 20, new BigDecimal("1300.00"));

        User onco3 = createUser("onco3@medreserve.com", "password123", "Dr. Sunita", "Rao", doctorRole);
        createDoctorProfile(onco3, "Oncology", "MD, FASCO", "ONCO003", 16, new BigDecimal("1150.00"));

        User onco4 = createUser("onco4@medreserve.com", "password123", "Dr. Kiran", "Shah", doctorRole);
        createDoctorProfile(onco4, "Oncology", "MD, DM", "ONCO004", 12, new BigDecimal("1000.00"));

        User onco5 = createUser("onco5@medreserve.com", "password123", "Dr. Rohit", "Bansal", doctorRole);
        createDoctorProfile(onco5, "Oncology", "MD, FASCO", "ONCO005", 19, new BigDecimal("1250.00"));

        // Gynecology Specialists (5 doctors)
        User gyno1 = createUser("gyno1@medreserve.com", "password123", "Dr. Sophia", "Williams", doctorRole);
        createDoctorProfile(gyno1, "Gynecology", "MD, FACOG", "GYNO001", 14, new BigDecimal("750.00"));

        User gyno2 = createUser("gyno2@medreserve.com", "password123", "Dr. Maria", "Gonzalez", doctorRole);
        createDoctorProfile(gyno2, "Gynecology", "MD, FACOG", "GYNO002", 16, new BigDecimal("800.00"));

        User gyno3 = createUser("gyno3@medreserve.com", "password123", "Dr. Lakshmi", "Iyer", doctorRole);
        createDoctorProfile(gyno3, "Gynecology", "MD, FACOG", "GYNO003", 11, new BigDecimal("720.00"));

        User gyno4 = createUser("gyno4@medreserve.com", "password123", "Dr. Pooja", "Desai", doctorRole);
        createDoctorProfile(gyno4, "Gynecology", "MD, FACOG", "GYNO004", 13, new BigDecimal("780.00"));

        User gyno5 = createUser("gyno5@medreserve.com", "password123", "Dr. Rashida", "Khan", doctorRole);
        createDoctorProfile(gyno5, "Gynecology", "MD, FACOG", "GYNO005", 18, new BigDecimal("850.00"));

        // Ophthalmology Specialists (5 doctors)
        User opht1 = createUser("opht1@medreserve.com", "password123", "Dr. Alexander", "Kumar", doctorRole);
        createDoctorProfile(opht1, "Ophthalmology", "MD, FACS", "OPHT001", 11, new BigDecimal("700.00"));

        User opht2 = createUser("opht2@medreserve.com", "password123", "Dr. Jennifer", "Park", doctorRole);
        createDoctorProfile(opht2, "Ophthalmology", "MD, FACS", "OPHT002", 13, new BigDecimal("750.00"));

        User opht3 = createUser("opht3@medreserve.com", "password123", "Dr. Ramesh", "Gupta", doctorRole);
        createDoctorProfile(opht3, "Ophthalmology", "MD, FACS", "OPHT003", 15, new BigDecimal("800.00"));

        User opht4 = createUser("opht4@medreserve.com", "password123", "Dr. Nisha", "Reddy", doctorRole);
        createDoctorProfile(opht4, "Ophthalmology", "MD, FACS", "OPHT004", 9, new BigDecimal("680.00"));

        User opht5 = createUser("opht5@medreserve.com", "password123", "Dr. Vikash", "Jain", doctorRole);
        createDoctorProfile(opht5, "Ophthalmology", "MD, FACS", "OPHT005", 17, new BigDecimal("820.00"));

        // ENT Specialists (5 doctors)
        User ent1 = createUser("ent1@medreserve.com", "password123", "Dr. Ahmed", "Hassan", doctorRole);
        createDoctorProfile(ent1, "ENT", "MD, FACS", "ENT001", 10, new BigDecimal("650.00"));

        User ent2 = createUser("ent2@medreserve.com", "password123", "Dr. Lisa", "Chang", doctorRole);
        createDoctorProfile(ent2, "ENT", "MD, FACS", "ENT002", 12, new BigDecimal("700.00"));

        User ent3 = createUser("ent3@medreserve.com", "password123", "Dr. Sunil", "Chopra", doctorRole);
        createDoctorProfile(ent3, "ENT", "MD, FACS", "ENT003", 14, new BigDecimal("750.00"));

        User ent4 = createUser("ent4@medreserve.com", "password123", "Dr. Kavita", "Sinha", doctorRole);
        createDoctorProfile(ent4, "ENT", "MD, FACS", "ENT004", 8, new BigDecimal("620.00"));

        User ent5 = createUser("ent5@medreserve.com", "password123", "Dr. Manoj", "Tiwari", doctorRole);
        createDoctorProfile(ent5, "ENT", "MD, FACS", "ENT005", 16, new BigDecimal("780.00"));

        // Endocrinology Specialists (5 doctors)
        User endo1 = createUser("endo1@medreserve.com", "password123", "Dr. Rajesh", "Patel", doctorRole);
        createDoctorProfile(endo1, "Endocrinology", "MD, FACE", "ENDO001", 15, new BigDecimal("800.00"));

        User endo2 = createUser("endo2@medreserve.com", "password123", "Dr. Catherine", "Lee", doctorRole);
        createDoctorProfile(endo2, "Endocrinology", "MD, FACE", "ENDO002", 17, new BigDecimal("850.00"));

        User endo3 = createUser("endo3@medreserve.com", "password123", "Dr. Ashok", "Mehta", doctorRole);
        createDoctorProfile(endo3, "Endocrinology", "MD, FACE", "ENDO003", 12, new BigDecimal("780.00"));

        User endo4 = createUser("endo4@medreserve.com", "password123", "Dr. Shweta", "Agarwal", doctorRole);
        createDoctorProfile(endo4, "Endocrinology", "MD, FACE", "ENDO004", 10, new BigDecimal("720.00"));

        User endo5 = createUser("endo5@medreserve.com", "password123", "Dr. Ravi", "Krishnan", doctorRole);
        createDoctorProfile(endo5, "Endocrinology", "MD, FACE", "ENDO005", 19, new BigDecimal("900.00"));

        log.info("Completed creating doctor profiles");

        // Create master admin role and user
        Role masterAdminRole = createRole(Role.RoleName.MASTER_ADMIN, "Master Admin role with full system access");

        // Create 1 master admin (full access)
        createUser("masteradmin@medreserve.com", "password123", "Master", "Admin", masterAdminRole);

        // Create 8 regular admins with realistic data
        createUser("admin@medreserve.com", "password123", "Admin", "User", adminRole);
        createUser("admin1@medreserve.com", "password123", "Sarah", "Mitchell", adminRole);
        createUser("admin2@medreserve.com", "password123", "Mike", "Johnson", adminRole);
        createUser("admin3@medreserve.com", "password123", "Jennifer", "Adams", adminRole);
        createUser("admin4@medreserve.com", "password123", "Robert", "Wilson", adminRole);
        createUser("admin5@medreserve.com", "password123", "Lisa", "Brown", adminRole);
        createUser("admin6@medreserve.com", "password123", "David", "Taylor", adminRole);
        createUser("admin7@medreserve.com", "password123", "Michelle", "Davis", adminRole);

        // Create demo accounts for login page
        log.info("Creating demo accounts...");
        User demoPatient = createUser("patient@medreserve.com", "password123", "Demo", "Patient", patientRole);
        User demoDoctor = createUser("doctor@medreserve.com", "password123", "Demo", "Doctor", doctorRole);
        createDoctorProfile(demoDoctor, "General Medicine", "MD", "DEMO001", 5, new BigDecimal("500.00"));
        createUser("demo@medreserve.com", "password123", "Demo", "Admin", adminRole);
        log.info("Completed creating demo accounts");

        // Create realistic appointments
        log.info("Creating sample appointments...");
        createSampleAppointments();

        // Create sample medical reports and health records
        log.info("Creating sample medical reports...");
        createSampleMedicalReports();

        log.info("Sample data initialized successfully with 25 patients, {} doctors (5 per specialty), and {} admins",
                 doctorRepository.count(), userRepository.countByRoleName(Role.RoleName.ADMIN));
    }

    private Role createRole(Role.RoleName name, String description) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        return roleRepository.save(role);
    }

    private User createUser(String email, String password, String firstName, String lastName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setIsActive(true);
        user.setEmailVerified(true);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private void createDoctorProfile(User user, String specialty, String qualification,
                                   String licenseNumber, int experience, BigDecimal fee) {
        try {
            Doctor doctor = new Doctor();
            doctor.setUser(user);
            doctor.setSpecialty(specialty);
            doctor.setQualification(qualification);
            doctor.setLicenseNumber(licenseNumber);
            doctor.setYearsOfExperience(experience);
            doctor.setConsultationFee(fee);
            doctor.setConsultationType(Doctor.ConsultationType.BOTH);
            doctor.setIsAvailable(true);
            doctor.setBiography("Experienced " + specialty + " specialist with " + experience + " years of practice.");
            doctor.setHospitalAffiliation("MedReserve Medical Center");
            doctorRepository.save(doctor);
            log.info("Created doctor profile for: {} {}", user.getFirstName(), user.getLastName());
        } catch (Exception e) {
            log.error("Failed to create doctor profile for user: {} {}, Error: {}",
                     user.getFirstName(), user.getLastName(), e.getMessage());
        }
    }

    private void createSampleAppointments() {
        List<User> patients = userRepository.findByRoleName(Role.RoleName.PATIENT);
        List<Doctor> doctors = doctorRepository.findAll();

        if (patients.isEmpty() || doctors.isEmpty()) {
            log.warn("No patients or doctors found for creating appointments");
            return;
        }

        // Create appointments for the past, present, and future
        LocalDateTime now = LocalDateTime.now();
        String[] symptoms = {
            "Chest pain and shortness of breath",
            "Severe headache and dizziness",
            "Skin rash and itching",
            "Joint pain and stiffness",
            "Fever and cough in child",
            "Anxiety and sleep issues",
            "Abdominal pain and nausea",
            "Vision problems and eye strain",
            "Hearing loss and ear pain",
            "Irregular menstrual cycle",
            "Diabetes management consultation",
            "Routine health checkup"
        };

        String[] notes = {
            "Patient reports symptoms for 3 days",
            "Family history of similar condition",
            "Previous treatment was ineffective",
            "Seeking second opinion",
            "Regular follow-up appointment",
            "Urgent consultation needed",
            "Routine preventive care",
            "Post-surgery follow-up",
            "Medication adjustment required",
            "Annual health screening"
        };

        Random random = new Random();

        // Create 50 realistic appointments
        for (int i = 0; i < 50; i++) {
            try {
                User patient = patients.get(random.nextInt(patients.size()));
                Doctor doctor = doctors.get(random.nextInt(doctors.size()));

                // Create appointments spread across past 30 days and next 30 days
                LocalDateTime appointmentTime = now.plusDays(random.nextInt(61) - 30)
                    .withHour(9 + random.nextInt(9)) // 9 AM to 5 PM
                    .withMinute(random.nextBoolean() ? 0 : 30) // On the hour or half hour
                    .withSecond(0)
                    .withNano(0);

                Appointment appointment = new Appointment();
                appointment.setPatient(patient);
                appointment.setDoctor(doctor);
                appointment.setAppointmentDateTime(appointmentTime);
                appointment.setSymptoms(symptoms[random.nextInt(symptoms.length)]);
                appointment.setDoctorNotes(notes[random.nextInt(notes.length)]);

                // Set appointment type and status based on timing
                if (appointmentTime.isBefore(now)) {
                    appointment.setAppointmentType(random.nextBoolean() ?
                        Appointment.AppointmentType.IN_PERSON :
                        Appointment.AppointmentType.ONLINE);
                    appointment.setStatus(random.nextBoolean() ?
                        Appointment.AppointmentStatus.COMPLETED :
                        Appointment.AppointmentStatus.CANCELLED);
                } else {
                    appointment.setAppointmentType(random.nextBoolean() ?
                        Appointment.AppointmentType.IN_PERSON :
                        Appointment.AppointmentType.FOLLOW_UP);
                    appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
                }

                appointmentRepository.save(appointment);
            } catch (Exception e) {
                log.warn("Failed to create appointment {}: {}", i, e.getMessage());
            }
        }

        log.info("Created {} sample appointments", appointmentRepository.count());
    }

    private void createSampleMedicalReports() {
        List<User> patients = userRepository.findByRoleName(Role.RoleName.PATIENT);
        List<Doctor> doctors = doctorRepository.findAll();

        if (patients.isEmpty() || doctors.isEmpty()) {
            log.warn("No patients or doctors found for creating medical reports");
            return;
        }

        String[] reportTypes = {
            "Blood Test Report", "X-Ray Report", "MRI Scan", "CT Scan",
            "ECG Report", "Ultrasound", "Biopsy Report", "Pathology Report",
            "Allergy Test", "Diabetes Screening", "Cholesterol Test", "Thyroid Function Test"
        };

        String[] findings = {
            "Normal values within reference range",
            "Mild elevation in cholesterol levels",
            "Blood pressure slightly elevated",
            "Blood sugar levels normal",
            "No abnormalities detected",
            "Requires follow-up in 3 months",
            "Medication adjustment recommended",
            "Lifestyle changes advised",
            "Further investigation needed",
            "Improvement noted from previous report"
        };

        String[] recommendations = {
            "Continue current medication",
            "Increase physical activity",
            "Follow low-sodium diet",
            "Schedule follow-up appointment",
            "Monitor blood pressure daily",
            "Reduce stress levels",
            "Take prescribed supplements",
            "Avoid allergens",
            "Regular exercise recommended",
            "Maintain healthy weight"
        };

        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();

        // Create 30 medical reports
        for (int i = 0; i < 30; i++) {
            try {
                User patient = patients.get(random.nextInt(patients.size()));
                Doctor doctor = doctors.get(random.nextInt(doctors.size()));

                LocalDateTime reportDate = now.minusDays(random.nextInt(365)); // Reports from past year

                // Note: Since we don't have a MedicalReport entity, we'll create this as a comment
                // In a real implementation, you would create the MedicalReport entity and repository
                log.info("Sample Medical Report {}: Patient: {} {}, Doctor: {} {}, Type: {}, Date: {}",
                    i + 1,
                    patient.getFirstName(), patient.getLastName(),
                    doctor.getUser().getFirstName(), doctor.getUser().getLastName(),
                    reportTypes[random.nextInt(reportTypes.length)],
                    reportDate.toLocalDate()
                );
            } catch (Exception e) {
                log.warn("Failed to create medical report {}: {}", i, e.getMessage());
            }
        }

        log.info("Created sample medical reports data");
    }
}
