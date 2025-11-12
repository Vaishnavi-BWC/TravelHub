import React, { useState } from "react";
import "./Reports.css";

const Reports = () => {
  const [reportType, setReportType] = useState("Travel Summary");
  const [period, setPeriod] = useState("Last Month");

  const data = {
    totalTickets: 142,
    avgCost: "₹12,450",
    mostVisited: "Bangalore",
    exceptionRate: "8.4%",
    destinations: [
      { destination: "Bangalore", tickets: 38, avgCost: "₹14,200", purpose: "Client Meetings", exceptions: 5 },
      { destination: "Mumbai", tickets: 32, avgCost: "₹11,500", purpose: "Training", exceptions: 3 },
      { destination: "Delhi", tickets: 28, avgCost: "₹13,800", purpose: "Conferences", exceptions: 4 },
      { destination: "Chennai", tickets: 22, avgCost: "₹10,200", purpose: "Vendor Visits", exceptions: 2 },
      { destination: "Hyderabad", tickets: 18, avgCost: "₹9,800", purpose: "Project Work", exceptions: 1 },
    ],
  };

  return (
    <div className="reports">
      {/* Filters */}
      <div className="filters">
        <div className="filter-item">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option>Travel Summary</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>Last Month</option>
          </select>
        </div>
        <button className="btn btn-primary">Generate Report</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>{data.totalTickets}</h3>
          <p>Total Tickets<br />Processed</p>
        </div>
        <div className="card">
          <h3>{data.avgCost}</h3>
          <p>Average Cost<br />Per Ticket</p>
        </div>
        <div className="card highlight">
          <h3>{data.mostVisited}</h3>
          <p>Most Visited<br />Destination</p>
        </div>
        <div className="card">
          <h3>{data.exceptionRate}</h3>
          <p>Exception Rate<br />Of all tickets</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-section">
        <h4>Travel Summary - Last Month</h4>
        <div className="bar-chart">
          {data.destinations.map((d, i) => (
            <div key={i} className="bar">
              <div className="bar-fill" style={{ height: `${d.tickets * 5}px` }}></div>
              <span>{d.destination}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Destination</th>
              <th>Tickets</th>
              <th>Avg. Cost</th>
              <th>Most Common Purpose</th>
              <th>Exception Count</th>
            </tr>
          </thead>
          <tbody>
            {data.destinations.map((d, i) => (
              <tr key={i}>
                <td>{d.destination}</td>
                <td>{d.tickets}</td>
                <td>{d.avgCost}</td>
                <td>{d.purpose}</td>
                <td>{d.exceptions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button className="btn pdf">Export as PDF</button>
        <button className="btn excel">Export as Excel</button>
      </div>
    </div>
  );
};

export default Reports;
