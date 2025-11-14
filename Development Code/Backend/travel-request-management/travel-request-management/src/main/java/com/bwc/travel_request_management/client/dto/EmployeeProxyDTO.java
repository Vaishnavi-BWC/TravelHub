package com.bwc.travel_request_management.client.dto;

import java.util.Set;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProxyDTO {
    private UUID employeeId;
    private String fullName;
    private String email;
    private String department;
    private String level;
    private UUID managerId;
    private Set<String> roles;

    @Schema(description = "Set of assigned projects with full details")
    private Set<ProjectResponse> projects;
}
