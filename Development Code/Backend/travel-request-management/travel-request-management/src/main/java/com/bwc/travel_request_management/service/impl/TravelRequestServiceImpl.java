package com.bwc.travel_request_management.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import com.bwc.travel_request_management.client.EmployeeServiceClient;
import com.bwc.travel_request_management.client.PolicyServiceClient;
import com.bwc.travel_request_management.client.WorkflowServiceClient;
import com.bwc.travel_request_management.dto.TravelRequestDTO;
import com.bwc.travel_request_management.dto.TravelRequestProxyDTO;
import com.bwc.travel_request_management.entity.TravelRequest;
import com.bwc.travel_request_management.exception.ResourceNotFoundException;
import com.bwc.travel_request_management.mapper.TravelRequestManualMapper;
import com.bwc.travel_request_management.repository.TravelRequestRepository;
import com.bwc.travel_request_management.service.TravelRequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TravelRequestServiceImpl implements TravelRequestService {

    private static final String REQUEST_NOT_FOUND = "Travel Request not found with id: ";

    private final EmployeeServiceClient employeeServiceClient;
    private final TravelRequestRepository repository;
    private final TravelRequestManualMapper mapper;
    private final WorkflowServiceClient workflowServiceClient;
    private final PolicyServiceClient policyServiceClient;

    @Lazy
    @Autowired
    @SuppressWarnings("java:S6813")
    private TravelRequestService self;

    @Override
    @Transactional
    public TravelRequestDTO createRequest(TravelRequestDTO dto) {
        log.info("🚀 Creating new travel request for employee: {}", dto.getEmployeeId());

        // ✅ Step 1: Fetch employee details
        var employee = employeeServiceClient.getEmployee(dto.getEmployeeId());
        log.info("👤 Employee {} fetched successfully with {} project(s)",
                employee.getFullName(),
                employee.getProjects() != null ? employee.getProjects().size() : 0);

        // ✅ Validate project assignment
        boolean isAssigned = employee.getProjects() != null && employee.getProjects().stream()
                .anyMatch(p -> p.getProjectId().equals(dto.getProjectId()));

        if (!isAssigned) {
            throw new IllegalArgumentException(String.format(
                    "Employee %s is not assigned to project %s",
                    employee.getFullName(), dto.getProjectId()));
        }

        // ✅ Prevent overlapping requests
        if (self.hasOverlappingRequest(dto.getEmployeeId(), dto.getStartDate(), dto.getEndDate())) {
            throw new IllegalArgumentException("Employee already has a travel request for the specified dates");
        }

        // ✅ Step 2: Fetch active policy ID from policy service
        UUID policyId;
        try {
            policyId = policyServiceClient.getActiveGradePolicyId(
                    dto.getTravelDestination(),
                    null,
                    employee.getLevel()
            );
            log.info("📋 Fetched active policy ID: {}", policyId);
        } catch (feign.FeignException.NotFound e) {
            log.warn("⚠️ No active policy found for city='{}', grade='{}'", dto.getTravelDestination(), employee.getLevel());
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    String.format("No active policy found for destination '%s' and grade '%s'",
                            dto.getTravelDestination(), employee.getLevel())
            );
        } catch (Exception e) {
            log.error("❌ Failed to fetch active policy for employee {}: {}", dto.getEmployeeId(), e.getMessage(), e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error while fetching active policy for the given destination and grade"
            );
        }

        // ✅ Step 3: Save the Travel Request entity
        TravelRequest entity = mapper.toEntity(dto);
        entity.setStatus("DRAFT");
        entity.setPolicyId(policyId);

        TravelRequest saved = repository.save(entity);
        log.info("💾 Travel request saved with ID: {}", saved.getTravelRequestId());

        // ✅ Step 4: Build proxy DTO (detached, flat, no Hibernate references)
        TravelRequestProxyDTO travelRequestProxy = TravelRequestProxyDTO.builder()
                .travelRequestId(saved.getTravelRequestId())
                .policyId(policyId)
                .employeeId(dto.getEmployeeId()) // use DTO instead of entity to avoid lazy proxies
                .projectId(dto.getProjectId())
                .managerId(employee.getManagerId())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .purpose(dto.getPurpose())
                .estimatedBudget(dto.getEstimatedBudget())
                .advancedTaken(dto.getAdvancedMoneyTaken())
                .travelDestination(dto.getTravelDestination())
                .origin(dto.getOrigin())
                .build();

        log.debug("📦 Built TravelRequestProxyDTO: {}", travelRequestProxy);

        // ✅ Step 5: Trigger Workflow initiation after transaction commits
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                initiateWorkflowAsync(saved.getTravelRequestId(), travelRequestProxy, dto.getEstimatedBudget());
            }
        });

        return mapper.toDto(saved);
    }

    /**
     * 🚀 Async workflow initiation with retry logic and comprehensive error handling
     */
    private void initiateWorkflowAsync(UUID travelRequestId, TravelRequestProxyDTO travelRequestProxy, Double estimatedCost) {
        log.info("🔄 Attempting to initiate workflow for Travel Request ID: {}", travelRequestId);
        
        int maxRetries = 3;
        int retryCount = 0;
        boolean workflowInitiated = false;
        
        while (retryCount < maxRetries && !workflowInitiated) {
            try {
                retryCount++;
                log.debug("🔄 Workflow initiation attempt {}/{} for Travel Request: {}", 
                         retryCount, maxRetries, travelRequestId);
                
                workflowServiceClient.createWorkflowWithTravelRequest(
                        travelRequestProxy, "PRE_TRAVEL", estimatedCost);
                
                workflowInitiated = true;
                log.info("✅ PRE_TRAVEL workflow initiated successfully for Travel Request ID: {}", travelRequestId);
                
            } catch (feign.FeignException e) {
                log.error("❌ Feign client error (attempt {}/{) initiating workflow for Travel Request {}: {} - {}", 
                         retryCount, maxRetries, travelRequestId, e.status(), e.getMessage());
                
                if (retryCount < maxRetries) {
                    try {
                        Thread.sleep(2000 * retryCount); // Exponential backoff: 2s, 4s, 6s
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.warn("⚠️ Workflow initiation retry interrupted for Travel Request: {}", travelRequestId);
                        break;
                    }
                } else {
                    log.error("💥 All {} attempts failed to initiate workflow for Travel Request: {}", 
                             maxRetries, travelRequestId);
                    // Optionally update travel request status to indicate workflow initiation failure
                    updateRequestStatusToFailed(travelRequestId);
                }
                
            } catch (Exception e) {
                log.error("💥 Unexpected error initiating workflow for Travel Request {} (attempt {}/{}): {}", 
                         travelRequestId, retryCount, maxRetries, e.getMessage(), e);
                
                if (retryCount >= maxRetries) {
                    updateRequestStatusToFailed(travelRequestId);
                }
                break; // Don't retry for unexpected errors
            }
        }
    }

    /**
     * 🔄 Update travel request status when workflow initiation fails
     */
    private void updateRequestStatusToFailed(UUID travelRequestId) {
        try {
            // Use a new transaction to update the status
            self.updateStatus(travelRequestId, "WORKFLOW_INITIATION_FAILED");
            log.warn("⚠️ Updated Travel Request {} status to WORKFLOW_INITIATION_FAILED", travelRequestId);
        } catch (Exception updateEx) {
            log.error("💥 Failed to update status for Travel Request {}: {}", travelRequestId, updateEx.getMessage());
        }
    }

    // --------------------------------------
    // ✅ Remaining Methods (no change needed)
    // --------------------------------------

    @Override
    @Transactional(readOnly = true)
    public TravelRequestDTO getRequest(UUID id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException(REQUEST_NOT_FOUND + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelRequestDTO> getAllRequests() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TravelRequestDTO> getAllRequests(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelRequestDTO> getRequestsByEmployee(UUID employeeId) {
        return repository.findByEmployeeId(employeeId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TravelRequestDTO> getRequestsByEmployee(UUID employeeId, Pageable pageable) {
        return repository.findByEmployeeId(employeeId, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelRequestDTO> getRequestsByProject(UUID projectId) {
        return repository.findByProjectId(projectId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TravelRequestDTO> getRequestsByProject(UUID projectId, Pageable pageable) {
        return repository.findByProjectId(projectId, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelRequestDTO> getRequestsByEmployeeAndDateRange(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        return repository.findByEmployeeAndDateRange(employeeId, startDate, endDate)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public TravelRequestDTO updateRequest(UUID id, TravelRequestDTO dto) {
        log.info("🔄 Updating travel request with ID: {}", id);
        TravelRequest existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(REQUEST_NOT_FOUND + id));

        if (self.hasOverlappingRequest(existing.getEmployeeId(), dto.getStartDate(), dto.getEndDate(), id)) {
            throw new IllegalArgumentException("Employee already has another travel request for the specified dates");
        }

        existing.setEmployeeId(dto.getEmployeeId());
        existing.setProjectId(dto.getProjectId());
        existing.setStartDate(dto.getStartDate());
        existing.setEndDate(dto.getEndDate());
        existing.setPurpose(dto.getPurpose());
        existing.setManagerPresent(dto.isManagerPresent());
        existing.setStatus("UPDATED");

        TravelRequest updated = repository.save(existing);
        log.info("✅ Travel request updated successfully with ID: {}", updated.getTravelRequestId());
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public TravelRequestDTO patchRequest(UUID id, TravelRequestDTO dto) {
        log.info("🔧 Patching travel request with ID: {}", id);
        TravelRequest existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(REQUEST_NOT_FOUND + id));

        if (dto.getEmployeeId() != null) existing.setEmployeeId(dto.getEmployeeId());
        if (dto.getProjectId() != null) existing.setProjectId(dto.getProjectId());
        if (dto.getStartDate() != null) existing.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) existing.setEndDate(dto.getEndDate());
        if (dto.getPurpose() != null) existing.setPurpose(dto.getPurpose());
        existing.setManagerPresent(dto.isManagerPresent());

        TravelRequest updated = repository.save(existing);
        log.info("✅ Travel request patched successfully with ID: {}", updated.getTravelRequestId());
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteRequest(UUID id) {
        log.info("🗑️ Deleting travel request with ID: {}", id);
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(REQUEST_NOT_FOUND + id);
        }
        repository.deleteById(id);
        log.info("✅ Travel request deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasOverlappingRequest(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        return repository.existsOverlappingRequest(employeeId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasOverlappingRequest(UUID employeeId, LocalDate startDate, LocalDate endDate, UUID excludeId) {
        return repository.existsOverlappingRequestExcludingId(employeeId, startDate, endDate, excludeId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getRequestCountByEmployee(UUID employeeId) {
        return repository.countByEmployeeId(employeeId);
    }

    @Override
    @Transactional
    public void updateStatus(UUID id, String status) {
        TravelRequest request = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(REQUEST_NOT_FOUND + id));
        request.setStatus(status);
        repository.save(request);
        log.info("📊 Travel request {} status updated to {}", id, status);
    }
}