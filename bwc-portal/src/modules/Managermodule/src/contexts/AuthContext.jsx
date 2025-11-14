// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken')
    if (token) {
      try {
        // Fetch user profile with token
        const response = await fetch('http://bwc-97.brainwaveconsulting.co.in:8081/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.data || userData)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('jwtToken')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('jwtToken')
      }
    }
    setLoading(false)
  }

  const login = async (credentials) => {
    try {
      const response = await fetch('http://bwc-97.brainwaveconsulting.co.in:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const token = data.token || data.access_token
      
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('jwtToken', token)
        
        // Fetch user profile
        const userResponse = await fetch('http://bwc-97.brainwaveconsulting.co.in:8081/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.data || userData)
          return { success: true }
        }
      }
      
      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('jwtToken')
    setUser(null)
    window.location.href = '/login'
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}