package com.bwc.employee_management_service.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.employee_management_service.dto.RoleRequest;
import com.bwc.employee_management_service.dto.RoleResponse;
import com.bwc.employee_management_service.entity.Role;
import com.bwc.employee_management_service.exception.ResourceNotFoundException;
import com.bwc.employee_management_service.mapper.RoleMapper;
import com.bwc.employee_management_service.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService {

    private final RoleRepository roleRepository;

    // ✅ SonarQube fix: define a constant for repeated literal
    private static final String ROLE_NOT_FOUND = "Role not found with id: ";

    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        log.info("Creating new role: {}", request.getRoleName());

        if (roleRepository.existsByRoleName(request.getRoleName().toUpperCase())) {
            throw new IllegalArgumentException("Role with name " + request.getRoleName() + " already exists");
        }

        Role role = Role.builder()
                .roleName(request.getRoleName().toUpperCase())
                .description(request.getDescription())
                .build();

        Role savedRole = roleRepository.save(role);
        log.info("Role created successfully with ID: {}", savedRole.getRoleId());
        return RoleMapper.toResponse(savedRole);
    }

    public List<RoleResponse> getAllRoles() {
        log.info("Fetching all roles");
        return roleRepository.findAll().stream()
                .map(RoleMapper::toResponse)
                .toList(); // ✅ Java 16+ modern toList()
    }

    public RoleResponse getRoleById(UUID id) {
        log.info("Fetching role by ID: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));
        return RoleMapper.toResponse(role);
    }

    public RoleResponse getRoleByName(String roleName) {
        log.info("Fetching role by name: {}", roleName);
        Role role = roleRepository.findByRoleName(roleName.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + roleName));
        return RoleMapper.toResponse(role);
    }

    @Transactional
    public RoleResponse updateRole(UUID id, RoleRequest request) {
        log.info("Updating role with ID: {}", id);

        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));

        if (!existingRole.getRoleName().equalsIgnoreCase(request.getRoleName()) &&
            roleRepository.existsByRoleName(request.getRoleName().toUpperCase())) {
            throw new IllegalArgumentException("Role with name " + request.getRoleName() + " already exists");
        }

        existingRole.setRoleName(request.getRoleName().toUpperCase());
        existingRole.setDescription(request.getDescription());

        Role updatedRole = roleRepository.save(existingRole);
        log.info("Role updated successfully with ID: {}", updatedRole.getRoleId());
        return RoleMapper.toResponse(updatedRole);
    }

    @Transactional
    public void deleteRole(UUID id) {
        log.info("Deleting role with ID: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));
        roleRepository.delete(role);
        log.info("Role deleted successfully with ID: {}", id);
    }

    @Transactional
    public RoleResponse deactivateRole(UUID id) {
        log.info("Deactivating role with ID: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));

        role.setIsActive(false);
        Role deactivatedRole = roleRepository.save(role);
        log.info("Role deactivated successfully with ID: {}", id);
        return RoleMapper.toResponse(deactivatedRole);
    }

    @Transactional
    public RoleResponse activateRole(UUID id) {
        log.info("Activating role with ID: {}", id);
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROLE_NOT_FOUND + id));

        role.setIsActive(true);
        Role activatedRole = roleRepository.save(role);
        log.info("Role activated successfully with ID: {}", id);
        return RoleMapper.toResponse(activatedRole);
    }
}
