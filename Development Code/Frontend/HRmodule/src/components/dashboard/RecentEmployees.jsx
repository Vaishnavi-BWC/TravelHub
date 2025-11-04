import React from 'react';
import { Badge } from '../common/Badge';
//probd receives //employees data of array onview and remaining are function
const RecentEmployees = ({ employees, onViewAll, onAddEmployee, onEmployeeSelect }) => {
 const recentEmployees = employees.slice(-2).reverse();

  return (
    <div className="card">
      <div className="cardHeader">
        <h3>Recent Employees</h3>
        <button className="btn btnPrimary" onClick={onAddEmployee}>
          <i className="fas fa-plus"></i> Add Employee
          {/* call go to the handleaddemployee in dahbaord" */}
        </button>
      </div>
      <div className="cardBody">
        {recentEmployees.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map((emp) => (
                <tr 
                  key={emp.user_id}
                  className="clickableRow"
                  onClick={() => onEmployeeSelect && onEmployeeSelect(emp.user_id)}
                >
                  <td>{emp.employee_code}</td>
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>
                    <Badge variant={emp.status}>
                      {emp.status?.charAt(0).toUpperCase() + emp.status?.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No employees found.</p>
        )}
      
      </div>
    </div>
  );
};

export { RecentEmployees };
export default RecentEmployees;