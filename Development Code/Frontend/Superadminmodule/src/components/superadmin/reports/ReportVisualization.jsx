import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FaTimes } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const ReportVisualization = ({ report, onClose }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    if (report.type === 'Financial') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={report.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
            <Legend />
            <Bar dataKey="value" name="Expense Amount" fill="#1a4f8c" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={report.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {report.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, 'Value']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className={styles.reportVisualization}>
      <div className={styles.visualizationHeader}>
        <h3>{report.name} - Visualization</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <div className={styles.chartContainer}>
        {renderChart()}
      </div>
      <button className={styles.secondaryBtn} onClick={onClose}>
        Close Visualization
      </button>
    </div>
  );
};

export default ReportVisualization;