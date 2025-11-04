const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('hr-auth-token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  get: (endpoint) => 
    fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    }).then(handleResponse),
  
  post: (endpoint, data) => 
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    }).then(handleResponse),
  
  put: (endpoint, data) => 
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    }).then(handleResponse),
  
  delete: (endpoint) => 
    fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    }).then(handleResponse)
};