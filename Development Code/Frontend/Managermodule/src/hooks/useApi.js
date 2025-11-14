// hooks/useApi.js
import { useState, useCallback } from 'react'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = useCallback(async (apiCall, successCallback, errorCallback) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall()
      successCallback?.(result)
      return result
    } catch (err) {
      setError(err.message)
      errorCallback?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    callApi
  }
}