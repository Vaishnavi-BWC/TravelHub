// components/superadmin/dashboard/FinancialChart.js
import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import styles from '../superadmin.module.css';

const FinancialChart = () => {
  const { state, actions } = useSuperAdmin();
  const { financialData, loading, error } = state;

  useEffect(() => {
    // This component should use the financialData that's already loaded by DashboardStats
    // No need to load separately if it's already in the context
  }, []);

  // Safe data handling
  const chartData = Array.isArray(financialData) ? financialData : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.errorMessage}>
            <h3>Unable to load financial data</h3>
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
          <div className={styles.loading}>Loading financial data...</div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.noData}>No financial data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>Expense Distribution</h3>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;