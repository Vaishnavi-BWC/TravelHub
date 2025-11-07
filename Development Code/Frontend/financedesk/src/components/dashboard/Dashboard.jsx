import React, { useState, useEffect } from 'react';
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
  const [statsData, setStatsData] = useState([
    { count: 0, label: 'Pending Approvals', icon: 'fas fa-clock', color: 'blue', tab: 'pending-approvals' },
    { count: 0, label: 'Pending Reimbursements', icon: 'fas fa-money-bill-wave', color: 'green', tab: 'reimbursements' },
    { count: 0, label: 'Policy Exceptions', icon: 'fas fa-exclamation-circle', color: 'purple', tab: 'policy-exceptions' },
    { count: 0, label: 'Overdue (>48h)', icon: 'fas fa-exclamation-triangle', color: 'orange', tab: 'pending-approvals' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending approvals count
      const pendingResponse = await fetch('/travel-desk-proxy/api/finance/approvals/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      if (!pendingResponse.ok) {
        throw new Error(`Failed to fetch pending approvals: ${pendingResponse.status}`);
      }

      const pendingData = await pendingResponse.json();
      console.log('📊 Pending approvals data:', pendingData);

      // Calculate overdue requests (>48 hours)
      const overdueCount = calculateOverdueCount(pendingData);

      // Fetch reimbursement data (you might need to adjust this endpoint)
      const reimbursementResponse = await fetch('/travel-desk-proxy/api/finance/reimbursements/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });

      let reimbursementCount = 0;
      if (reimbursementResponse.ok) {
        const reimbursementData = await reimbursementResponse.json();
        reimbursementCount = Array.isArray(reimbursementData) ? reimbursementData.length : 0;
      }

      // Calculate policy exceptions (requests with special handling)
      const policyExceptionsCount = calculatePolicyExceptions(pendingData);

      // Update stats data with real counts
      setStatsData([
        { 
          count: Array.isArray(pendingData) ? pendingData.length : 0, 
          label: 'Pending Approvals', 
          icon: 'fas fa-clock', 
          color: 'blue', 
          tab: 'pending-approvals' 
        },
        { 
          count: reimbursementCount, 
          label: 'Pending Reimbursements', 
          icon: 'fas fa-money-bill-wave', 
          color: 'green', 
          tab: 'reimbursements' 
        },
        { 
          count: policyExceptionsCount, 
          label: 'Policy Exceptions', 
          icon: 'fas fa-exclamation-circle', 
          color: 'purple', 
          tab: 'policy-exceptions' 
        },
        { 
          count: overdueCount, 
          label: 'Overdue (>48h)', 
          icon: 'fas fa-exclamation-triangle', 
          color: 'orange', 
          tab: 'pending-approvals' 
        }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverdueCount = (pendingData) => {
    if (!Array.isArray(pendingData)) return 0;
    
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
    
    return pendingData.filter(request => {
      if (!request.createdAt && !request.submittedAt) return false;
      
      const requestDate = new Date(request.createdAt || request.submittedAt);
      return requestDate < fortyEightHoursAgo;
    }).length;
  };

  const calculatePolicyExceptions = (pendingData) => {
    if (!Array.isArray(pendingData)) return 0;
    
    // Count requests that might need special attention
    // You can adjust these criteria based on your business rules
    return pendingData.filter(request => {
      const highAmount = request.estimatedCost > 50000; // High value requests
      const internationalTravel = request.destination && 
                                 request.destination.toLowerCase().includes('international');
      const urgentPriority = request.priority === 'HIGH' || request.priority === 'URGENT';
      
      return highAmount || internationalTravel || urgentPriority;
    }).length;
  };

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

  if (loading) {
    return (
      <div className="dashboard">
        <h2 className="section-title">Finance Overview</h2>
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h2 className="section-title">Finance Overview</h2>
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardStats}>
            <i className="fas fa-sync"></i> Retry
          </button>
        </div>
      </div>
    );
  }

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