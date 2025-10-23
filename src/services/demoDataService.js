// Lightweight demo data provider that mutates over time to simulate "real-time" changes

class DemoDataService {
  constructor() {
    this.now = Date.now();
  }

  tick() {
    this.now = Date.now();
  }

  getDoctors() {
    this.tick();
    const base = [
      { id: 101, firstName: 'Sarah', lastName: 'Johnson', specialty: 'Cardiology', isAvailable: (this.now / 10000) % 2 > 1 },
      { id: 102, firstName: 'Michael', lastName: 'Chen', specialty: 'Dermatology', isAvailable: (this.now / 15000) % 2 > 1 },
      { id: 103, firstName: 'Emily', lastName: 'Rodriguez', specialty: 'Neurology', isAvailable: (this.now / 20000) % 2 > 1 },
    ];
    return base.map(d => ({
      id: d.id,
      user: { firstName: d.firstName, lastName: d.lastName, email: `${d.firstName.toLowerCase()}@demo.local` },
      specialty: d.specialty,
      yearsOfExperience: 10,
      averageRating: 4.5,
      totalReviews: 120,
      clinicAddress: 'MedReserve Demo Clinic',
      isAvailable: !!d.isAvailable,
      consultationFee: 150,
      profileImage: null,
      qualification: 'MD',
      biography: 'Demo doctor biography.'
    }));
  }

  getAppointments() {
    this.tick();
    const t0 = new Date(this.now + 60 * 60 * 1000);
    const t1 = new Date(this.now + 2 * 60 * 60 * 1000);
    return [
      {
        id: 201,
        doctor: { user: { firstName: 'Sarah', lastName: 'Johnson' }, specialty: 'Cardiology', clinicAddress: 'MedReserve Demo Clinic' },
        appointmentDateTime: t0.toISOString(),
        status: 'CONFIRMED',
        appointmentType: 'CONSULTATION',
        chiefComplaint: 'Checkup'
      },
      {
        id: 202,
        doctor: { user: { firstName: 'Michael', lastName: 'Chen' }, specialty: 'Dermatology', clinicAddress: 'MedReserve Demo Clinic' },
        appointmentDateTime: t1.toISOString(),
        status: 'SCHEDULED',
        appointmentType: 'FOLLOW_UP',
        chiefComplaint: 'Rash review'
      }
    ];
  }

  getReports() {
    const d = new Date(this.now - 3 * 24 * 60 * 60 * 1000).toLocaleDateString();
    return [
      { id: 301, title: 'CBC Panel', reportType: 'BLOOD_TEST', createdAt: new Date(this.now - 5 * 86400000).toISOString(), doctorName: 'Dr. Sarah Johnson', status: 'Reviewed', description: 'CBC Results' },
      { id: 302, title: 'Chest X-Ray', reportType: 'X_RAY', createdAt: new Date(this.now - 10 * 86400000).toISOString(), doctorName: 'Dr. Michael Chen', status: 'Reviewed', description: 'X-Ray Chest' },
    ];
  }

  getPrescriptions() {
    const start = new Date(this.now - 10 * 86400000).toISOString();
    const end = new Date(this.now + 20 * 86400000).toISOString();
    return [
      { id: 401, medicationName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', doctor: { user: { firstName: 'Sarah', lastName: 'Johnson' } }, startDate: start, endDate: end, category: 'Cardiovascular', instructions: 'Take with food' }
    ];
  }
}

const demoDataService = new DemoDataService();
export default demoDataService;




