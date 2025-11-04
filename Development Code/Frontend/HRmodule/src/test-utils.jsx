// test-utils.jsx
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext' // Adjust path as needed

// Re-export everything from testing-library
export * from '@testing-library/react'

// Custom render with all providers
export const renderWithProviders = (ui, options = {}) => {
  const AllProviders = ({ children }) => (
    <AppProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AppProvider>
  )

  return render(ui, { wrapper: AllProviders, ...options })
}