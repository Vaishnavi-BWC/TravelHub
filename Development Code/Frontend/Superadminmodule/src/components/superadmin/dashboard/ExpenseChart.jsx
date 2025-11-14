// components/superadmin/dashboard/ExpenseChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import styles from '../superadmin.module.css';

const ExpenseChart = () => {
  const { state } = useSuperAdmin();
  const { financialData, loading, error } = state;

  // Safe data handling
  const chartData = Array.isArray(financialData) ? financialData : [];

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.errorMessage}>
            <h3>Unable to load expense data</h3>
            <p>Please make sure the backend server is running.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && chartData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.loading}>Loading expense data...</div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.noData}>No expense data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>Monthly Financial Report</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
              <Bar dataKey="value" name="Expense Amount" fill="#1a4f8c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;