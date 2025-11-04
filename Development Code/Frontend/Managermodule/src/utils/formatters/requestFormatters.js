import { formatDate } from '../helpers/dateHelpers'

export const formatRequestForDisplay = (request) => {
  return {
    ...request,
    displayDates: request.dates || `${formatDate(request.startDate)} - ${formatDate(request.endDate)}`,
    displayStatus: formatStatus(request.status),
    displayStage: request.stage || getStageFromStatus(request.status)
  }
}

export const formatStatus = (status) => {
  const statusMap = {
    draft: 'Draft',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    changes_requested: 'Changes Requested',
    escalated: 'Escalated',
    booked: 'Booked'
  }
  
  return statusMap[status] || status
}

export const getStageFromStatus = (status) => {
  const stageMap = {
    draft: 'Draft',
    pending: 'Manager Approval',
    approved: 'Finance Approval',
    rejected: 'Rejected',
    changes_requested: 'Manager Requested Changes',
    escalated: 'Escalated to Higher Authority',
    booked: 'Completed'
  }
  
  return stageMap[status] || 'Unknown'
}