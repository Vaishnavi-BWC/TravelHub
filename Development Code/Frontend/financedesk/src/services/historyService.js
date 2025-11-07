// services/historyService.js

const API_BASE = '/travel-desk-proxy/api/finance';

/**
 * Fetch approval history from API
 */
export const fetchApprovalHistory = async () => {
  try {
    const response = await fetch(`${API_BASE}/approvals/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in fetchApprovalHistory:', error);
    throw error;
  }
};

/**
 * Transform API data to match frontend structure
 */
export const transformHistoryData = (apiData) => {
  if (!Array.isArray(apiData)) {
    return [];
  }

  return apiData.map(item => ({
    id: item.travelRequestId,
    actionId: item.actionId,
    workflowId: item.workflowId,
    employee: `${item.employeeName} (${item.travelRequestId.substring(0, 8)})`,
    type: 'Travel Request',
    amount: item.estimatedCost,
    status: mapStatus(item.status),
    approvedDate: formatDate(item.actionTakenAt),
    financeAction: item.comments || 'No comments',
    travelPurpose: item.travelPurpose,
    destination: item.destination || 'Not specified',
    approverRole: item.approverRole,
    action: item.action,
    step: item.step,
    amountApproved: item.amountApproved,
    escalationReason: item.escalationReason,
    originalData: item
  }));
};

/**
 * Map API status to frontend status
 */
const mapStatus = (apiStatus) => {
  switch (apiStatus?.toUpperCase()) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'REIMBURSED':
      return 'reimbursed';
    default:
      return 'processed';
  }
};

/**
 * Format date string to localized date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date string to localized date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get status badge class based on status
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'status-badge approved';
    case 'rejected':
      return 'status-badge rejected';
    case 'reimbursed':
      return 'status-badge reimbursed';
    default:
      return 'status-badge processed';
  }
};

/**
 * Get status text for display
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'reimbursed':
      return 'Reimbursed';
    default:
      return 'Processed';
  }
};

/**
 * Export history data (placeholder for future implementation)
 */
export const exportHistoryData = async (historyData) => {
  console.log('Exporting history data:', historyData);
  // TODO: Implement actual export functionality
  return new Promise((resolve) => {
    setTimeout(() => {
      alert('Export functionality to be implemented');
      resolve();
    }, 500);
  });
};

/**
 * Print request details
 */
export const printRequestDetails = (requestId) => {
  console.log('Printing request:', requestId);
  window.print();
};