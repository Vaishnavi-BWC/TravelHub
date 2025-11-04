// contexts/AppContext.js
import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user] = useState({
    name: 'Manager User',
    id: 'M12345',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Manager+User&background=0D8ABC&color=fff'
  })

  const value = {
    sidebarOpen,
    setSidebarOpen,
    user
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}