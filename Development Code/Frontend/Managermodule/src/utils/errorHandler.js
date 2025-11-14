// utils/errorHandler.js
export const handleApiError = async (error) => {
  console.error('API Error:', error)

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status
    
    switch (status) {
      case 401:
        // Unauthorized - clear tokens and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('jwtToken')
        window.location.href = '/login'
        throw new Error('Session expired. Please login again.')
      
      case 403:
        throw new Error('Access denied. You do not have permission to perform this action.')
      
      case 404:
        throw new Error('Resource not found.')
      
      case 500:
        throw new Error('Server error. Please try again later.')
      
      default:
        throw new Error(`Request failed with status ${status}`)
    }
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('Network error. Please check your connection and try again.')
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An unexpected error occurred.')
  }
}