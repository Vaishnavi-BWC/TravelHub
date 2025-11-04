// components/superadmin/reports/ReportsManagement.js
import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import ReportCard from './ReportCard';
import ReportVisualization from './ReportVisualization';
import { FaSearch, FaDownload, FaSync, FaFileExport } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const ReportsManagement = () => {
  const { state, actions } = useSuperAdmin();
  const { reports, loading } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    actions.loadReports({
      page: currentPage,
      search: searchTerm,
      type: reportType !== 'all' ? reportType : undefined
    });
  }, [currentPage, searchTerm, reportType]);

  const filteredReports = reports.filter(report =>
    report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    actions.loadReports({
      page: currentPage,
      search: searchTerm,
      type: reportType !== 'all' ? reportType : undefined
    });
  };

  const handleGenerateReport = async (type) => {
    try {
      await actions.generateReport({ type });
      // Refresh reports list after generation
      await actions.loadReports();
      alert(`${type} report generated successfully!`);
    } catch (error) {
      alert(`Error generating report: ${error.message}`);
    }
  };

  const handleExportAll = async () => {
    try {
      const blob = await actions.exportAllReports();
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-reports-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert(`Error exporting reports: ${error.message}`);
    }
  };

  const reportTypes = ['all', 'financial', 'performance', 'compliance', 'analytics'];

  return (
    <div className={styles.container}>
  <div className={`${styles.card} maincard`}>
      <div className={styles.cardHeader}>
        <h3>Reports & Analytics</h3>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={styles.filterSelect}
          >
            {reportTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <button className={styles.secondaryBtn} onClick={handleRefresh}>
            <FaSync className={styles.btnIcon} />
            Refresh
          </button>

          <button className={styles.primaryBtn} onClick={handleExportAll}>
            <FaFileExport className={styles.btnIcon} />
            Export All
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* Quick Report Generation */}
        <div className={styles.quickActions}>
          <h4>Quick Generate</h4>
          <br></br>
          <br></br>
          <div className={styles.quickActionGrid}>
            <button
              className={styles.secondaryBtn}
              onClick={() => handleGenerateReport('financial')}
            >
              Financial Report
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => handleGenerateReport('performance')}
            >
              Performance Report
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => handleGenerateReport('compliance')}
            >
              Compliance Report
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className={styles.reportsGrid}>
          {loading && reports.length === 0 ? (
            <div className={styles.loading}>Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className={styles.noData}>No reports found</div>
          ) : (
            filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onView={setSelectedReport}
                onDownload={async () => {
                  try {
                    const blob = await actions.downloadReport(report.id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${report.name}-${report.generatedOn}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    alert(`Error downloading report: ${error.message}`);
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>

        {/* Report Visualization Modal */}
        {selectedReport && (
          <ReportVisualization
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </div>
    </div>
    </div>
  );
};

export default ReportsManagement;