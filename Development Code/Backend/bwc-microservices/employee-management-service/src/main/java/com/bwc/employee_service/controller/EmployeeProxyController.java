package com.bwc.employee_service.controller;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bwc.common.exception.ResourceNotFoundException; // ✅ Use custom exception
import com.bwc.employee_management_service.dto.EmployeeResponse;
import com.bwc.employee_management_service.service.EmployeeService;
import com.bwc.employee_service.dto.EmployeeProxyDTO;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeProxyController {

    private final EmployeeService employeeService;

    private final Cache<UUID, EmployeeProxyDTO> employeeProxyCache = Caffeine.newBuilder()
            .expireAfterWrite(2, TimeUnit.MINUTES)
            .maximumSize(500)
            .build();

    /**
     * Fetches lightweight employee proxy data by ID with Caffeine caching.
     */
    @GetMapping("/proxy/{id}")
    public EmployeeProxyDTO getProxy(@PathVariable UUID id) {
        return employeeProxyCache.get(id, key -> {
            log.info("🔍 Cache miss → Fetching employee proxy for ID: {}", key);
            
            EmployeeResponse emp = employeeService.getEmployeeById(key);
            if (emp == null) {
                // ✅ Use a domain-specific exception
                throw new ResourceNotFoundException("Employee not found with ID: " + key);
            }

            return EmployeeProxyDTO.builder()
                    .employeeId(emp.getEmployeeId())
                    .fullName(emp.getFullName())
                    .email(emp.getEmail())
                    .department(emp.getDepartment())
                    .level(emp.getLevel())
                    .managerId(emp.getManagerId())
                    .roles(Optional.ofNullable(emp.getRoles()).orElse(Set.of()))
                    .projectIds(Optional.ofNullable(emp.getProjectIds()).orElse(Set.of()))
                    .build();
        });
    }

    /**
     * Retrieves all employees who have a specific role.
     */
    @GetMapping("/proxy/by-role")
    public List<EmployeeProxyDTO> getByRole(@RequestParam("role") String role) {
        log.info("🔍 Fetching employees by role: {}", role);

        List<EmployeeResponse> employees = employeeService.getEmployeesByRole(role);

        if (employees.isEmpty()) {
            throw new ResourceNotFoundException("No employees found with role: " + role);
        }

        // ✅ Use Stream.toList() instead of collect(Collectors.toList())
        return employees.stream()
                .map(emp -> EmployeeProxyDTO.builder()
                        .employeeId(emp.getEmployeeId())
                        .fullName(emp.getFullName())
                        .email(emp.getEmail())
                        .department(emp.getDepartment())
                        .level(emp.getLevel())
                        .managerId(emp.getManagerId())
                        .roles(Optional.ofNullable(emp.getRoles()).orElse(Set.of()))
                        .projectIds(Optional.ofNullable(emp.getProjectIds()).orElse(Set.of()))
                        .build())
                .toList(); // ✅ Java 16+ preferred immutable list
    }

}
