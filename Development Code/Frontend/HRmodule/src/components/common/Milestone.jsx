
import React from 'react';

const Milestone = ({ title, subtitle, desc, state = "idle" }) => {
  const bubble = state === "completed" ? "completed" : state === "active" ? "active" : "idle";
  return (
    <div className="milestone">
      <div className={`milestoneBubble ${bubble}`}></div>
      <h4>{title}</h4>
      <p className="milestoneSubtitle">{subtitle}</p>
      <p className="milestoneDesc">{desc}</p>
      <div className="milestoneLine" />
    </div>
  );
};

export { Milestone };
export default Milestone;