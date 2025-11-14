export const getStatusColor = (status) => {
  const colorMap = {
    draft: 'var(--gray)',
    pending: 'var(--warning)',
    approved: 'var(--success)',
    rejected: 'var(--danger)',
    changes_requested: 'var(--warning)',
    escalated: 'var(--info)',
    booked: 'var(--success)'
  }
  
  return colorMap[status] || 'var(--gray)'
}

export const getStatusIcon = (status) => {
  const iconMap = {
    draft: 'fas fa-edit',
    pending: 'fas fa-clock',
    approved: 'fas fa-check-circle',
    rejected: 'fas fa-times-circle',
    changes_requested: 'fas fa-edit',
    escalated: 'fas fa-level-up-alt',
    booked: 'fas fa-check-circle'
  }
  
  return iconMap[status] || 'fas fa-circle'
}