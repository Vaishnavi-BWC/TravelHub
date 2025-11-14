// contexts/AppContext.js
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useApprovals } from '../hooks/useApprovals';

const AppContext = createContext();

const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_DASHBOARD_LOADING: 'SET_DASHBOARD_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_SELECTED_EMPLOYEE: 'SET_SELECTED_EMPLOYEE',
  SET_SELECTED_REQUEST: 'SET_SELECTED_REQUEST',
  SET_SELECTED_EXCEPTION: 'SET_SELECTED_EXCEPTION',
  SET_SELECTED_REIMBURSEMENT: 'SET_SELECTED_REIMBURSEMENT',
  UPDATE_EMPLOYEES: 'UPDATE_EMPLOYEES',
  UPDATE_ALL_EMPLOYEES: 'UPDATE_ALL_EMPLOYEES',
  UPDATE_TOTAL_EMPLOYEES: 'UPDATE_TOTAL_EMPLOYEES',
  UPDATE_APPROVALS: 'UPDATE_APPROVALS',
  UPDATE_EXCEPTIONS: 'UPDATE_EXCEPTIONS',
  UPDATE_REIMBURSEMENTS: 'UPDATE_REIMBURSEMENTS',
  UPDATE_AUDIT_TRAIL: 'UPDATE_AUDIT_TRAIL',
  ADD_AUDIT_ENTRY: 'ADD_AUDIT_ENTRY'
};

const initialState = {
  loading: false,
  dashboardLoading: false,
  error: null,
  notification: null,
  sidebarOpen: false,
  activeView: 'dashboard',
  selectedEmployeeId: null,
  selectedRequestId: null,
  selectedExceptionId: null,
  selectedReimbursementId: null,
  employees: [],
  allEmployees: [],
  totalEmployees: 0,
  approvals: [],
  exceptionRequests: [],
  reimbursements: [],
  auditTrail: []
};

