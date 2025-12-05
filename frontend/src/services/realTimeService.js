/* eslint-disable no-console */
import { useEffect, useState } from 'react';
/**
 * Real-Time Data Service
 * Handles real-time data fetching and updates across the application
 */

import { appointmentsAPI, doctorsAPI } from './api';

class RealTimeService {
  constructor() {
    this.subscribers = new Map();
    this.cache = new Map();
    this.refreshIntervals = new Map();
  }

  /**
   * Subscribe to real-time data updates
   * @param {string} dataType - Type of data to subscribe to
   * @param {function} callback - Callback function to call when data updates
   * @param {number} refreshInterval - How often to refresh data (in ms)
   */
  subscribe(dataType, callback, refreshInterval = 30000) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    
    this.subscribers.get(dataType).add(callback);
    
    // Start refresh interval if not already running
    if (!this.refreshIntervals.has(dataType)) {
      this.startRefreshInterval(dataType, refreshInterval);
    }
    
    // Immediately fetch and return cached data if available
    if (this.cache.has(dataType)) {
      callback(this.cache.get(dataType));
    } else {
      this.fetchData(dataType);
    }
  }

  /**
   * Unsubscribe from data updates
   */
  unsubscribe(dataType, callback) {
    if (this.subscribers.has(dataType)) {
      this.subscribers.get(dataType).delete(callback);
      
      // Stop refresh interval if no more subscribers
      if (this.subscribers.get(dataType).size === 0) {
        this.stopRefreshInterval(dataType);
      }
    }
  }

  /**
   * Start refresh interval for a data type
   */
  startRefreshInterval(dataType, interval) {
    const intervalId = setInterval(() => {
      this.fetchData(dataType);
    }, interval);
    
    this.refreshIntervals.set(dataType, intervalId);
  }

  /**
   * Stop refresh interval for a data type
   */
  stopRefreshInterval(dataType) {
    if (this.refreshIntervals.has(dataType)) {
      clearInterval(this.refreshIntervals.get(dataType));
      this.refreshIntervals.delete(dataType);
    }
  }

  /**
   * Fetch data based on type
   */
  async fetchData(dataType) {
    try {
      let data;
      
      switch (dataType) {
        case 'doctors':
          data = await this.fetchDoctors();
          break;
        case 'appointments':
          data = await this.fetchAppointments();
          break;
        case 'specialties':
          data = await this.fetchSpecialties();
          break;
        case 'dashboard-metrics':
          data = await this.fetchDashboardMetrics();
          break;
        default:
          console.warn(`Unknown data type: ${dataType}`);
          return;
      }
      
      // Cache the data
      this.cache.set(dataType, data);
      
      // Notify all subscribers
      if (this.subscribers.has(dataType)) {
        this.subscribers.get(dataType).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in subscriber callback:', error);
          }
        });
      }
      
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      
      // Notify subscribers of error
      if (this.subscribers.has(dataType)) {
        this.subscribers.get(dataType).forEach(callback => {
          try {
            callback(null, error);
          } catch (callbackError) {
            console.error('Error in error callback:', callbackError);
          }
        });
      }
    }
  }

  /**
   * Fetch doctors data
   */
  async fetchDoctors() {
    const response = await doctorsAPI.getAll();
    const doctors = response.content || response.data || response || [];
    
    return {
      doctors: doctors.map(doctor => ({
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
      })),
      totalCount: doctors.length,
      availableCount: doctors.filter(d => d.isAvailable).length,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Fetch appointments data
   */
  async fetchAppointments() {
    const response = await appointmentsAPI.getAll();
    const appointments = response.content || response.data || response || [];
    
    const now = new Date();
    const upcomingAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDateTime) > now
    );
    
    return {
      appointments: appointments.map(apt => ({
        id: apt.id,
        doctorName: apt.doctorName || `Dr. ${apt.doctor?.user?.firstName || apt.doctor?.firstName || 'Unknown'} ${apt.doctor?.user?.lastName || apt.doctor?.lastName || 'Doctor'}`,
        specialty: apt.doctor?.specialty || apt.specialty || 'General Medicine',
        date: apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleDateString() : 'TBD',
        time: apt.appointmentDateTime ? new Date(apt.appointmentDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD',
        status: apt.status || 'SCHEDULED',
        type: apt.appointmentType || apt.type || 'CONSULTATION',
        location: apt.location || apt.doctor?.clinicAddress || 'MedReserve Clinic',
        notes: apt.chiefComplaint || apt.symptoms || apt.notes || 'Regular consultation'
      })),
      totalCount: appointments.length,
      upcomingCount: upcomingAppointments.length,
      nextAppointment: upcomingAppointments.sort((a, b) => 
        new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime)
      )[0] || null,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Fetch specialties data
   */
  async fetchSpecialties() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/doctors/specialties`);
    const specialties = await response.json();
    
    return {
      specialties: Array.isArray(specialties) ? specialties : [],
      count: Array.isArray(specialties) ? specialties.length : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Fetch dashboard metrics
   */
  async fetchDashboardMetrics() {
    const [doctorsData, appointmentsData] = await Promise.allSettled([
      this.fetchDoctors(),
      this.fetchAppointments()
    ]);

    const doctors = doctorsData.status === 'fulfilled' ? doctorsData.value : { doctors: [], availableCount: 0 };
    const appointments = appointmentsData.status === 'fulfilled' ? appointmentsData.value : { upcomingCount: 0, nextAppointment: null };

    return {
      totalDoctors: doctors.totalCount || 0,
      availableDoctors: doctors.availableCount || 0,
      upcomingAppointments: appointments.upcomingCount || 0,
      nextAppointment: appointments.nextAppointment,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Force refresh data for a specific type
   */
  async refreshData(dataType) {
    await this.fetchData(dataType);
  }

  /**
   * Get cached data
   */
  getCachedData(dataType) {
    return this.cache.get(dataType);
  }

  /**
   * Clear cache
   */
  clearCache(dataType = null) {
    if (dataType) {
      this.cache.delete(dataType);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Cleanup all subscriptions and intervals
   */
  cleanup() {
    // Clear all intervals
    this.refreshIntervals.forEach(intervalId => clearInterval(intervalId));
    this.refreshIntervals.clear();
    
    // Clear subscribers
    this.subscribers.clear();
    
    // Clear cache
    this.cache.clear();
  }
}

// Create singleton instance
const realTimeService = new RealTimeService();

export default realTimeService;

// Export hook for easy use in React components
export const useRealTimeData = (dataType, refreshInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleDataUpdate = (newData, updateError) => {
      if (updateError) {
        setError(updateError);
        setLoading(false);
      } else {
        setData(newData);
        setError(null);
        setLoading(false);
      }
    };

    realTimeService.subscribe(dataType, handleDataUpdate, refreshInterval);

    return () => {
      realTimeService.unsubscribe(dataType, handleDataUpdate);
    };
  }, [dataType, refreshInterval]);

  const refresh = () => {
    setLoading(true);
    realTimeService.refreshData(dataType);
  };

  return { data, loading, error, refresh };
};
