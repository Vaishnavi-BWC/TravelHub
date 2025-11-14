import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Use a specific, unique text that exists only once
    expect(screen.getByText('HR Management System')).toBeInTheDocument()
  })
})