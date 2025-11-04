import React from 'react';
import Badge from '../common/Badge';

const EmployeeCard = ({ employee, onView, onEdit, onDelete }) => {
  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <img 
          src={employee.profile_image_url || `https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=0D8ABC&color=fff`} 
          alt={`${employee.first_name} ${employee.last_name}`}
          className="employee-avatar"
        />
        <div className="employee-basic-info">
          <h4>{employee.first_name} {employee.last_name}</h4>
          <p>{employee.designation}</p>
          <Badge variant={employee.status}>
            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="employee-card-details">
        <div className="detail-row">
          <span className="label">Employee ID:</span>
          <span className="value">{employee.employee_code}</span>
        </div>
        <div className="detail-row">
          <span className="label">Department:</span>
          <span className="value">{employee.department}</span>
        </div>
        <div className="detail-row">
          <span className="label">Email:</span>
          <span className="value">{employee.email}</span>
        </div>
        <div className="detail-row">
          <span className="label">Grade:</span>
          <span className="value">{employee.grade}</span>
        </div>
      </div>
      
      <div className="employee-card-actions">
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => onView(employee.user_id)}
          title="View Details"
        >
          <i className="fas fa-eye"></i>
        </button>
        <button 
          className="btn btn-sm btn-secondary"
          onClick={() => onEdit(employee)}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button 
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(employee.user_id)}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;