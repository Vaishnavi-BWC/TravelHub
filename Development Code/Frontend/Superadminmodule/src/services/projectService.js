// services/projectService.js
const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1';

export const projectService = {
    async getProjectsByManager(managerId) {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 [getProjectsByManager] Fetching projects for manager:', managerId);

            const response = await fetch(
                `${API_BASE_URL}/employees/${managerId}/projects`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('📊 [getProjectsByManager] Response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    // Ignore parsing errors
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('📊 [getProjectsByManager] Raw API response:', data);

            // Handle different response structures
            let projectsData = [];
            if (data.data && Array.isArray(data.data)) {
                projectsData = data.data;
            } else if (Array.isArray(data)) {
                projectsData = data;
            } else if (data.content && Array.isArray(data.content)) {
                projectsData = data.content;
            }

            console.log('✅ [getProjectsByManager] Extracted projects:', projectsData);
            return projectsData;
        } catch (error) {
            console.error('❌ [getProjectsByManager] Error:', error);
            throw error;
        }
    },

    async getAllProjects() {
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 [getAllProjects] Fetching all projects...');

            const response = await fetch(
                `${API_BASE_URL}/projects`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('📊 [getAllProjects] Response status:', response.status);

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    // Ignore parsing errors
                }

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('📊 [getAllProjects] Raw API response:', data);

            // Handle different response structures
            let projectsData = [];
            if (data.data && Array.isArray(data.data)) {
                projectsData = data.data;
            } else if (Array.isArray(data)) {
                projectsData = data;
            } else if (data.content && Array.isArray(data.content)) {
                projectsData = data.content;
            }

            console.log('✅ [getAllProjects] Extracted projects:', projectsData);
            return projectsData;
        } catch (error) {
            console.error('❌ [getAllProjects] Error:', error);
            throw error;
        }
    }
};

export default projectService;