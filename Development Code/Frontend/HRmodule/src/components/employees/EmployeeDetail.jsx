// components/employees/EmployeeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import { useEmployees } from '../../hooks/useEmployees';
import { LoadingSpinner } from '../common/LoadingSpinner';

const EmployeeDetail = ({ onEdit, onBack }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { getEmployeeById, loading, error } = useEmployees();

  const [employee, setEmployee] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (employeeId) {
        try {
          setDetailLoading(true);
          const employeeData = await getEmployeeById(employeeId);
          console.log('📊 Full employee data:', employeeData);
          console.log('🔍 employee._original.roles:', employeeData._original?.roles);
          console.log('🔍 employee._original.projects:', employeeData._original?.projects);
          setEmployee(employeeData);
        } catch (err) {
          console.error('Error fetching employee:', err);
        } finally {
          setDetailLoading(false);
        }
      }
    };

    fetchEmployee();
  }, [employeeId, getEmployeeById]);

  const handleEdit = () => {
    if (employee) {
      console.log('🔍 Employee data for editing:', employee);
      
      if (onEdit) {
        onEdit(employee);
      } else {
        const empId = employee.user_id || employee.id;
        if (empId) {
          navigate(`/employees/${empId}/edit`);
        }
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/employees');
    }
  };

  if (detailLoading) {
    return (
      <div className="content">
        <LoadingSpinner text="Loading employee details..." />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="content">
        <div className="errorMessage">
          <i className="fas fa-exclamation-circle"></i>
          {error || 'Employee not found'}
        </div>
        <button onClick={handleBack} className="btn btnSecondary">
          Back to List
        </button>
      </div>
    );
  }

  // Extract data from the correct locations
  const originalData = employee._original || {};
  const mainData = employee;
  
  console.log('🎯 Original data roles:', originalData.roles);
  console.log('🎯 Original data projects:', originalData.projects);

  // Extract projects
  let projects = [];
  let projectNames = [];
  
  if (originalData.projects) {
    projects = originalData.projects;
  }

  // Extract project names
  if (projects && projects.length > 0) {
    projectNames = projects.map(project => 
      project.projectName || project.name || `Project ${project.projectId || project.id}`
    );
  }

  // Extract and format roles - NOW FROM employee._original.roles
  let roleDisplayNames = [];
  
  if (originalData.roles && originalData.roles.length > 0) {
    console.log('🎯 Raw roles from _original:', originalData.roles);
    roleDisplayNames = originalData.roles.map(role => {
      // Convert "FINANCE" to "Finance", "MANAGER" to "Manager", etc.
      if (typeof role === 'string') {
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
      }
      return role;
    });
    console.log('🎯 Formatted roles:', roleDisplayNames);
  }

  return (
    <div className="content">
      <div className="detailHeader">
        <h2>Employee Details</h2>
      </div>

      <div className="card">
        <div className="cardHeaderFlex">
          <div>
            <h3>{mainData.fullName || `${mainData.first_name} ${mainData.last_name}`}</h3>
            <p>Employee ID: {mainData.employee_code || originalData.employeeId}</p>
            <p>Department: {mainData.department || originalData.department}</p>
          </div>
          <div>
            <Badge variant={mainData.status || (originalData.active ? 'active' : 'inactive')}>
              {mainData.status ? mainData.status.charAt(0).toUpperCase() + mainData.status.slice(1) : (originalData.active ? 'Active' : 'Inactive')}
            </Badge>
          </div>
        </div>

        <div className="cardBodyGrid">
          <div>
            <h4>Personal Information</h4>
            <div className="detailList">
              <div className="detailItem">
                <span>Full Name:</span>
                <span>{mainData.fullName || `${mainData.first_name} ${mainData.last_name}` || 'N/A'}</span>
              </div>
              <div className="detailItem">
                <span>Email:</span>
                <span>{mainData.email || originalData.email || 'N/A'}</span>
              </div>
              <div className="detailItem">
                <span>Phone:</span>
                <span>{mainData.phone_number || originalData.phoneNumber || 'N/A'}</span>
              </div>
              <div className="detailItem">
                <span>Manager Name:</span>
                <span>{originalData.managerName || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div>
            <h4>Employment Details</h4>
            <div className="detailList">
              <div className="detailItem">
                <span>Department:</span>
                <span>{mainData.department || originalData.department || 'N/A'}</span>
              </div>
              <div className="detailItem">
                <span>Level:</span>
                <span>{mainData.grade || originalData.level || 'N/A'}</span>
              </div>
              <div className="detailItem">
                <span>Employee Code:</span>
                <span>{mainData.employee_code || originalData.employeeId || 'N/A'}</span>
              </div>
              <div className="detailItem">
                <span>Status:</span>
                <span>{mainData.status ? mainData.status.charAt(0).toUpperCase() + mainData.status.slice(1) : (originalData.active ? 'Active' : 'Inactive')}</span>
              </div>
              <div className="detailItem">
                <span>Projects:</span>
                <span>
                  {projectNames.length > 0 
                    ? projectNames.join(', ')
                    : originalData.projectIds && originalData.projectIds.length > 0 
                    ? `Project IDs: ${originalData.projectIds.join(', ')}`
                    : 'No projects assigned'
                  }
                </span>
              </div>
              <div className="detailItem">
                <span>Roles:</span>
                <span>
                  {roleDisplayNames.length > 0 
                    ? roleDisplayNames.join(', ')
                    : originalData.roles && originalData.roles.length > 0 
                    ? originalData.roles.join(', ')
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="formActions">
        <button onClick={handleBack} className="btn btnSecondary">
          Back to List
        </button>
        <button
          onClick={handleEdit}
          className="btn btnPrimary"
          disabled={!mainData.user_id}
        >
          <i className="fas fa-edit"></i> Edit Employee
        </button>
      </div>
    </div>
  );
};

export { EmployeeDetail };
export default EmployeeDetail;