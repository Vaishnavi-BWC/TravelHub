import React from 'react';

const Badge = ({ variant = "pending", children }) => {
  const classes = {
    pending: "pending",
    approved: "approved",
    rejected: "rejected",
    booked: "booked",
    completed: "completed",
    draft: "draft",
    active: "active",
    inactive: "inactive",
    suspended: "suspended",
  }[variant];

  return <span className={`status ${classes}`}>{children}</span>;
};

// Named export
export { Badge };
// Default export
export default Badge;