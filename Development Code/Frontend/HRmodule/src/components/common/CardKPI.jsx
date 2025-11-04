import React from 'react';

const CardKPI = ({ icon, title, value, tone = "blue", onClick }) => (
  <div className="statCard" onClick={onClick}>
    <div className={`statIcon ${tone}`}>
      {icon}
    </div>
    <div className="statInfo">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

export { CardKPI };
export default CardKPI;