// components/superadmin/reports/ReportCard.js
import React from 'react';
import { FaDownload, FaEye, FaCalendar, FaChartBar } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const ReportCard = ({ report, onView, onDownload }) => {
  const getReportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'financial':
        return <FaChartBar style={{ color: '#00C49F' }} />;
      case 'performance':
        return <FaChartBar style={{ color: '#0088FE' }} />;
      case 'compliance':
        return <FaChartBar style={{ color: '#FF8042' }} />;
      default:
        return <FaChartBar style={{ color: '#8884D8' }} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={styles.reportCard}>
      <div className={styles.reportHeader}>
        <div className={styles.reportIcon}>
          {getReportIcon(report.type)}
        </div>
        <div>
          <h4>{report.name}</h4>
          <span className={`${styles.reportType} ${styles[report.type?.toLowerCase()]}`}>
            {report.type}
          </span>
        </div>
      </div>
      
      <div className={styles.reportInfo}>
        <p>
          <FaCalendar className={styles.infoIcon} />
          <strong>Period:</strong> {report.period}
        </p>
        <p>
          <strong>Generated:</strong> {formatDate(report.generatedOn)}
        </p>
        <p>
          <strong>Downloads:</strong> {report.downloadCount || 0}
        </p>
        {report.size && (
          <p>
            <strong>Size:</strong> {report.size}
          </p>
        )}
      </div>
      
      <div className={styles.reportActions}>
        <button 
          className={styles.secondaryBtn} 
          onClick={onDownload}
          title="Download Report"
        >
          <FaDownload className={styles.btnIcon} />
          Download
        </button>
        <button 
          className={styles.primaryBtn} 
          onClick={() => onView(report)}
          title="View Report Details"
        >
          <FaEye className={styles.btnIcon} />
          View
        </button>
      </div>
    </div>
  );
};

export default ReportCard;