const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_DASHBOARD_LOADING:
      return { ...state, dashboardLoading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTION_TYPES.SET_NOTIFICATION:
      return { ...state, notification: action.payload };
    case ACTION_TYPES.CLEAR_NOTIFICATION:
      return { ...state, notification: null };
    case ACTION_TYPES.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload };
    case ACTION_TYPES.SET_ACTIVE_VIEW:
      return { 
        ...state, 
        activeView: action.payload.view,
        selectedEmployeeId: action.payload.employeeId || null,
        selectedRequestId: action.payload.requestId || null,
        selectedExceptionId: action.payload.exceptionId || null,
        selectedReimbursementId: action.payload.reimbursementId || null
      };
    case ACTION_TYPES.SET_SELECTED_EMPLOYEE:
      return { ...state, selectedEmployeeId: action.payload };
    case ACTION_TYPES.SET_SELECTED_REQUEST:
      return { ...state, selectedRequestId: action.payload };
    case ACTION_TYPES.SET_SELECTED_EXCEPTION:
      return { ...state, selectedExceptionId: action.payload };
    case ACTION_TYPES.SET_SELECTED_REIMBURSEMENT:
      return { ...state, selectedReimbursementId: action.payload };
    case ACTION_TYPES.UPDATE_EMPLOYEES:
      return { ...state, employees: action.payload };
    case ACTION_TYPES.UPDATE_ALL_EMPLOYEES:
      return { ...state, allEmployees: action.payload };
    case ACTION_TYPES.UPDATE_TOTAL_EMPLOYEES:
      return { ...state, totalEmployees: action.payload };
    case ACTION_TYPES.UPDATE_APPROVALS:
      return { ...state, approvals: action.payload };
    case ACTION_TYPES.UPDATE_EXCEPTIONS:
      return { ...state, exceptionRequests: action.payload };
    case ACTION_TYPES.UPDATE_REIMBURSEMENTS:
      return { ...state, reimbursements: action.payload };
    case ACTION_TYPES.UPDATE_AUDIT_TRAIL:
      return { ...state, auditTrail: action.payload };
    case ACTION_TYPES.ADD_AUDIT_ENTRY:
      return { 
        ...state, 
        auditTrail: [...state.auditTrail, action.payload]
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const employeesHook = useEmployees();
  const approvalsHook = useApprovals();

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
  }, []);

  const setDashboardLoading = useCallback((loading) => {
    dispatch({ type: ACTION_TYPES.SET_DASHBOARD_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
  }, []);

  const setSidebarOpen = useCallback((open) => {
    dispatch({ type: ACTION_TYPES.SET_SIDEBAR_OPEN, payload: open });
  }, []);

  const navigateTo = useCallback((view, options = {}) => {
    dispatch({ 
      type: ACTION_TYPES.SET_ACTIVE_VIEW, 
      payload: {
        view,
        employeeId: options.employeeId,
        requestId: options.requestId,
        exceptionId: options.exceptionId,
        reimbursementId: options.reimbursementId
      }
    });
  }, []);

  const setSelectedEmployee = useCallback((employeeId) => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_EMPLOYEE, payload: employeeId });
  }, []);

  const setSelectedRequest = useCallback((requestId) => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_REQUEST, payload: requestId });
  }, []);

  const setSelectedException = useCallback((exceptionId) => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_EXCEPTION, payload: exceptionId });
  }, []);

  const setSelectedReimbursement = useCallback((reimbursementId) => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_REIMBURSEMENT, payload: reimbursementId });
  }, []);

  const updateEmployees = useCallback((employees) => {
    dispatch({ type: ACTION_TYPES.UPDATE_EMPLOYEES, payload: employees });
  }, []);

  const updateAllEmployees = useCallback((allEmployees) => {
    dispatch({ type: ACTION_TYPES.UPDATE_ALL_EMPLOYEES, payload: allEmployees });
  }, []);

  const updateTotalEmployees = useCallback((total) => {
    dispatch({ type: ACTION_TYPES.UPDATE_TOTAL_EMPLOYEES, payload: total });
  }, []);

  const updateApprovals = useCallback((approvals) => {
    dispatch({ type: ACTION_TYPES.UPDATE_APPROVALS, payload: approvals });
  }, []);

  const updateExceptions = useCallback((exceptions) => {
    dispatch({ type: ACTION_TYPES.UPDATE_EXCEPTIONS, payload: exceptions });
  }, []);

  const updateReimbursements = useCallback((reimbursements) => {
    dispatch({ type: ACTION_TYPES.UPDATE_REIMBURSEMENTS, payload: reimbursements });
  }, []);

  const updateAuditTrail = useCallback((auditTrail) => {
    dispatch({ type: ACTION_TYPES.UPDATE_AUDIT_TRAIL, payload: auditTrail });
  }, []);

  const addAuditEntry = useCallback((entry) => {
    const auditEntry = {
      id: state.auditTrail.length + 1,
      time: new Date().toLocaleString(),
      ...entry
    };
    dispatch({ type: ACTION_TYPES.ADD_AUDIT_ENTRY, payload: auditEntry });
  }, [state.auditTrail.length]);

  const showNotification = useCallback((message, type = 'info') => {
    const notification = { 
      message, 
      type, 
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: ACTION_TYPES.SET_NOTIFICATION, payload: notification });
    
    setTimeout(() => {
      dispatch({ type: ACTION_TYPES.CLEAR_NOTIFICATION });
    }, 5000);
  }, []);

  const clearNotification = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_NOTIFICATION });
  }, []);

  const createEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    try {
      const newEmployee = await employeesHook.createEmployee(employeeData);
      addAuditEntry({
        action: "Employee Created",
        user: "HR Manager",
        remark: `${employeeData.first_name} ${employeeData.last_name}`
      });
      showNotification('Employee created successfully!', 'success');
      return newEmployee;
    } catch (error) {
      showNotification(`Failed to create employee: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [employeesHook, setLoading, showNotification, addAuditEntry]);

  const updateEmployee = useCallback(async (employeeId, employeeData) => {
    setLoading(true);
    try {
      const updatedEmployee = await employeesHook.updateEmployee(employeeId, employeeData);
      addAuditEntry({
        action: "Employee Updated",
        user: "HR Manager",
        remark: `${employeeData.first_name} ${employeeData.last_name}`
      });
      showNotification('Employee updated successfully!', 'success');
      return updatedEmployee;
    } catch (error) {
      showNotification(`Failed to update employee: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [employeesHook, setLoading, showNotification, addAuditEntry]);

  const deactivateEmployee = useCallback(async (employeeId) => {
    setLoading(true);
    try {
      await employeesHook.deactivateEmployee(employeeId);
      addAuditEntry({
        action: "Employee Deactivated",
        user: "HR Manager",
        remark: `Employee ID: ${employeeId}`
      });
      showNotification('Employee deactivated successfully!', 'success');
    } catch (error) {
      showNotification(`Failed to deactivate employee: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [employeesHook, setLoading, showNotification, addAuditEntry]);

  const approveRequest = useCallback(async (requestId, remarks, approvedBy) => {
    setLoading(true);
    try {
      await approvalsHook.approveRequest(requestId, remarks, approvedBy);
      addAuditEntry({
        action: "Request Approved",
        user: "HR Manager",
        remark: `${requestId} - ${remarks}`
      });
      showNotification('Request approved successfully!', 'success');
    } catch (error) {
      showNotification(`Failed to approve request: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [approvalsHook, setLoading, showNotification, addAuditEntry]);

  const rejectRequest = useCallback(async (requestId, remarks, approvedBy) => {
    setLoading(true);
    try {
      await approvalsHook.rejectRequest(requestId, remarks, approvedBy);
      addAuditEntry({
        action: "Request Rejected",
        user: "HR Manager",
        remark: `${requestId} - ${remarks}`
      });
      showNotification('Request rejected successfully!', 'success');
    } catch (error) {
      showNotification(`Failed to reject request: ${error.message}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [approvalsHook, setLoading, showNotification, addAuditEntry]);

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setDashboardLoading(true);
    try {
      await Promise.all([
        employeesHook.refetchAll(),
        approvalsHook.refetch()
      ]);
      showNotification('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showNotification('Failed to refresh data', 'error');
    } finally {
      setLoading(false);
      setDashboardLoading(false);
    }
  }, [employeesHook, approvalsHook, setLoading, setDashboardLoading, showNotification]);

  const selectedEmployee = state.employees.find(emp => emp.user_id === state.selectedEmployeeId);
  const selectedRequest = state.approvals.find(req => req.id === state.selectedRequestId);
  const selectedException = state.exceptionRequests.find(ex => ex.id === state.selectedExceptionId);
  const selectedReimbursement = state.reimbursements.find(r => r.id === state.selectedReimbursementId);
  
  const exceptionCount = state.exceptionRequests.filter(e => e.status === 'pending').length;
  const reimbursementPendingCount = state.reimbursements.filter(r => 
    r.status === 'submitted' || r.status === 'pending'
  ).length;

  const activeEmployeesCount = state.allEmployees.filter(emp => {
    const status = emp.status?.toLowerCase();
    return status === 'active' || status === 'activated';
  }).length;

  // Optimized sync effects
  useEffect(() => {
    if (employeesHook.employees && employeesHook.employees.length > 0 && 
        JSON.stringify(state.employees) !== JSON.stringify(employeesHook.employees)) {
      updateEmployees(employeesHook.employees);
    }
  }, [employeesHook.employees, state.employees, updateEmployees]);

  useEffect(() => {
    if (employeesHook.allEmployees && employeesHook.allEmployees.length > 0 &&
        JSON.stringify(state.allEmployees) !== JSON.stringify(employeesHook.allEmployees)) {
      updateAllEmployees(employeesHook.allEmployees);
    }
  }, [employeesHook.allEmployees, state.allEmployees, updateAllEmployees]);

  useEffect(() => {
    if (employeesHook.totalEmployees !== undefined && employeesHook.totalEmployees !== state.totalEmployees) {
      updateTotalEmployees(employeesHook.totalEmployees);
    }
  }, [employeesHook.totalEmployees, state.totalEmployees, updateTotalEmployees]);

  useEffect(() => {
    if (approvalsHook.approvals && approvalsHook.approvals.length > 0 &&
        JSON.stringify(state.approvals) !== JSON.stringify(approvalsHook.approvals)) {
      updateApprovals(approvalsHook.approvals);
    }
  }, [approvalsHook.approvals, state.approvals, updateApprovals]);

  useEffect(() => {
    if (employeesHook.loading !== state.loading) {
      setLoading(employeesHook.loading);
    }
  }, [employeesHook.loading, state.loading, setLoading]);

  useEffect(() => {
    if (employeesHook.dashboardLoading !== state.dashboardLoading) {
      setDashboardLoading(employeesHook.dashboardLoading);
    }
  }, [employeesHook.dashboardLoading, state.dashboardLoading, setDashboardLoading]);

  useEffect(() => {
    if (employeesHook.error && employeesHook.error !== state.error) {
      setError(employeesHook.error);
    }
    if (approvalsHook.error && approvalsHook.error !== state.error) {
      setError(approvalsHook.error);
    }
  }, [employeesHook.error, approvalsHook.error, state.error, setError]);

  const value = {
    ...state,
    selectedEmployee,
    selectedRequest,
    selectedException,
    selectedReimbursement,
    exceptionCount,
    reimbursementPendingCount,
    activeEmployeesCount,
    
    employeesData: employeesHook,
    approvalsData: approvalsHook,
    
    setLoading,
    setDashboardLoading,
    setError,
    setSidebarOpen,
    navigateTo,
    setSelectedEmployee,
    setSelectedRequest,
    setSelectedException,
    setSelectedReimbursement,
    updateEmployees,
    updateAllEmployees,
    updateTotalEmployees,
    updateApprovals,
    updateExceptions,
    updateReimbursements,
    updateAuditTrail,
    addAuditEntry,
    showNotification,
    clearNotification,
    refreshAllData,
    
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    approveRequest,
    rejectRequest,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;