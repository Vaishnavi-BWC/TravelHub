package com.bwc.employee_management_service.controller;

import static com.bwc.common.constants.ApiMetadataKeys.Common.*;
import static com.bwc.common.constants.ApiMetadataKeys.Employee.*;
import static com.bwc.common.constants.ApiMetadataKeys.Project.*;

import com.bwc.common.dto.ApiResponse;
import com.bwc.common.dto.PaginationMetadata;
import com.bwc.employee_management_service.dto.EmployeeRequest;
import com.bwc.employee_management_service.dto.EmployeeResponse;
import com.bwc.employee_management_service.dto.ProjectResponse;
import com.bwc.employee_management_service.dto.SearchRequest;
import com.bwc.employee_management_service.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Employee Management", description = "APIs for managing employees, their projects, and organizational hierarchy")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final HttpServletRequest httpServletRequest;

    @PostMapping
    @Operation(summary = "Create a new employee", description = "Creates a new employee with the provided details including roles, projects, and manager")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        log.info("Creating new employee: {}", request.getEmail());
        EmployeeResponse employee = employeeService.createEmployee(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(employee, "Employee created successfully",
                        getRequestPath(), getTraceId()));
    }

    @GetMapping
    @Operation(summary = "Get all employees", description = "Retrieves a paginated list of all employees with sorting options")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @ParameterObject @PageableDefault(size = 20, sort = "fullName") Pageable pageable) {

        log.info("Fetching all employees - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<EmployeeResponse> employees = employeeService.getAllEmployees(pageable);

        ApiResponse<Page<EmployeeResponse>> response = ApiResponse.success(
                employees, "Employees retrieved successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(PAGINATION, PaginationMetadata.fromPage(employees)));

        return ResponseEntity.ok(response);
    }

    @GetMapping(params = {"page", "size", "sortBy", "sortDirection"})
    @Operation(summary = "Get all employees (legacy)", description = "Retrieves a paginated list of all employees with legacy parameters", hidden = true)
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployeesLegacy(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Page<EmployeeResponse> employees = employeeService.getAllEmployees(page, size, sortBy, sortDirection);

        ApiResponse<Page<EmployeeResponse>> response = ApiResponse.success(
                employees, "Employees retrieved successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(PAGINATION, PaginationMetadata.fromPage(employees)));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    @Operation(summary = "Search employees", description = "Search employees with advanced filtering, pagination and sorting")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> searchEmployees(
            @Valid @RequestBody SearchRequest searchRequest) {

        log.info("Searching employees with criteria: {}", searchRequest);
        Page<EmployeeResponse> employees = employeeService.searchEmployees(searchRequest);

        ApiResponse<Page<EmployeeResponse>> response = ApiResponse.success(
                employees, "Employees search completed successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(PAGINATION, PaginationMetadata.fromPage(employees)));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID", description = "Retrieves a specific employee by their unique identifier")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable UUID id) {
        log.info("Fetching employee by ID: {}", id);
        EmployeeResponse employee = employeeService.getEmployeeById(id);

        return ResponseEntity.ok(ApiResponse.success(employee, "Employee retrieved successfully",
                getRequestPath(), getTraceId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee", description = "Updates an existing employee's information including roles, projects, and manager")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {

        log.info("Updating employee with ID: {}", id);
        EmployeeResponse employee = employeeService.updateEmployee(id, request);

        return ResponseEntity.ok(ApiResponse.success(employee, "Employee updated successfully",
                getRequestPath(), getTraceId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee", description = "Permanently deletes an employee from the system")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable UUID id) {

        log.info("Deleting employee with ID: {}", id);
        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(ApiResponse.success(null, "Employee deleted successfully",
                getRequestPath(), getTraceId()));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate employee", description = "Deactivates an employee (soft delete)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> deactivateEmployee(@PathVariable UUID id) {

        log.info("Deactivating employee with ID: {}", id);
        EmployeeResponse employee = employeeService.deactivateEmployee(id);

        return ResponseEntity.ok(ApiResponse.success(employee, "Employee deactivated successfully",
                getRequestPath(), getTraceId()));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate employee", description = "Reactivates a previously deactivated employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> activateEmployee(@PathVariable UUID id) {

        log.info("Activating employee with ID: {}", id);
        EmployeeResponse employee = employeeService.activateEmployee(id);

        return ResponseEntity.ok(ApiResponse.success(employee, "Employee activated successfully",
                getRequestPath(), getTraceId()));
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Get employees by department", description = "Retrieves all employees belonging to a specific department")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getEmployeesByDepartment(@PathVariable String department) {

        log.info("Fetching employees by department: {}", department);
        List<EmployeeResponse> employees = employeeService.getEmployeesByDepartment(department);

        ApiResponse<List<EmployeeResponse>> response = ApiResponse.success(
                employees, "Employees retrieved by department successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(COUNT, employees.size(), DEPARTMENT, department));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active employees", description = "Retrieves all currently active employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getActiveEmployees() {
        log.info("Fetching all active employees");
        List<EmployeeResponse> employees = employeeService.getActiveEmployees();

        ApiResponse<List<EmployeeResponse>> response = ApiResponse.success(
                employees, "Active employees retrieved successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(COUNT, employees.size(), STATUS, "active"));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/manager/{managerId}/subordinates")
    @Operation(summary = "Get subordinates", description = "Retrieves all employees who report to a specific manager")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getSubordinates(@PathVariable UUID managerId) {

        log.info("Fetching subordinates for manager ID: {}", managerId);
        List<EmployeeResponse> subordinates = employeeService.getSubordinates(managerId);

        ApiResponse<List<EmployeeResponse>> response = ApiResponse.success(
                subordinates, "Subordinates retrieved successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(COUNT, subordinates.size(), MANAGER_ID, managerId));

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{employeeId}/assign-projects")
    @Operation(summary = "Assign projects to employee", description = "Assigns multiple projects to an employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> assignProjectsToEmployee(
            @PathVariable UUID employeeId, @RequestBody List<UUID> projectIds) {

        log.info("Assigning {} projects to employee {}", projectIds.size(), employeeId);
        EmployeeResponse employee = employeeService.assignProjectsToEmployee(employeeId, projectIds);

        ApiResponse<EmployeeResponse> response = ApiResponse.success(
                employee, "Projects assigned successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(PROJECTS_ASSIGNED, projectIds.size(), EMPLOYEE_ID, employeeId));

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{employeeId}/remove-projects")
    @Operation(summary = "Remove projects from employee", description = "Removes multiple projects from an employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> removeProjectsFromEmployee(
            @PathVariable UUID employeeId, @RequestBody List<UUID> projectIds) {

        log.info("Removing {} projects from employee {}", projectIds.size(), employeeId);
        EmployeeResponse employee = employeeService.removeProjectsFromEmployee(employeeId, projectIds);

        ApiResponse<EmployeeResponse> response = ApiResponse.success(
                employee, "Projects removed successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(PROJECTS_REMOVED, projectIds.size(), EMPLOYEE_ID, employeeId));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{employeeId}/projects")
    @Operation(summary = "Get employee projects", description = "Retrieves all projects assigned to a specific employee")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getEmployeeProjects(@PathVariable UUID employeeId) {

        log.info("Fetching projects for employee {}", employeeId);
        List<ProjectResponse> projects = employeeService.getEmployeeProjects(employeeId);

        ApiResponse<List<ProjectResponse>> response = ApiResponse.success(
                projects, "Projects retrieved successfully",
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(COUNT, projects.size(), EMPLOYEE_ID, employeeId));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get employee by email", description = "Retrieves an employee by their email address")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeByEmail(@PathVariable String email) {

        log.info("Fetching employee by email: {}", email);
        EmployeeResponse employee = employeeService.getEmployeeByEmail(email);

        return ResponseEntity.ok(ApiResponse.success(employee, "Employee retrieved successfully",
                getRequestPath(), getTraceId()));
    }

    @GetMapping("/health")
    @Operation(summary = "Employee service health check", description = "Provides health information for the employee service", hidden = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthInfo = Map.of(
                "status", "UP",
                "service", "employee-management-service",
                "timestamp", java.time.Instant.now().toString(),
                "activeEmployees", employeeService.getActiveEmployees().size()
        );

        return ResponseEntity.ok(ApiResponse.success(healthInfo, "Service is healthy",
                getRequestPath(), getTraceId()));
    }

    @GetMapping("/role/{roleName}")
    @Operation(summary = "Get employees by role", description = "Retrieves all employees having a specific role (e.g., MANAGER, HR, FINANCE)")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getEmployeesByRole(@PathVariable String roleName) {

        log.info("Fetching employees with role: {}", roleName);
        List<EmployeeResponse> employees = employeeService.getEmployeesByRole(roleName);

        if (employees.isEmpty()) {
            throw new com.bwc.common.exception.ResourceNotFoundException("No employees found with role: " + roleName);
        }

        ApiResponse<List<EmployeeResponse>> response = ApiResponse.success(
                employees, "Employees retrieved successfully for role: " + roleName,
                getRequestPath(), getTraceId()
        ).withMetadata(Map.of(COUNT, employees.size(), ROLE, roleName));

        return ResponseEntity.ok(response);
    }

    // Helper methods
    private String getRequestPath() {
        return httpServletRequest.getRequestURI();
    }

    private String getTraceId() {
        String traceId = org.slf4j.MDC.get("traceId");
        if (traceId == null) {
            traceId = UUID.randomUUID().toString();
            org.slf4j.MDC.put("traceId", traceId);
        }
        return traceId;
    }
}
