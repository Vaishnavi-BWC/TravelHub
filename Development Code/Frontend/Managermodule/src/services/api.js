// services/apiService.js
const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8090'

export const apiService = {
  async get(url, options = {}) {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
      credentials: 'include',
      ...options
    })

    return handleResponse(response)
  },

  async post(url, data, options = {}) {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
      ...options
    })

    return handleResponse(response)
  },

  async put(url, data, options = {}) {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      credentials: 'include',
      ...options
    })

    return handleResponse(response)
  },

  async delete(url, options = {}) {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      ...options
    })

    return handleResponse(response)
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Ignore parsing errors
    }
    
    throw new Error(errorMessage)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  
  return response.text()
}