import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ setActiveTab }) => {
  const statsData = [
    { count: 2, label: 'Pending Approvals', icon: 'fas fa-clock', color: 'blue', tab: 'pending-approvals' },
    { count: 1, label: 'Pending Reimbursements', icon: 'fas fa-money-bill-wave', color: 'green', tab: 'reimbursements' },
    { count: 1, label: 'Policy Exceptions', icon: 'fas fa-exclamation-circle', color: 'purple', tab: 'policy-exceptions' },
    { count: 0, label: 'Overdue (>48h)', icon: 'fas fa-exclamation-triangle', color: 'orange', tab: 'pending-approvals' }
  ];

  // Bar chart data
  const barChartData = {
    labels: ['Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Budget',
        data: [160000, 170000, 170000],
        backgroundColor: 'rgba(26, 79, 140, 0.2)',
        borderColor: 'rgba(26, 79, 140, 1)',
        borderWidth: 1
      },
      {
        label: 'Actual',
        data: [140000, 150000, 130000],
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₹' + (context.parsed.y / 1000) + 'K';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <h2 className="section-title">Finance Overview</h2>
      
      <div className="stats-container">
        {statsData.map((stat, index) => (
          <div 
            key={index}
            className="stat-card" 
            onClick={() => setActiveTab(stat.tab)}
          >
            <div className={`stat-icon ${stat.color}`}>
              <i className={stat.icon}></i>
            </div>
            <div className="stat-info">
              <h3>{stat.count}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3>Budget Utilization - Q3 2025</h3>
          <button 
            className="primary-btn" 
            onClick={() => setActiveTab('budget-tracking')}
          >
            <i className="fas fa-chart-line"></i> View Details
          </button>
        </div>
        <div className="card-body">
          <div className="chart-container">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;