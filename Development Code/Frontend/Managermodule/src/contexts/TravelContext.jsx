// contexts/TravelContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { travelService } from '../services/travelService';

const TravelContext = createContext();

const TRAVEL_ACTIONS = {
  SET_PERSONAL_REQUESTS: 'SET_PERSONAL_REQUESTS',
  SET_TEAM_REQUESTS: 'SET_TEAM_REQUESTS',
  ADD_PERSONAL_REQUEST: 'ADD_PERSONAL_REQUEST',
  UPDATE_TEAM_REQUEST: 'UPDATE_TEAM_REQUEST',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SELECTED_REQUEST: 'SET_SELECTED_REQUEST'
};

const travelReducer = (state, action) => {
  switch (action.type) {
    case TRAVEL_ACTIONS.SET_PERSONAL_REQUESTS:
      return { ...state, personalRequests: action.payload };
    case TRAVEL_ACTIONS.SET_TEAM_REQUESTS:
      return { ...state, teamRequests: action.payload };
    case TRAVEL_ACTIONS.ADD_PERSONAL_REQUEST:
      return { ...state, personalRequests: [...state.personalRequests, action.payload] };
    case TRAVEL_ACTIONS.UPDATE_TEAM_REQUEST:
      return {
        ...state,
        teamRequests: state.teamRequests.map(req =>
          req.travelRequestId === action.payload.travelRequestId ? action.payload : req
        )
      };
    case TRAVEL_ACTIONS.SET_SELECTED_REQUEST:
      return { ...state, selectedRequest: action.payload };
    case TRAVEL_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case TRAVEL_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const initialState = {
  personalRequests: [],
  teamRequests: [],
  selectedRequest: null,
  loading: false,
  error: null
};

export const useTravel = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravel must be used within a TravelProvider');
  }
  return context;
};

export const TravelProvider = ({ children }) => {
  const [state, dispatch] = useReducer(travelReducer, initialState);

  useEffect(() => {
    loadPersonalRequests();
    loadTeamRequests();
  }, []);

  const loadPersonalRequests = async () => {
    try {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: true });
      const requests = await travelService.getPersonalRequests();
      dispatch({ type: TRAVEL_ACTIONS.SET_PERSONAL_REQUESTS, payload: requests });
    } catch (error) {
      dispatch({ type: TRAVEL_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const loadTeamRequests = async () => {
    try {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: true });
      const requests = await travelService.getTeamRequests();
      dispatch({ type: TRAVEL_ACTIONS.SET_TEAM_REQUESTS, payload: requests });
    } catch (error) {
      dispatch({ type: TRAVEL_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const addPersonalRequest = async (requestData) => {
    try {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: true });
      const newRequest = await travelService.createTravelRequest(requestData);
      dispatch({ type: TRAVEL_ACTIONS.ADD_PERSONAL_REQUEST, payload: newRequest });
      return newRequest;
    } catch (error) {
      dispatch({ type: TRAVEL_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const updateTeamRequest = async (requestId, updates) => {
    try {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: true });
      const updatedRequest = await travelService.updateRequestStatus(requestId, updates);
      dispatch({ type: TRAVEL_ACTIONS.UPDATE_TEAM_REQUEST, payload: updatedRequest });
      return updatedRequest;
    } catch (error) {
      dispatch({ type: TRAVEL_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const getRequestById = async (requestId) => {
    try {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: true });
      const request = await travelService.getRequestById(requestId);
      dispatch({ type: TRAVEL_ACTIONS.SET_SELECTED_REQUEST, payload: request });
      return request;
    } catch (error) {
      dispatch({ type: TRAVEL_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: TRAVEL_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    addPersonalRequest,
    updateTeamRequest,
    getRequestById,
    refreshPersonalRequests: loadPersonalRequests,
    refreshTeamRequests: loadTeamRequests
  };

  return (
    <TravelContext.Provider value={value}>
      {children}
    </TravelContext.Provider>
  );
};