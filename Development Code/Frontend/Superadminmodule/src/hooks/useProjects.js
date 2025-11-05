// hooks/useProjects.js - UPDATED
import { useState, useCallback } from 'react';
import { projectService } from '../services/projectService';

export const useProjects = () => {
    const [managerProjects, setManagerProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadManagerProjects = useCallback(async (managerId) => {
        if (!managerId) {
            console.log('🔄 [loadManagerProjects] No manager ID provided, clearing projects');
            setManagerProjects([]);
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔄 [loadManagerProjects] Loading projects for manager:', managerId);
            const projectsData = await projectService.getProjectsByManager(managerId);

            console.log('📊 [loadManagerProjects] Raw projects data:', projectsData);

            const formattedProjects = projectsData.map(project => ({
                projectId: project.projectId || project.id,
                projectName: project.projectName || project.name || 'Unnamed Project',
                description: project.description || '',
                status: project.status || 'active'
            }));

            console.log('✅ [loadManagerProjects] Formatted manager projects:', formattedProjects);
            setManagerProjects(formattedProjects);
            return formattedProjects;
        } catch (err) {
            console.error('❌ [loadManagerProjects] Error loading manager projects:', err);
            setError(err.message);
            setManagerProjects([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        managerProjects,
        loading,
        error,
        loadManagerProjects
    };
};

export default { useProjects };