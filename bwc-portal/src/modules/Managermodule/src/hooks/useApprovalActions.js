import { useState, useCallback } from 'react'
import { travelService } from '../services/travelService'
import { auditService } from '../services/auditService'

export const useApprovalActions = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const approveRequest = useCallback(async (requestId, remark) => {
    setLoading(true)
    setError(null)
    try {
      const updates = {
        status: 'approved',
        approverRemark: remark,
        action: 'approved'
      }
      const result = await travelService.updateTeamRequest(requestId, updates)
      
      // Log audit trail
      await auditService.logAction({
        requestId,
        action: 'APPROVED',
        remark,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const rejectRequest = useCallback(async (requestId, remark) => {
    setLoading(true)
    setError(null)
    try {
      const updates = {
        status: 'rejected',
        approverRemark: remark,
        action: 'rejected'
      }
      const result = await travelService.updateTeamRequest(requestId, updates)
      
      await auditService.logAction({
        requestId,
        action: 'REJECTED',
        remark,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const requestChanges = useCallback(async (requestId, remark) => {
    setLoading(true)
    setError(null)
    try {
      const updates = {
        status: 'changes_requested',
        approverRemark: remark,
        action: 'changes_requested'
      }
      const result = await travelService.updateTeamRequest(requestId, updates)
      
      await auditService.logAction({
        requestId,
        action: 'CHANGES_REQUESTED',
        remark,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const escalateRequest = useCallback(async (requestId, remark) => {
    setLoading(true)
    setError(null)
    try {
      const updates = {
        status: 'escalated',
        approverRemark: remark,
        action: 'escalated'
      }
      const result = await travelService.updateTeamRequest(requestId, updates)
      
      await auditService.logAction({
        requestId,
        action: 'ESCALATED',
        remark,
        timestamp: new Date().toISOString()
      })
      
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
    approveRequest,
    rejectRequest,
    requestChanges,
    escalateRequest
  }
}