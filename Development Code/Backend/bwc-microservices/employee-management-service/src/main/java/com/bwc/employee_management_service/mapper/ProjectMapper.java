package com.bwc.employee_management_service.mapper;

import com.bwc.employee_management_service.dto.ProjectResponse;
import com.bwc.employee_management_service.entity.Project;

public final class ProjectMapper {

    private ProjectMapper() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setProjectId(project.getProjectId());
        response.setProjectName(project.getProjectName());
        response.setDescription(project.getDescription());

        // ✅ Use toList() for modern Java versions
        response.setEmployeeIds(
                project.getEmployees().stream()
                        .map(e -> e.getEmployeeId())
                        .toList()
        );

        return response;
    }
}
