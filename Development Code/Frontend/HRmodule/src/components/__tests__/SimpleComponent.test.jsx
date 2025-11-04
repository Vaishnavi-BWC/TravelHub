import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Test a simple component without routing dependencies
describe('Simple Components', () => {
  it('renders a button component', () => {
    const Button = ({ children }) => <button>{children}</button>
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders a header component', () => {
    const Header = ({ title }) => <h1>{title}</h1>
    render(<Header title="HR Dashboard" />)
    expect(screen.getByText('HR Dashboard')).toBeInTheDocument()
  })
})