// hooks/useTravelRequests.js
import { useState, useCallback } from 'react'
import { travelService } from '../services/travelService'

export const useTravelRequests = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createRequest = useCallback(async (requestData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await travelService.createTravelRequest(requestData)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRequest = useCallback(async (requestId, updates) => {
    setLoading(true)
    setError(null)
    try {
      const result = await travelService.updateRequestStatus(requestId, updates)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createRequest,
    updateRequest
  }
}