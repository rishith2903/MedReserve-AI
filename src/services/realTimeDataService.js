/* eslint-disable no-console */
/**
 * Real-Time Data Service with Comprehensive Fallback Strategy
 * Handles API failures gracefully and provides seamless user experience
 */

import { 
  doctorsAPI, 
  appointmentsAPI, 
  medicalReportsAPI, 
  prescriptionsAPI, 
  healthTipsAPI 
} from './api';
import demoDataService from './demoDataService';

class RealTimeDataService {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Network connection restored - refreshing data');
      this.refreshAllData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📡 Network connection lost - using cached data');
    });
  }

  async refreshAllData() {
    // Refresh all cached data when network comes back online
    this.cache.clear();
    this.retryAttempts.clear();
  }

  /**
   * Retry logic with exponential backoff
   */
  async retryWithBackoff(operation, operationName, maxRetries = this.maxRetries) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
        }
        return result;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(`⚠️ ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Fetch doctors with comprehensive fallback and retry logic
   */
  async fetchDoctors() {
    const cacheKey = 'doctors';

    // Return cached data if network is offline
    if (!this.isOnline && this.cache.has(cacheKey)) {
      console.log('📡 Using cached doctors data (offline)');
      return this.cache.get(cacheKey);
    }

    try {
      // Demo gate: if DEMO_MODE and demo user, provide demo stream data
      const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isDemoUser = !!user && /@medreserve\.com$|@demo\./i.test(user.email || '');
      if (demoMode && isDemoUser) {
        const demo = demoDataService.getDoctors();
        const transformedDoctors = this.transformDoctorsData(demo);
        this.cache.set(cacheKey, transformedDoctors);
        return transformedDoctors;
      }
      console.log('🔄 Fetching doctors from API...');

      const operation = async () => {
        // Try multiple API endpoints with retry
        const endpoints = [
          () => doctorsAPI.getAll(),
          () => fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors`).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          }),
          () => fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors?page=0&size=100`).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
        ];

        let response = null;
        let lastError = null;

        for (const endpoint of endpoints) {
          try {
            response = await endpoint();
            if (response && (response.content || Array.isArray(response))) {
              console.log('✅ Successfully fetched doctors from API');
              break;
            }
          } catch (error) {
            lastError = error;
            console.warn('⚠️ API endpoint failed, trying next...', error.message);
          }
        }

        if (!response) {
          throw lastError || new Error('All API endpoints failed');
        }

        return response;
      };

      const response = await this.retryWithBackoff(operation, 'Fetch Doctors');

      // Transform the data
      const doctors = response.content || response.data || response || [];
      const transformedDoctors = this.transformDoctorsData(doctors);

      // Cache the successful result
      this.cache.set(cacheKey, transformedDoctors);

      return transformedDoctors;

    } catch (error) {
      console.error('❌ All doctor API endpoints failed after retries:', error);
      // Return cached data if available
      if (this.cache.has(cacheKey)) {
        console.log('📦 Using cached doctors data');
        return this.cache.get(cacheKey);
      }
      // No fallback demo data: return empty array for real-data-only mode
      return [];
    }
  }

  /**
   * Transform doctors data from backend format to frontend format
   */
  transformDoctorsData(doctors) {
    return doctors.map(doctor => ({
      id: doctor.id,
      name: `Dr. ${doctor.user?.firstName || doctor.firstName || 'Unknown'} ${doctor.user?.lastName || doctor.lastName || 'Doctor'}`,
      specialty: doctor.specialty || 'General Medicine',
      experience: doctor.yearsOfExperience || Math.floor(Math.random() * 20) + 5,
      rating: doctor.averageRating || (4.0 + Math.random() * 1.0),
      reviews: doctor.totalReviews || Math.floor(Math.random() * 200) + 50,
      location: doctor.clinicAddress || doctor.hospitalAffiliation || 'MedReserve Clinic',
      availability: doctor.isAvailable !== false ? 'Available Today' : 'Not Available',
      consultationFee: doctor.consultationFee || (100 + Math.floor(Math.random() * 200)),
      image: doctor.profileImage || null,
      isAvailable: doctor.isAvailable !== false,
      qualification: doctor.qualification || 'MD',
      biography: doctor.biography || 'Experienced healthcare professional dedicated to providing quality care.',
      phone: doctor.user?.phoneNumber || '+1 (555) 123-4567',
      email: doctor.user?.email || 'doctor@medreserve.com'
    }));
  }

  /**
   * Get fallback doctors data (enhanced demo data)
   */
  // Fallback demo data removed for real-data-only mode
  getFallbackDoctors() { return []; }

  /**
   * Fetch appointments with fallback
   */
  async fetchAppointments() {
    try {
      console.log('🔄 Fetching appointments from API...');
      const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isDemoUser = !!user && /@medreserve\.com$|@demo\./i.test(user.email || '');
      if (demoMode && isDemoUser) {
        return this.transformAppointmentsData(demoDataService.getAppointments());
      }
      const response = await appointmentsAPI.getAll();
      const appointments = response.content || response.data || response || [];

      return this.transformAppointmentsData(appointments);
    } catch (error) {
      console.error('❌ Appointments API failed:', error);
      return [];
    }
  }

  /**
   * Transform appointments data
   */
  transformAppointmentsData(appointments) {
    return appointments.map(apt => ({
      id: apt.id,
      doctorName: apt.doctorName || `Dr. ${apt.doctor?.user?.firstName || 'Unknown'} ${apt.doctor?.user?.lastName || 'Doctor'}`,
      specialty: apt.doctor?.specialty || apt.specialty || 'General Medicine',
      date: apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleDateString() : 'TBD',
      time: apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD',
      status: apt.status || 'SCHEDULED',
      type: apt.appointmentType || apt.type || 'CONSULTATION',
      location: apt.location || apt.doctor?.clinicAddress || 'MedReserve Clinic',
      notes: apt.chiefComplaint || apt.symptoms || apt.notes || 'Regular consultation'
    }));
  }

  /**
   * Get fallback appointments
   */
  getFallbackAppointments() { return []; }

  /**
   * Fetch medical reports with fallback
   */
  async fetchMedicalReports() {
    try {
      console.log('🔄 Fetching medical reports from API...');
      const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isDemoUser = !!user && /@medreserve\.com$|@demo\./i.test(user.email || '');
      if (demoMode && isDemoUser) {
        return this.transformMedicalReportsData(demoDataService.getReports());
      }
      const response = await medicalReportsAPI.getAll();
      const reports = response.content || response.data || response || [];

      return this.transformMedicalReportsData(reports);
    } catch (error) {
      console.error('❌ Medical reports API failed:', error);
      return [];
    }
  }

  /**
   * Transform medical reports data
   */
  transformMedicalReportsData(reports) {
    return reports.map(report => ({
      id: report.id,
      title: report.title || report.reportType || 'Medical Report',
      type: report.reportType || report.category || 'Lab Report',
      date: report.createdAt ? new Date(report.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      doctor: report.doctorName || `Dr. ${report.doctor?.user?.firstName || 'Unknown'} ${report.doctor?.user?.lastName || 'Doctor'}`,
      status: report.status || 'Reviewed',
      description: report.description || report.notes || 'Medical report',
      fileUrl: report.fileUrl || report.filePath || '#'
    }));
  }

  /**
   * Get fallback medical reports
   */
  getFallbackMedicalReports() { return []; }

  /**
   * Fetch prescriptions with fallback
   */
  async fetchPrescriptions() {
    try {
      console.log('🔄 Fetching prescriptions from API...');
      const demoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isDemoUser = !!user && /@medreserve\.com$|@demo\./i.test(user.email || '');
      if (demoMode && isDemoUser) {
        return this.transformPrescriptionsData(demoDataService.getPrescriptions());
      }
      const response = await prescriptionsAPI.getAll();
      const prescriptions = response.content || response.data || response || [];

      return this.transformPrescriptionsData(prescriptions);
    } catch (error) {
      console.error('❌ Prescriptions API failed:', error);
      return [];
    }
  }

  /**
   * Transform prescriptions data
   */
  transformPrescriptionsData(prescriptions) {
    return prescriptions.map(prescription => {
      const startDate = new Date(prescription.startDate || prescription.createdAt);
      const endDate = new Date(prescription.endDate || startDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const today = new Date();
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
      
      return {
        id: prescription.id,
        name: prescription.medicationName || prescription.medicine || 'Unknown Medicine',
        dosage: prescription.dosage || '1 tablet',
        frequency: prescription.frequency || prescription.instructions || 'As needed',
        prescribedBy: prescription.doctorName || `Dr. ${prescription.doctor?.user?.firstName || 'Unknown'} ${prescription.doctor?.user?.lastName || 'Doctor'}`,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        status: remainingDays > 0 ? 'Active' : 'Completed',
        instructions: prescription.instructions || prescription.notes || 'Take as prescribed',
        remainingDays,
        totalDays,
        category: prescription.category || prescription.type || 'General'
      };
    });
  }

  /**
   * Get fallback prescriptions
   */
  getFallbackPrescriptions() { return []; }

  /**
   * Get dashboard metrics with real-time calculation
   */
  async getDashboardMetrics(userRole = 'patient') {
    try {
      const [doctors, appointments] = await Promise.all([
        this.fetchDoctors(),
        this.fetchAppointments()
      ]);

      const today = new Date();
      const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.date) >= today
      ).length;

      const availableDoctors = doctors.filter(d => d.isAvailable).length;

      return {
        totalDoctors: doctors.length,
        availableDoctors,
        upcomingAppointments,
        totalAppointments: appointments.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Dashboard metrics calculation failed:', error);
      return {
        totalDoctors: 0,
        availableDoctors: 0,
        upcomingAppointments: 0,
        totalAppointments: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const realTimeDataService = new RealTimeDataService();

export default realTimeDataService;
