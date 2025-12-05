import { describe, it, expect } from 'vitest'

// Simple utility functions to test
const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString()}`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN')
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(500)).toBe('₹500')
      expect(formatCurrency(1500)).toBe('₹1,500')
      expect(formatCurrency(10000)).toBe('₹10,000')
    })

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('₹0')
    })

    it('handles decimal amounts', () => {
      expect(formatCurrency(500.50)).toBe('₹500.5')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2024-01-15'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('handles Date object', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.in')).toBe(true)
      expect(validateEmail('admin@medreserve.com')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test.domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = '1990-01-01'
      const age = calculateAge(birthDate)
      expect(age).toBeGreaterThan(30)
      expect(age).toBeLessThan(40)
    })

    it('handles recent birth dates', () => {
      const lastYear = new Date()
      lastYear.setFullYear(lastYear.getFullYear() - 1)
      const age = calculateAge(lastYear.toISOString())
      expect(age).toBe(1)
    })

    it('handles future birth dates', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const age = calculateAge(futureDate.toISOString())
      expect(age).toBe(-1)
    })
  })
})
