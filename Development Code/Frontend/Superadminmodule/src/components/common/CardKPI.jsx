import React from 'react';
import styles from '.././superadmin/styles/CardKPI.module.css';

const CardKPI = ({ icon, title, value, tone = "blue", onClick }) => (
  <div className={styles.statCard} onClick={onClick}>
    <div className={`${styles.statIcon} ${styles[tone]}`}>
      {icon}
    </div>
    <div className={styles.statInfo}>
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

export default CardKPI;