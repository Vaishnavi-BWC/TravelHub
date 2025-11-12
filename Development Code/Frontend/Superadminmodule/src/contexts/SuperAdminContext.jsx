// contexts/SuperAdminContext.js
import React, { createContext, useContext, useReducer } from 'react';
import superAdminService from '../services/superAdminService';

const SuperAdminContext = createContext();

const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USERS: 'SET_USERS',
  SET_POLICIES: 'SET_POLICIES',
  SET_CITY_CATEGORIES: 'SET_CITY_CATEGORIES',
  SET_CITIES: 'SET_CITIES',
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
  SET_TRAVEL_REQUESTS: 'SET_TRAVEL_REQUESTS',
  SET_WORKFLOW_DETAILS: 'SET_WORKFLOW_DETAILS',
};

const initialState = {
  loading: false,
  error: null,
  sidebarOpen: false,
  users: [],
  policies: [],
  cityCategories: [],
  cities: [],
  reports: [],
  systemLogs: [],
  overrideRequests: [],
  slaSettings: null,
  systemSettings: {},
  dashboardStats: null,
  financialData: [],
  selectedUser: null,
  selectedPolicy: null,
  travelRequests: [],
  workflowDetails: {},
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
    case ACTION_TYPES.SET_CITY_CATEGORIES:
      return { ...state, cityCategories: action.payload, loading: false };
    case ACTION_TYPES.SET_CITIES:
      return { ...state, cities: action.payload, loading: false };
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
    case ACTION_TYPES.SET_TRAVEL_REQUESTS:
      return { ...state, travelRequests: action.payload, loading: false };
    case ACTION_TYPES.SET_WORKFLOW_DETAILS:
      return { 
        ...state, 
        workflowDetails: {
          ...state.workflowDetails,
          [action.payload.travelRequestId]: action.payload.data
        }
      };
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

    // ==================== POLICY MANAGEMENT ACTIONS ====================

    // Load all policies
    loadPolicies: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const policies = await superAdminService.getPolicies(params);
        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: policies });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    // Load policy by ID
    loadPolicyById: async (policyId) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const policy = await superAdminService.getPolicyById(policyId);
        dispatch({ type: ACTION_TYPES.SET_SELECTED_POLICY, payload: policy });
        return policy;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Create new policy
    createPolicy: async (policyData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const newPolicy = await superAdminService.createPolicy(policyData);

        // Reload policies to get the updated list
        await actions.loadPolicies();

        // Show success message
        console.log('✅ Policy created successfully');
        return newPolicy;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Update existing policy
    updatePolicy: async (policyId, policyData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const updatedPolicy = await superAdminService.updatePolicy(policyId, policyData);

        // Update local state
        const updatedPolicies = state.policies.map(policy =>
          policy.id === policyId ? updatedPolicy : policy
        );
        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: updatedPolicies });

        // Update selected policy if it's the one being edited
        if (state.selectedPolicy && state.selectedPolicy.id === policyId) {
          dispatch({ type: ACTION_TYPES.SET_SELECTED_POLICY, payload: updatedPolicy });
        }

        return updatedPolicy;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Delete policy
    deletePolicy: async (policyId) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        await superAdminService.deletePolicy(policyId);

        // Update local state by removing the deleted policy
        const updatedPolicies = state.policies.filter(policy => policy.id !== policyId);
        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: updatedPolicies });

        // Clear selected policy if it was the deleted one
        if (state.selectedPolicy && state.selectedPolicy.id === policyId) {
          dispatch({ type: ACTION_TYPES.SET_SELECTED_POLICY, payload: null });
        }
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Activate/Deactivate policy
    updatePolicyStatus: async (policyId, active) => {
      try {
        const updatedPolicy = await superAdminService.updatePolicyStatus(policyId, active);

        // Update local state
        const updatedPolicies = state.policies.map(policy =>
          policy.id === policyId ? { ...policy, active } : policy
        );
        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: updatedPolicies });

        return updatedPolicy;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Load city categories (for policy creation)
    loadCityCategories: async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const categories = await superAdminService.getCityCategories();
        dispatch({ type: ACTION_TYPES.SET_CITY_CATEGORIES, payload: categories });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    // Load cities (for policy creation)
    loadCities: async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const cities = await superAdminService.getCities();
        dispatch({ type: ACTION_TYPES.SET_CITIES, payload: cities });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    updatePolicyGrade: async (policyId, grade, gradeData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const result = await superAdminService.updatePolicyGrade(policyId, grade, gradeData);

        // Update local state to reflect changes
        const updatedPolicies = state.policies.map(policy => {
          if (policy.id === policyId) {
            const updatedGradePolicies = policy.gradePolicies.map(gp =>
              gp.grade === grade ? { ...gp, ...gradeData } : gp
            );
            return { ...policy, gradePolicies: updatedGradePolicies };
          }
          return policy;
        });

        dispatch({ type: ACTION_TYPES.SET_POLICIES, payload: updatedPolicies });
        return result;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Get active policy for city and grade
    getActivePolicy: async (city, cityCategory, grade) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const policy = await superAdminService.getActivePolicy(city, cityCategory, grade);
        return policy;
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

    // ==================== SYSTEM LOGS & WORKFLOW ACTIONS ====================

    // Load travel requests (System Logs)
    loadTravelRequests: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const travelRequests = await superAdminService.getTravelRequests(params);
        dispatch({ type: ACTION_TYPES.SET_TRAVEL_REQUESTS, payload: travelRequests });
        return travelRequests;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Load workflow detail for a specific travel request
    loadWorkflowDetail: async (travelRequestId) => {
      try {
        const workflowDetail = await superAdminService.getWorkflowDetail(travelRequestId);
        
        // Store workflow detail in state for caching
        dispatch({ 
          type: ACTION_TYPES.SET_WORKFLOW_DETAILS, 
          payload: { 
            travelRequestId, 
            data: workflowDetail 
          } 
        });
        
        return workflowDetail;
      } catch (error) {
        console.error(`Error loading workflow detail for ${travelRequestId}:`, error);
        throw error;
      }
    },

    // Load combined system logs with workflow details
    loadSystemLogs: async (params = {}) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        // Load travel requests
        const travelRequests = await actions.loadTravelRequests(params);

        // Load workflow details for each request
        const logsWithWorkflows = await Promise.all(
          travelRequests.map(async (request) => {
            try {
              const workflowDetail = await actions.loadWorkflowDetail(request.travelRequestId);
              return {
                ...request,
                workflowDetail,
                id: request.travelRequestId,
                timestamp: request.createdAt,
                user: request.employeeId,
                action: 'TRAVEL_REQUEST',
                description: `Travel request from ${request.origin} to ${request.travelDestination}`,
                status: request.status
              };
            } catch (error) {
              console.error(`Error loading workflow for ${request.travelRequestId}:`, error);
              return {
                ...request,
                workflowDetail: null,
                id: request.travelRequestId,
                timestamp: request.createdAt,
                user: request.employeeId,
                action: 'TRAVEL_REQUEST',
                description: `Travel request from ${request.origin} to ${request.travelDestination}`,
                status: request.status
              };
            }
          })
        );

        dispatch({ type: ACTION_TYPES.SET_SYSTEM_LOGS, payload: logsWithWorkflows });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
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
    loadSlaSettings: async (workflowType = 'PRE_TRAVEL') => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        console.log('🚀 Loading SLA settings for:', workflowType);
        const settings = await superAdminService.getSlaSettings(workflowType);
        console.log('✅ SLA settings loaded:', settings);
        dispatch({ type: ACTION_TYPES.SET_SLA_SETTINGS, payload: settings });
      } catch (error) {
        console.error('❌ Error loading SLA settings:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },

    updateStepSLA: async (configId, slaData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        console.log('🚀 Updating step SLA:', { configId, slaData });
        const result = await superAdminService.updateStepSLA(configId, slaData);

        // Immediately update the local state for better UX
        if (state.slaSettings && state.slaSettings.stepSettings) {
          const updatedStepSettings = { ...state.slaSettings.stepSettings };

          // Find the step with matching configId in the stepSettings object
          Object.keys(updatedStepSettings).forEach(key => {
            if (updatedStepSettings[key].configId === configId) {
              updatedStepSettings[key] = {
                ...updatedStepSettings[key],
                timeLimitHours: slaData.timeLimitHours,
                autoApproveAfterTimeout: slaData.autoApproveAfterTimeout,
                lastUpdated: new Date().toISOString()
              };
              console.log('🔄 Updated step in local state:', key, updatedStepSettings[key]);
            }
          });

          const updatedSlaSettings = {
            ...state.slaSettings,
            stepSettings: updatedStepSettings,
            lastUpdated: new Date().toISOString()
          };

          console.log('📝 Dispatching updated SLA settings:', updatedSlaSettings);
          dispatch({ type: ACTION_TYPES.SET_SLA_SETTINGS, payload: updatedSlaSettings });
        }

        // Then reload from server to ensure consistency
        console.log('🔄 Reloading SLA settings from server...');
        await actions.loadSlaSettings(state.slaSettings?.workflowType || 'PRE_TRAVEL');

        console.log('✅ Step SLA updated successfully');
        return result;
      } catch (error) {
        console.error('❌ Error updating step SLA:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateBulkSLA: async (workflowType, bulkData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const result = await superAdminService.updateBulkSLA(workflowType, bulkData);
        // Reload SLA settings to get updated data
        await actions.loadSlaSettings(workflowType);
        return result;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    toggleStepActivation: async (configId, activationData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const result = await superAdminService.toggleStepActivation(configId, activationData);
        // Reload SLA settings to get updated data
        await actions.loadSlaSettings();
        return result;
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateStepSequence: async (configId, sequenceData) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      try {
        const result = await superAdminService.updateStepSequence(configId, sequenceData);
        // Reload SLA settings to get updated data
        await actions.loadSlaSettings();
        return result;
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