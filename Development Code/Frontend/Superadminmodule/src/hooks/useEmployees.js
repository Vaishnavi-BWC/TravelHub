// hooks/useEmployees.js - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { EmployeeService } from '../services/EmployeeService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 5
  });

  const mapEmployeeData = useCallback((apiEmployee) => {
    console.log('🔍 [mapEmployeeData] Raw employee data:', {
      employeeId: apiEmployee.employeeId,
      fullName: apiEmployee.fullName,
      active: apiEmployee.active,
      activeType: typeof apiEmployee.active
    });

    // Use the actual API data - check both active status and status field
    let status = 'inactive';
    if (apiEmployee.active === true) {
      status = 'active';
    } else if (apiEmployee.status === 'active' || apiEmployee.status === 'activated') {
      status = 'active';
    } else if (apiEmployee.status === 'inactive' || apiEmployee.status === 'deactivated') {
      status = 'inactive';
    }

    console.log('🔍 [mapEmployeeData] Mapped status:', status);

    return {
      user_id: apiEmployee.employeeId || apiEmployee.user_id || apiEmployee.id,
      id: apiEmployee.employeeId || apiEmployee.user_id || apiEmployee.id,
      first_name: apiEmployee.first_name || (apiEmployee.fullName ? apiEmployee.fullName.split(' ')[0] : ''),
      last_name: apiEmployee.last_name || (apiEmployee.fullName ? apiEmployee.fullName.split(' ').slice(1).join(' ') : ''),
      fullName: apiEmployee.fullName || `${apiEmployee.first_name || ''} ${apiEmployee.last_name || ''}`.trim(),
      email: apiEmployee.email || '',
      phone_number: apiEmployee.phoneNumber || apiEmployee.phone_number || '',
      employee_code: apiEmployee.employee_code || apiEmployee.employeeCode || `EMP-${(apiEmployee.employeeId || '').slice(-6)}`,
      department: apiEmployee.department || '',
      designation: apiEmployee.designation || apiEmployee.jobTitle || '',
      grade: apiEmployee.level || '',
      status: status,
      _original: apiEmployee
    };
  }, []);

  // Load paginated employees
  const loadEmployees = useCallback(async (page = 0, size = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [loadEmployees] Loading fresh data from API...');
      
      const response = await EmployeeService.getAllEmployees(page, size);
      
      let employeesData = [];
      let totalElements = 0;
      
      if (response.employees && Array.isArray(response.employees)) {
        employeesData = response.employees;
        totalElements = response.pagination?.totalElements || employeesData.length;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        employeesData = response.data.content;
        totalElements = response.data.totalElements || employeesData.length;
      } else if (response.content && Array.isArray(response.content)) {
        employeesData = response.content;
        totalElements = response.totalElements || employeesData.length;
      } else if (Array.isArray(response.data)) {
        employeesData = response.data;
        totalElements = employeesData.length;
      } else if (Array.isArray(response)) {
        employeesData = response;
        totalElements = employeesData.length;
      }

      console.log('🔍 [loadEmployees] Raw employees from API:', employeesData);
      
      const mappedEmployees = employeesData.map(mapEmployeeData);
      
      console.log('🔍 [loadEmployees] Mapped employees with status:', mappedEmployees);
      
      const newPagination = {
        currentPage: page,
        pageSize: size,
        totalElements: totalElements,
        totalPages: response.pagination?.totalPages || Math.ceil(totalElements / size)
      };
      
      setEmployees(mappedEmployees);
      setTotalEmployees(totalElements);
      setPagination(newPagination);
      
      return mappedEmployees;
      
    } catch (err) {
      console.error('Error loading paginated employees:', err);
      setError(err.message);
      setEmployees([]);
      setTotalEmployees(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mapEmployeeData]);

  // FIXED: Deactivate employee - Use the returned data to update immediately
  const deactivateEmployee = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [deactivateEmployee] Calling API for employee:', employeeId);
      const result = await EmployeeService.deactivateEmployee(employeeId);
      console.log('✅ [deactivateEmployee] API call successful:', result);
      
      // Check if the API returned the updated employee data
      if (result && result.employeeId) {
        console.log('🔄 [deactivateEmployee] Using returned employee data to update immediately');
        const mappedEmployee = mapEmployeeData(result);
        
        // Update the employee in the local state immediately
        setEmployees(prev => prev.map(emp => 
          emp.user_id === employeeId ? mappedEmployee : emp
        ));
        
        console.log('✅ [deactivateEmployee] Local state updated with:', mappedEmployee);
      } else {
        // If no employee data returned, reload from API
        console.log('🔄 [deactivateEmployee] No employee data returned, reloading from API');
        await loadEmployees(pagination.currentPage, pagination.pageSize);
      }
      
      return result;
      
    } catch (err) {
      console.error('❌ [deactivateEmployee] Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEmployees, pagination.currentPage, pagination.pageSize, mapEmployeeData]);

  // FIXED: Activate employee - Use the returned data to update immediately
  const activateEmployee = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [activateEmployee] Calling API for employee:', employeeId);
      const result = await EmployeeService.activateEmployee(employeeId);
      console.log('✅ [activateEmployee] API call successful:', result);
      
      // Check if the API returned the updated employee data
      if (result && result.employeeId) {
        console.log('🔄 [activateEmployee] Using returned employee data to update immediately');
        const mappedEmployee = mapEmployeeData(result);
        
        // Update the employee in the local state immediately
        setEmployees(prev => prev.map(emp => 
          emp.user_id === employeeId ? mappedEmployee : emp
        ));
        
        console.log('✅ [activateEmployee] Local state updated with:', mappedEmployee);
      } else {
        // If no employee data returned, reload from API
        console.log('🔄 [activateEmployee] No employee data returned, reloading from API');
        await loadEmployees(pagination.currentPage, pagination.pageSize);
      }
      
      return result;
      
    } catch (err) {
      console.error('❌ [activateEmployee] Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEmployees, pagination.currentPage, pagination.pageSize, mapEmployeeData]);

  // ... other methods remain the same ...

  // Load all employees for dashboard
  const loadAllEmployeesForDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      
      const response = await EmployeeService.getAllEmployees(0, 1000);
      
      let allEmployeesData = [];
      
      if (response.employees && Array.isArray(response.employees)) {
        allEmployeesData = response.employees;
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        allEmployeesData = response.data.content;
      } else if (response.content && Array.isArray(response.content)) {
        allEmployeesData = response.content;
      } else if (Array.isArray(response.data)) {
        allEmployeesData = response.data;
      } else if (Array.isArray(response)) {
        allEmployeesData = response;
      }
      
      const mappedAllEmployees = allEmployeesData.map(mapEmployeeData);
      setAllEmployees(mappedAllEmployees);
      
      return mappedAllEmployees;
    } catch (err) {
      console.error('Error loading all employees for dashboard:', err);
      return [];
    } finally {
      setDashboardLoading(false);
    }
  }, [mapEmployeeData]);

  const getActiveEmployeesCount = useCallback(() => {
    return allEmployees.filter(emp => emp.status === 'active').length;
  }, [allEmployees]);

  const updateEmployee = useCallback(async (employeeId, employeeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedEmployee = await EmployeeService.updateEmployee(employeeId, employeeData);
      const mappedEmployee = mapEmployeeData(updatedEmployee);
      
      setEmployees(prev => prev.map(emp => 
        emp.user_id === employeeId ? mappedEmployee : emp
      ));
      
      return mappedEmployee;
      
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mapEmployeeData]);

  const createEmployee = useCallback(async (employeeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newEmployee = await EmployeeService.createEmployee(employeeData);
      const mappedEmployee = mapEmployeeData(newEmployee);
      
      await loadEmployees(pagination.currentPage, pagination.pageSize);
      
      return mappedEmployee;
      
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEmployees, pagination, mapEmployeeData]);

  // Pagination functions
  const goToPage = useCallback((pageNumber) => {
    if (pageNumber >= 0 && pageNumber < pagination.totalPages) {
      loadEmployees(pageNumber, pagination.pageSize);
    }
  }, [pagination.totalPages, pagination.pageSize, loadEmployees]);

  const goToNextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages - 1) {
      loadEmployees(pagination.currentPage + 1, pagination.pageSize);
    }
  }, [pagination.currentPage, pagination.totalPages, pagination.pageSize, loadEmployees]);

  const goToPrevPage = useCallback(() => {
    if (pagination.currentPage > 0) {
      loadEmployees(pagination.currentPage - 1, pagination.pageSize);
    }
  }, [pagination.currentPage, pagination.pageSize, loadEmployees]);

  const changePageSize = useCallback((newSize) => {
    loadEmployees(0, newSize);
  }, [loadEmployees]);

  const getEmployeeById = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      const employee = await EmployeeService.getEmployeeById(employeeId);
      return mapEmployeeData(employee);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mapEmployeeData]);

  // Initialize with first page load
  useEffect(() => {
    if (employees.length === 0 && !loading) {
      loadEmployees(0, 5);
    }
  }, []);

  return {
    // State
    employees,
    allEmployees,
    totalEmployees,
    loading,
    dashboardLoading,
    error,
    pagination,
    
    // Computed values
    activeEmployeesCount: getActiveEmployeesCount(),
    
    // CRUD Operations
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deactivateEmployee,
    activateEmployee,
    
    // Data loading
    loadEmployees,
    loadAllEmployeesForDashboard,
    
    // Pagination actions
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,
  };
};

export default useEmployees;