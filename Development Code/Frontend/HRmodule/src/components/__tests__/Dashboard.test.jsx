import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test-utils'
import Dashboard from '../dashboard/Dashboard'

describe('Dashboard', () => {
  it('renders dashboard without crashing', () => {
    renderWithProviders(<Dashboard />)

    expect(screen.getByText('Total Employees')).toBeInTheDocument()
  })
})






