// pages/Audit/AuditTrailPage.js
import React from 'react'
import AuditTrail from '../../components/audit/AuditTrail/AuditTrail'
import './AuditTrailPage.css'

const AuditTrailPage = () => {
  return (
    <div className="audit-trail-page">
      <div className="page-header">
        <h2>Audit Trail</h2>
        <p>Complete history of all actions taken in the system</p>
      </div>

      <AuditTrail />
    </div>
  )
}

export default AuditTrailPage