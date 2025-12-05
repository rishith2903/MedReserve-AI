import { useState, useEffect, useCallback } from 'react';
import { 
  doctorsAPI, 
  appointmentsAPI, 
  medicalReportsAPI, 
  prescriptionsAPI, 
  healthTipsAPI,
  dashboardAPI 
} from '../services/api';

/**
 * Custom hook for real-time data fetching with automatic refresh
 * @param {string} dataType - Type of data to fetch
 * @param {object} options - Configuration options
 * @returns {object} - { data, loading, error, refresh }
 */
export const useRealTimeData = (dataType, options = {}) => {
  const {
    refreshInterval = 30000, // 30 seconds default
    autoRefresh = true,
    params = {},
    transform = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      switch (dataType) {
        case 'doctors':
          response = await doctorsAPI.getAll(params);
          break;
        case 'doctor':
          response = await doctorsAPI.getById(params.id);
          break;
        case 'specialties':
          response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors/specialties`);
          response = await response.json();
          break;
        case 'appointments':
          response = await appointmentsAPI.getAll(params);
          break;
        case 'my-appointments':
          response = await appointmentsAPI.getMyAppointments(params);
          break;
        case 'medical-reports':
          response = await medicalReportsAPI.getAll(params);
          break;
        case 'prescriptions':
          response = await prescriptionsAPI.getAll(params);
          break;
        case 'health-tips':
          response = await healthTipsAPI.getPersonalized();
          break;
        case 'patient-metrics':
          response = await dashboardAPI.getPatientMetrics();
          break;
        case 'doctor-metrics':
          response = await dashboardAPI.getDoctorMetrics();
          break;
        case 'admin-metrics':
          response = await dashboardAPI.getAdminMetrics();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      // Apply transformation if provided
      const finalData = transform ? transform(response) : response;
      setData(finalData);

    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      setError(err.message || `Failed to fetch ${dataType}`);
    } finally {
      setLoading(false);
    }
  }, [dataType, params, transform]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh, refreshInterval]);

  return { data, loading, error, refresh };
};

/**
 * Hook for fetching doctors with real-time updates
 */
export const useDoctors = (options = {}) => {
  return useRealTimeData('doctors', {
    ...options,
    transform: (response) => {
      const doctors = response.content || response.data || response || [];
      return doctors.map(doctor => ({
        id: doctor.id,
        name: `Dr. ${doctor.user?.firstName || doctor.firstName || 'Unknown'} ${doctor.user?.lastName || doctor.lastName || 'Doctor'}`,
        specialty: doctor.specialty || 'General Medicine',
        experience: doctor.yearsOfExperience || 0,
        rating: doctor.averageRating || 4.5,
        reviews: doctor.totalReviews || 0,
        location: doctor.clinicAddress || doctor.hospitalAffiliation || 'MedReserve Clinic',
        availability: doctor.isAvailable ? 'Available Today' : 'Not Available',
        consultationFee: doctor.consultationFee || 100,
        image: doctor.profileImage || null,
        isAvailable: doctor.isAvailable || false
      }));
    }
  });
};

/**
 * Hook for fetching appointments with real-time updates
 */
export const useAppointments = (options = {}) => {
  return useRealTimeData('my-appointments', {
    ...options,
    transform: (response) => {
      const appointments = response.content || response.data || response || [];
      return appointments.map(apt => ({
        id: apt.id,
        doctorName: apt.doctorName || `Dr. ${apt.doctor?.user?.firstName || apt.doctor?.firstName || 'Unknown'} ${apt.doctor?.user?.lastName || apt.doctor?.lastName || 'Doctor'}`,
        specialty: apt.doctor?.specialty || apt.specialty || 'General Medicine',
        date: apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleDateString() : 'TBD',
        time: apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD',
        status: apt.status || 'SCHEDULED',
        type: apt.appointmentType || apt.type || 'CONSULTATION',
        location: apt.location || apt.doctor?.clinicAddress || 'MedReserve Clinic',
        notes: apt.chiefComplaint || apt.symptoms || apt.notes || 'Regular consultation'
      }));
    }
  });
};

/**
 * Hook for fetching medical reports with real-time updates
 */
export const useMedicalReports = (options = {}) => {
  return useRealTimeData('medical-reports', {
    ...options,
    transform: (response) => {
      const reports = response.content || response.data || response || [];
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
  });
};

/**
 * Hook for fetching prescriptions with real-time updates
 */
export const usePrescriptions = (options = {}) => {
  return useRealTimeData('prescriptions', {
    ...options,
    transform: (response) => {
      const prescriptions = response.content || response.data || response || [];
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
  });
};

/**
 * Hook for fetching dashboard metrics with real-time updates
 */
export const useDashboardMetrics = (userRole, options = {}) => {
  const dataType = `${userRole}-metrics`;
  return useRealTimeData(dataType, options);
};

export default useRealTimeData;
