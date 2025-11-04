// components/travel/TravelPolicy/TravelPolicy.js
import React from 'react';
import { travelPolicies } from '../../../data/travelPolicies';
import './TravelPolicy.css';

const TravelPolicy = ({ grade = 'L3' }) => {
  const policy = travelPolicies[grade];

  if (!policy) {
    return null;
  }

  return (
    <div className="info-cardtravelpolicy">
      <div className="info-card-content">
        <div>
          <h3><i className="fas fa-info-circle info-icon"></i>Travel Policy for {grade} Grade</h3>
          <div className="info-list">
            <p><strong>Flight:</strong> {policy.flight}</p>
            <p><strong>Hotel:</strong> {policy.hotel}</p>
            <p><strong>Per Diem:</strong> {policy.perDiem}</p>
            {policy.other && <p><strong>Other:</strong> {policy.other}</p>}
            <p style={{fontWeight:"bold"}}><strong style={{color:"red"}}>Note : </strong>Create your travel request accoding to this policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPolicy;