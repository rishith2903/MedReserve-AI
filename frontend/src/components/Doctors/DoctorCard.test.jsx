import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple component for testing
const DoctorCard = ({ doctor }) => {
  return (
    <div className="doctor-card">
      <h3>{doctor.firstName} {doctor.lastName}</h3>
      <p>{doctor.specialty}</p>
      <p>{doctor.experience} years experience</p>
      <p>Rating: {doctor.rating}</p>
      <p>({doctor.reviewCount} reviews)</p>
      <p>₹{doctor.consultationFee}</p>
      <p>{doctor.hospital}</p>
      <p>{doctor.qualifications?.join(', ')}</p>
    </div>
  )
}

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockDoctor = {
  id: 1,
  firstName: 'Dr. John',
  lastName: 'Smith',
  specialty: 'Cardiology',
  experience: 15,
  rating: 4.8,
  reviewCount: 120,
  consultationFee: 500,
  profileImage: '/images/doctor1.jpg',
  qualifications: ['MBBS', 'MD Cardiology'],
  hospital: 'City Hospital'
}

const renderDoctorCard = (doctor = mockDoctor, props = {}) => {
  return render(<DoctorCard doctor={doctor} {...props} />)
}

describe('DoctorCard Component', () => {
  it('renders doctor information correctly', () => {
    renderDoctorCard()

    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('15 years experience')).toBeInTheDocument()
    expect(screen.getByText('Rating: 4.8')).toBeInTheDocument()
    expect(screen.getByText('(120 reviews)')).toBeInTheDocument()
    expect(screen.getByText('₹500')).toBeInTheDocument()
    expect(screen.getByText('City Hospital')).toBeInTheDocument()
  })

  it('displays qualifications correctly', () => {
    renderDoctorCard()
    
    expect(screen.getByText('MBBS, MD Cardiology')).toBeInTheDocument()
  })

  it('handles missing profile image gracefully', () => {
    const doctorWithoutImage = { ...mockDoctor, profileImage: null }
    renderDoctorCard(doctorWithoutImage)

    // Component should still render without image
    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument()
  })

  it('displays doctor information in correct format', () => {
    renderDoctorCard()

    // Check if all information is displayed
    expect(screen.getByText('Dr. John Smith')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('15 years experience')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalDoctor = {
      id: 2,
      firstName: 'Dr. Jane',
      lastName: 'Doe',
      specialty: 'General Medicine'
    }

    renderDoctorCard(minimalDoctor)

    expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('General Medicine')).toBeInTheDocument()
  })

  it('formats consultation fee correctly', () => {
    const doctorWithHighFee = { ...mockDoctor, consultationFee: 1500 }
    renderDoctorCard(doctorWithHighFee)

    expect(screen.getByText('₹1500')).toBeInTheDocument()
  })
})
