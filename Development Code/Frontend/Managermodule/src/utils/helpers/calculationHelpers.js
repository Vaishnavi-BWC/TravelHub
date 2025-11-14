// utils/helpers/calculationHelpers.js
export const calculateSLA = (createdAt) => {
  if (!createdAt) return 'N/A';
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `Within SLA (${24 - diffHours}h remaining)`;
  } else if (diffHours < 48) {
    return `Approaching SLA (${48 - diffHours}h remaining)`;
  } else {
    return 'SLA Breached';
  }
};