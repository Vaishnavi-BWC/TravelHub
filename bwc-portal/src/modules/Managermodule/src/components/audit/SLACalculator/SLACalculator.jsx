// components/common/SLACalculator/SLACalculator.js
import React from 'react'
import { calculateSLA } from '../../../utils/helpers/calculationHelpers'
import './SLACalculator.css'

const SLACalculator = ({ createdAt }) => {
  const slaStatus = calculateSLA(createdAt)

  return (
    <div className="sla-calculator">
      {slaStatus}
    </div>
  )
}

export default SLACalculator