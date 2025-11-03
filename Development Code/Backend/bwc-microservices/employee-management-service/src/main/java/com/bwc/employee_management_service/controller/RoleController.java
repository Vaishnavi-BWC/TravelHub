package com.bwc.employee_management_service.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bwc.common.constants.ApiMetadataKeys;
import com.bwc.common.dto.ApiResponse;
import com.bwc.employee_management_service.dto.RoleRequest;
import com.bwc.employee_management_service.dto.RoleResponse;
import com.bwc.employee_management_service.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Role Management", description = "APIs for managing employee roles and permissions")
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @Operation(summary = "Create a new role", description = "Creates a new role with the provided details")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleRequest roleRequest) {
        log.info("Creating role: {}", roleRequest.getRoleName());
        RoleResponse createdRole = roleService.createRole(roleRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(createdRole, "Role created successfully", "/api/v1/roles", null));
    }

    @GetMapping
    @Operation(summary = "Get all roles", description = "Retrieves a list of all available roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = roleService.getAllRoles();
        return ResponseEntity.ok(
                ApiResponse.success(roles, "Roles retrieved successfully", "/api/v1/roles", null)
                        .withMetadata(Map.of(ApiMetadataKeys.Common.COUNT, roles.size()))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Retrieves a specific role by its unique identifier")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable UUID id) {
        RoleResponse role = roleService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success(role, "Role retrieved successfully", "/api/v1/roles/" + id, null));
    }

    @GetMapping("/name/{roleName}")
    @Operation(summary = "Get role by name", description = "Retrieves a role by its name (case-insensitive)")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleByName(@PathVariable String roleName) {
        RoleResponse role = roleService.getRoleByName(roleName);
        return ResponseEntity.ok(ApiResponse.success(role, "Role retrieved successfully", "/api/v1/roles/name/" + roleName, null));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Updates an existing role's information")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(@PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
        RoleResponse role = roleService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.success(role, "Role updated successfully", "/api/v1/roles/" + id, null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Deletes a role permanently from the system")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Role deleted successfully", "/api/v1/roles/" + id, null));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate role", description = "Deactivates a role, making it unavailable for new assignments")
    public ResponseEntity<ApiResponse<RoleResponse>> deactivateRole(@PathVariable UUID id) {
        RoleResponse role = roleService.deactivateRole(id);
        return ResponseEntity.ok(ApiResponse.success(role, "Role deactivated successfully", "/api/v1/roles/" + id + "/deactivate", null));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate role", description = "Reactivates a previously deactivated role")
    public ResponseEntity<ApiResponse<RoleResponse>> activateRole(@PathVariable UUID id) {
        RoleResponse role = roleService.activateRole(id);
        return ResponseEntity.ok(ApiResponse.success(role, "Role activated successfully", "/api/v1/roles/" + id + "/activate", null));
    }
}
