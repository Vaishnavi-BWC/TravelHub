// contexts/SuperAdminContext.js
import React, { createContext, useContext, useReducer } from 'react';
import superAdminService from '../services/superAdminService';

const SuperAdminContext = createContext();

const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USERS: 'SET_USERS',
  SET_POLICIES: 'SET_POLICIES',
  SET_REPORTS: 'SET_REPORTS',
  SET_SYSTEM_LOGS: 'SET_SYSTEM_LOGS',
  SET_OVERRIDE_REQUESTS: 'SET_OVERRIDE_REQUESTS',
  SET_SLA_SETTINGS: 'SET_SLA_SETTINGS',
  SET_SYSTEM_SETTINGS: 'SET_SYSTEM_SETTINGS',
  SET_FINANCIAL_DATA: 'SET_FINANCIAL_DATA',
  SET_DASHBOARD_STATS: 'SET_DASHBOARD_STATS',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_SELECTED_USER: 'SET_SELECTED_USER',
  SET_SELECTED_POLICY: 'SET_SELECTED_POLICY',
};

const initialState = {
  loading: false,
  error: null,
  sidebarOpen: false,
  users: [],
  policies: [],
  reports: [],
  systemLogs: [],
  overrideRequests: [],
  slaSettings: [],
  systemSettings: {},
  dashboardStats: null,
  financialData: [],
  selectedUser: null,
  selectedPolicy: null,
};

const superAdminReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTION_TYPES.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload };
    case ACTION_TYPES.SET_USERS:
      return { ...state, users: action.payload, loading: false };
    case ACTION_TYPES.SET_POLICIES:
      return { ...state, policies: action.payload, loading: false };
    case ACTION_TYPES.SET_REPORTS:
      return { ...state, reports: action.payload, loading: false };
    case ACTION_TYPES.SET_SYSTEM_LOGS:
      return { ...state, systemLogs: action.payload, loading: false };
    case ACTION_TYPES.SET_OVERRIDE_REQUESTS:
      return { ...state, overrideRequests: action.payload, loading: false };
    case ACTION_TYPES.SET_SLA_SETTINGS:
      return { ...state, slaSettings: action.payload, loading: false };
    case ACTION_TYPES.SET_SYSTEM_SETTINGS:
      return { ...state, systemSettings: action.payload, loading: false };
    case ACTION_TYPES.SET_DASHBOARD_STATS:
      return { ...state, dashboardStats: action.payload, loading: false };
    case ACTION_TYPES.SET_FINANCIAL_DATA:
      return { ...state, financialData: action.payload, loading: false };
    case ACTION_TYPES.SET_SELECTED_USER:
      return { ...state, selectedUser: action.payload };
    case ACTION_TYPES.SET_SELECTED_POLICY:
      return { ...state, selectedPolicy: action.payload };
    default:
      return state;
  }
};

export const SuperAdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(superAdminReducer, initialState);

  const actions = {
    // UI Actions
    setSidebarOpen: (open) => {
      dispatch({ type: ACTION_TYPES.SET_SIDEBAR_OPEN, payload: open });
    },
    
    setSelectedUser: (user) => {
      dispatch({ type: ACTION_TYPES.SET_SELECTED_USER, payload: user });
    },
    
    setSelectedPolicy: (policy) => {
      dispatch({ type: ACTION_TYPES.SET_SELECTED_POLICY, payload: policy });
    },

    // Dashboard
    loadDashboardData: async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const [stats, financialData] = await Promise.all([
          superAdminService.getDashboardStats(),
          superAdminService.getFinancialData()
        ]);
        dispatch({ type: ACTION_TYPES.SET_DASHBOARD_STATS, payload: stats });
        dispatch({ type: ACTION_TYPES.SET_FINANCIAL_DATA, payload: financialData });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    // Users
    loadUsers: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const users = await superAdminService.getUsers(params);
        dispatch({ type: ACTION_TYPES.SET_USERS, payload: users });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    createUser: async (userData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        await superAdminService.createUser(userData);
        await actions.loadUsers(); // Reload users
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateUserStatus: async (userId, status) => {
      try {
        await superAdminService.updateUserStatus(userId, status);
        // Update local state
        const updatedUsers = state.users.map(user =>
          user.id === userId ? { ...user, status } : user
        );
        dispatch({ type: ACTION_TYPES.SET_USERS, payload: updatedUsers });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Policies
    loadPolicies: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const policies = await superAdminService.getPolicies(params);
        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: policies });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    createPolicy: async (policyData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        await superAdminService.createPolicy(policyData);
        await actions.loadPolicies(); // Reload policies
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updatePolicyStatus: async (policyId, isActive) => {
      try {
        await superAdminService.updatePolicyStatus(policyId, isActive);
        // Update local state
        const updatedPolicies = state.policies.map(policy =>
          policy.id === policyId ? { ...policy, isActive } : policy
        );
        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: updatedPolicies });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Reports
    loadReports: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const reports = await superAdminService.getReports(params);
        dispatch({ type: ACTION_TYPES.SET_REPORTS, payload: reports });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    generateReport: async (reportData) => {
      try {
        await superAdminService.generateReport(reportData);
        await actions.loadReports(); // Reload reports
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    downloadReport: async (reportId) => {
      try {
        return await superAdminService.downloadReport(reportId);
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // System Logs
    loadSystemLogs: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const logs = await superAdminService.getSystemLogs(params);
        dispatch({ type: ACTION_TYPES.SET_SYSTEM_LOGS, payload: logs });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    // Override Requests
    loadOverrideRequests: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const requests = await superAdminService.getOverrideRequests(params);
        dispatch({ type: ACTION_TYPES.SET_OVERRIDE_REQUESTS, payload: requests });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    handleOverrideRequest: async (requestId, action, reason = '') => {
      try {
        await superAdminService.handleOverrideRequest(requestId, action, reason);
        await actions.loadOverrideRequests(); // Reload requests
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // SLA Settings
    loadSlaSettings: async () => {
      try {
        const settings = await superAdminService.getSlaSettings();
        dispatch({ type: ACTION_TYPES.SET_SLA_SETTINGS, payload: settings });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    updateSlaSettings: async (settings) => {
      try {
        await superAdminService.updateSlaSettings(settings);
        await actions.loadSlaSettings(); // Reload settings
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // System Settings
    loadSystemSettings: async () => {
      try {
        const settings = await superAdminService.getSystemSettings();
        dispatch({ type: ACTION_TYPES.SET_SYSTEM_SETTINGS, payload: settings });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    updateSystemSettings: async (settings) => {
      try {
        await superAdminService.updateSystemSettings(settings);
        await actions.loadSystemSettings(); // Reload settings
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },
  };

  return (
    <SuperAdminContext.Provider value={{ state, actions }}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};