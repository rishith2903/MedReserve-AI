import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'

// Mock useAuth from AuthContext with a mutable global state
const authState = { isAuthenticated: false, isLoading: false, user: null }
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.isAuthenticated = false
    authState.isLoading = false
    authState.user = null
  })

  it('redirects to /login when not authenticated', () => {
    authState.isAuthenticated = false
    render(
      <MemoryRouter initialEntries={['/secure']}>
        <Routes>
          <Route path="/login" element={<div>login-page</div>} />
          <Route path="/secure" element={<ProtectedRoute><div>secure</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('login-page')).toBeInTheDocument()
  })

  it('renders children when authenticated and no role required', () => {
    authState.isAuthenticated = true
    authState.user = { role: 'PATIENT' }
    render(
      <MemoryRouter initialEntries={['/secure']}>
        <Routes>
          <Route path="/secure" element={<ProtectedRoute><div>secure</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('secure')).toBeInTheDocument()
  })

  it('redirects to /not-authorized when role is not allowed', () => {
    authState.isAuthenticated = true
    authState.user = { role: 'PATIENT' }
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/not-authorized" element={<div>no-auth</div>} />
          <Route path="/admin" element={<ProtectedRoute requiredRoles={["ADMIN","MASTER_ADMIN"]}><div>admin</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('no-auth')).toBeInTheDocument()
  })

  it('allows when user has allowed role (object form)', () => {
    authState.isAuthenticated = true
    authState.user = { role: { name: 'ADMIN' } }
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<ProtectedRoute requiredRoles={["ADMIN","MASTER_ADMIN"]}><div>admin</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('admin')).toBeInTheDocument()
  })
})
