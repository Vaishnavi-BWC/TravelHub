package com.bwc.approval_workflow_service.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.approval_workflow_service.client.EmployeeServiceClient;
import com.bwc.approval_workflow_service.client.NotificationServiceClient;
import com.bwc.approval_workflow_service.client.PolicyServiceClient;
import com.bwc.approval_workflow_service.client.TravelRequestServiceClient;
import com.bwc.approval_workflow_service.dto.ApprovalActionDTO;
import com.bwc.approval_workflow_service.dto.ApprovalHistoryDTO;
import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
import com.bwc.approval_workflow_service.dto.ApprovalStatsDTO;
import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
import com.bwc.approval_workflow_service.dto.BookingDetailsDTO;
import com.bwc.approval_workflow_service.dto.BookingDocumentDTO;
import com.bwc.approval_workflow_service.dto.BookingSummaryDTO;
import com.bwc.approval_workflow_service.dto.EmployeeProxyDTO;
import com.bwc.approval_workflow_service.dto.NotificationRequestDTO;
import com.bwc.approval_workflow_service.dto.TravelBookingDTO;
import com.bwc.approval_workflow_service.dto.TravelDeskHistoryDTO;
import com.bwc.approval_workflow_service.dto.TravelDeskStatsDTO;
import com.bwc.approval_workflow_service.dto.TravelRequestProxyDTO;
import com.bwc.approval_workflow_service.dto.WorkflowBookingStatsDTO;
import com.bwc.approval_workflow_service.dto.WorkflowMetricsDTO;
import com.bwc.approval_workflow_service.entity.ApprovalAction;
import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
import com.bwc.approval_workflow_service.entity.WorkflowConfiguration;
import com.bwc.approval_workflow_service.exception.ResourceNotFoundException;
import com.bwc.approval_workflow_service.exception.WorkflowException;
import com.bwc.approval_workflow_service.mapper.ApprovalWorkflowMapper;
import com.bwc.approval_workflow_service.repository.ApprovalActionRepository;
import com.bwc.approval_workflow_service.repository.ApprovalWorkflowRepository;
import com.bwc.approval_workflow_service.repository.WorkflowConfigurationRepository;
import com.bwc.approval_workflow_service.service.ApprovalWorkflowService;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalWorkflowServiceImpl implements ApprovalWorkflowService {

    // Constants for status values
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_ESCALATED = "ESCALATED";
    private static final String STATUS_COMPLETED = "COMPLETED";
    
    // Constants for workflow types
    private static final String WORKFLOW_TYPE_PRE_TRAVEL = "PRE_TRAVEL";
    private static final String WORKFLOW_TYPE_POST_TRAVEL = "POST_TRAVEL";
    
    // Constants for step names
    private static final String STEP_MANAGER_APPROVAL = "MANAGER_APPROVAL";
    private static final String STEP_TRAVEL_DESK_CHECK = "TRAVEL_DESK_CHECK";
    private static final String STEP_FINANCE_APPROVAL = "FINANCE_APPROVAL";
    private static final String STEP_TRAVEL_DESK_BOOKING = "TRAVEL_DESK_BOOKING";
    private static final String STEP_HR_COMPLIANCE = "HR_COMPLIANCE";
    private static final String STEP_HR_APPROVAL = "HR_APPROVAL";
    
    // Constants for roles
    private static final String ROLE_MANAGER = "MANAGER";
    private static final String ROLE_TRAVEL_DESK = "TRAVEL_DESK";
    private static final String ROLE_HR = "HR";
    private static final String ROLE_FINANCE = "FINANCE";
    
    // Constants for reference types
    private static final String REFERENCE_TYPE_TRAVEL_REQUEST = "TRAVEL_REQUEST";
    
    // Constants for messages
    private static final String MSG_WORKFLOW_NOT_FOUND = "Workflow not found";

    private final ApprovalWorkflowRepository workflowRepository;
    private final ApprovalActionRepository actionRepository;
    private final WorkflowConfigurationRepository configRepository;
    private final TravelRequestServiceClient travelRequestClient;
    private final PolicyServiceClient policyClient;
    private final EmployeeServiceClient employeeClient;
    private final NotificationServiceClient notificationClient;
    private final ApprovalWorkflowMapper mapper;
    private final ObjectMapper objectMapper;

    // ============ CORE WORKFLOW METHODS ============

    @Override
    @Transactional
    public ApprovalWorkflowDTO initiateWorkflow(UUID travelRequestId, String workflowType, Double estimatedCost) {
        TravelRequestProxyDTO travelRequest = fetchTravelRequestSafe(travelRequestId);
        return initiateWorkflow(travelRequest, workflowType, estimatedCost);
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO initiateWorkflow(TravelRequestProxyDTO travelRequest, String workflowType, Double estimatedCost) {
        UUID travelRequestId = travelRequest.travelRequestId();
        
        if (workflowRepository.findByTravelRequestIdAndWorkflowType(travelRequestId, workflowType).isPresent()) {
            throw new WorkflowException("Workflow already exists for travel request " + travelRequestId + " and type " + workflowType);
        }

        EmployeeProxyDTO employee = fetchEmployeeSafe(travelRequest.employeeId());

        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflowType);

        if (configs.isEmpty()) {
            throw new WorkflowException("No workflow configuration found for type: " + workflowType);
        }

        WorkflowConfiguration firstStep = configs.get(0);
        UUID approverId = determineApproverId(firstStep, travelRequest);

        ApprovalWorkflow workflow = ApprovalWorkflow.builder()
                .travelRequestId(travelRequestId)
                .workflowType(workflowType)
                .currentStep(firstStep.getStepName())
                .currentApproverRole(firstStep.getApproverRole())
                .currentApproverId(approverId)
                .status(STATUS_PENDING)
                .nextStep(getNextStep(configs, 0))
                .priority(calculatePriority(travelRequest, estimatedCost))
                .estimatedCost(estimatedCost)
                .dueDate(calculateDueDate(firstStep))
                .build();

        ApprovalWorkflow savedWorkflow = workflowRepository.save(workflow);

        actionRepository.save(ApprovalAction.builder()
                .workflowId(savedWorkflow.getWorkflowId())
                .travelRequestId(travelRequestId)
                .approverRole("SYSTEM")
                .approverId(travelRequest.employeeId())
                .action("SUBMIT")
                .step("SUBMIT")
                .comments(workflowType + " workflow initiated")
                .actionTakenAt(LocalDateTime.now())
                .build());

        updateTravelRequestStatus(travelRequestId, "UNDER_REVIEW");
        sendNewApprovalNotification(savedWorkflow, travelRequest, employee);

        log.info("✅ {} workflow initiated successfully for request {}", workflowType, travelRequestId);
        return mapper.toDto(savedWorkflow);
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO processApproval(ApprovalRequestDTO approvalRequest) {
        ApprovalWorkflow workflow = workflowRepository.findById(approvalRequest.getWorkflowId())
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STATUS_PENDING.equalsIgnoreCase(workflow.getStatus())) {
            throw new WorkflowException("Workflow is not in pending state");
        }

        validateApproverAuthorization(workflow, approvalRequest);
        validateManagerAuthorization(workflow, approvalRequest);

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflow.getWorkflowId())
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(approvalRequest.getApproverRole())
                .approverId(approvalRequest.getApproverId())
                .approverName(approvalRequest.getApproverName())
                .action(approvalRequest.getAction().toUpperCase())
                .step(workflow.getCurrentStep())
                .comments(approvalRequest.getComments())
                .escalationReason(approvalRequest.getEscalationReason())
                .isEscalated(approvalRequest.getEscalationReason() != null)
                .amountApproved(approvalRequest.getAmountApproved())
                .reimbursementAmount(approvalRequest.getReimbursementAmount())
                .actionTakenAt(LocalDateTime.now())
                .build());

        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflow.getWorkflowType());

        String action = approvalRequest.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            handleApprove(workflow, configs, approvalRequest);
        } else if ("REJECT".equals(action)) {
            handleReject(workflow, approvalRequest.getComments());
        } else if ("RETURN".equals(action)) {
            handleReturn(workflow, approvalRequest.getComments());
        } else if ("ESCALATE".equals(action)) {
            handleEscalate(workflow, approvalRequest.getEscalationReason());
        } else {
            throw new WorkflowException("Unknown action: " + action);
        }

        ApprovalWorkflow updatedWorkflow = workflowRepository.save(workflow);
        return mapper.toDto(updatedWorkflow);
    }

    private void handleApprove(ApprovalWorkflow workflow, List<WorkflowConfiguration> configs, ApprovalRequestDTO approvalRequest) {
        int currentIndex = findCurrentStepIndex(configs, workflow.getCurrentStep());
        
        // Handle step-specific logic
        handleStepSpecificLogic(workflow, approvalRequest);
        
        // For PRE_TRAVEL workflow, handle the conditional routing
        if (WORKFLOW_TYPE_PRE_TRAVEL.equals(workflow.getWorkflowType())) {
            handlePreTravelNextStep(workflow, configs, currentIndex);
        } else {
            // For POST_TRAVEL workflow, use sequential order
            if (currentIndex < configs.size() - 1) {
                WorkflowConfiguration nextStep = configs.get(currentIndex + 1);
                updateWorkflowToNextStep(workflow, configs, nextStep);
                sendNextApprovalNotification(workflow);
            } else {
                completeWorkflow(workflow, STATUS_APPROVED);
            }
        }
    }

    private void handlePreTravelNextStep(ApprovalWorkflow workflow, List<WorkflowConfiguration> configs, int currentIndex) {
        String currentStep = workflow.getCurrentStep();
        
        switch (currentStep) {
            case STEP_MANAGER_APPROVAL:
                // Always go to TRAVEL_DESK_CHECK after manager approval
                WorkflowConfiguration travelDeskCheck = getStepByName(configs, STEP_TRAVEL_DESK_CHECK);
                updateWorkflowToNextStep(workflow, configs, travelDeskCheck);
                sendNextApprovalNotification(workflow);
                break;
                
            case STEP_TRAVEL_DESK_CHECK:
                // Decision point: overpriced or not
                if (Boolean.TRUE.equals(workflow.getIsOverpriced())) {
                    log.info("🔀 OVERPRICED path: TRAVEL_DESK_CHECK -> FINANCE_APPROVAL");
                    WorkflowConfiguration financeApproval = getStepByName(configs, STEP_FINANCE_APPROVAL);
                    updateWorkflowToNextStep(workflow, configs, financeApproval);
                } else {
                    log.info("🔀 NORMAL path: TRAVEL_DESK_CHECK -> HR_APPROVAL");
                    WorkflowConfiguration hrApproval = getStepByName(configs, STEP_HR_APPROVAL);
                    updateWorkflowToNextStep(workflow, configs, hrApproval);
                }
                sendNextApprovalNotification(workflow);
                break;
                
            case STEP_HR_APPROVAL:
                // After HR approval, always go to FINANCE_APPROVAL in normal path
                log.info("🔀 NORMAL path: HR_APPROVAL -> FINANCE_APPROVAL");
                WorkflowConfiguration financeApproval = getStepByName(configs, STEP_FINANCE_APPROVAL);
                updateWorkflowToNextStep(workflow, configs, financeApproval);
                sendNextApprovalNotification(workflow);
                break;
                
            case STEP_FINANCE_APPROVAL:
                // Decision point after finance approval
                if (Boolean.TRUE.equals(workflow.getIsOverpriced())) {
                    log.info("🔀 OVERPRICED path: FINANCE_APPROVAL -> TRAVEL_DESK_BOOKING");
                    WorkflowConfiguration travelDeskBooking = getStepByName(configs, STEP_TRAVEL_DESK_BOOKING);
                    updateWorkflowToNextStep(workflow, configs, travelDeskBooking);
                    sendNextApprovalNotification(workflow);
                } else {
                    log.info("✅ NORMAL path: FINANCE_APPROVAL -> COMPLETED");
                    completeWorkflow(workflow, STATUS_APPROVED);
                }
                break;
                
            case STEP_TRAVEL_DESK_BOOKING:
                // After booking in overpriced path, go to HR_COMPLIANCE
                log.info("🔀 OVERPRICED path: TRAVEL_DESK_BOOKING -> HR_COMPLIANCE");
                WorkflowConfiguration hrCompliance = getStepByName(configs, STEP_HR_COMPLIANCE);
                updateWorkflowToNextStep(workflow, configs, hrCompliance);
                sendNextApprovalNotification(workflow);
                break;
                
            case STEP_HR_COMPLIANCE:
                // Final step in overpriced path
                log.info("✅ OVERPRICED path: HR_COMPLIANCE -> COMPLETED");
                completeWorkflow(workflow, STATUS_APPROVED);
                break;
                
            default:
                throw new WorkflowException("Unknown step in PRE_TRAVEL workflow: " + currentStep);
        }
    }

    private void handleStepSpecificLogic(ApprovalWorkflow workflow, ApprovalRequestDTO approvalRequest) {
        String currentStep = workflow.getCurrentStep();
        
        if (STEP_TRAVEL_DESK_CHECK.equals(currentStep)) {
            // Handle overpriced marking
            if (Boolean.TRUE.equals(approvalRequest.getMarkOverpriced())) {
                workflow.setIsOverpriced(true);
                workflow.setOverpricedReason(approvalRequest.getOverpricedReason());
                log.info("🏷️ Workflow {} marked as OVERPRICED", workflow.getWorkflowId());
            }
        } else if (STEP_FINANCE_APPROVAL.equals(currentStep)) {
            // Handle amount approval
            if (approvalRequest.getAmountApproved() != null) {
                workflow.setEstimatedCost(approvalRequest.getAmountApproved());
                log.info("💰 Finance approved amount: {} for workflow {}", approvalRequest.getAmountApproved(), workflow.getWorkflowId());
            }
        }
    }

    private WorkflowConfiguration getStepByName(List<WorkflowConfiguration> configs, String stepName) {
        return configs.stream()
                .filter(c -> stepName.equals(c.getStepName()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("Step not found: " + stepName));
    }

    private void updateWorkflowToNextStep(ApprovalWorkflow workflow, List<WorkflowConfiguration> configs, WorkflowConfiguration nextStep) {
        int nextIndex = findCurrentStepIndex(configs, nextStep.getStepName());
        
        workflow.setPreviousStep(workflow.getCurrentStep());
        workflow.setCurrentStep(nextStep.getStepName());
        workflow.setCurrentApproverRole(nextStep.getApproverRole());
        workflow.setCurrentApproverId(determineApproverId(nextStep, fetchTravelRequestSafe(workflow.getTravelRequestId())));
        workflow.setNextStep(getNextStep(configs, nextIndex));
        workflow.setDueDate(calculateDueDate(nextStep));
        workflow.setStatus(STATUS_PENDING);
        
        log.info("🔄 Workflow {} moved from {} to {}", workflow.getWorkflowId(), 
                workflow.getPreviousStep(), workflow.getCurrentStep());
    }

    private void handleReject(ApprovalWorkflow workflow, String comments) {
        workflow.setStatus(STATUS_REJECTED);
        workflow.setCompletedAt(LocalDateTime.now());
        updateTravelRequestStatus(workflow.getTravelRequestId(), STATUS_REJECTED);
        sendRejectionNotification(workflow, comments);
        log.info("❌ Workflow {} rejected: {}", workflow.getWorkflowId(), comments);
    }

    private void handleReturn(ApprovalWorkflow workflow, String comments) {
        workflow.setStatus("RETURNED");
        updateTravelRequestStatus(workflow.getTravelRequestId(), "RETURNED");
        sendReturnNotification(workflow, comments);
        log.info("↩️ Workflow {} returned: {}", workflow.getWorkflowId(), comments);
    }

    private void handleEscalate(ApprovalWorkflow workflow, String reason) {
        workflow.setStatus(STATUS_ESCALATED);
        workflow.setPriority("HIGH");
        sendEscalationNotification(workflow, reason);
        log.info("🚨 Workflow {} escalated: {}", workflow.getWorkflowId(), reason);
    }

    // ============ WORKFLOW COMPLETION ============

    private void completeWorkflow(ApprovalWorkflow workflow, String status) {
        workflow.setStatus(status);
        workflow.setCurrentStep(STATUS_COMPLETED);
        workflow.setCompletedAt(LocalDateTime.now());

        String travelRequestStatus = STATUS_APPROVED.equals(status) ? STATUS_COMPLETED : status;
        updateTravelRequestStatus(workflow.getTravelRequestId(), travelRequestStatus);

        // Auto-initiate POST_TRAVEL workflow for approved PRE_TRAVEL requests
        if (WORKFLOW_TYPE_PRE_TRAVEL.equals(workflow.getWorkflowType()) && STATUS_APPROVED.equals(status)) {
            initiatePostTravelWorkflow(workflow);
        }

        sendCompletionNotification(workflow);
        log.info("✅ Workflow {} completed with status: {}", workflow.getWorkflowId(), status);
    }

    private void initiatePostTravelWorkflow(ApprovalWorkflow preTravelWorkflow) {
        try {
            boolean postTravelExists = workflowRepository
                    .findByTravelRequestIdAndWorkflowType(preTravelWorkflow.getTravelRequestId(), WORKFLOW_TYPE_POST_TRAVEL)
                    .isPresent();

            if (!postTravelExists) {
                TravelRequestProxyDTO travelRequest = fetchTravelRequestSafe(preTravelWorkflow.getTravelRequestId());
                initiateWorkflow(travelRequest, WORKFLOW_TYPE_POST_TRAVEL, preTravelWorkflow.getEstimatedCost());
                log.info("✅ POST_TRAVEL workflow automatically initiated for request {}",
                        preTravelWorkflow.getTravelRequestId());
            } else {
                log.warn("⚠️ POST_TRAVEL workflow already exists for request {}", preTravelWorkflow.getTravelRequestId());
            }
        } catch (Exception e) {
            log.error("❌ Failed to auto-initiate POST_TRAVEL workflow: {}", e.getMessage());
        }
    }

    // ============ VALIDATION METHODS ============

    private void validateApproverAuthorization(ApprovalWorkflow workflow, ApprovalRequestDTO approvalRequest) {
        String currentStepRole = workflow.getCurrentApproverRole();
        String approverRole = approvalRequest.getApproverRole();

        if (!currentStepRole.equals(approverRole)) {
            throw new WorkflowException(String.format("Approver with role %s cannot approve step requiring role %s",
                    approverRole, currentStepRole));
        }

        log.info("✅ Authorization validated: {} can approve {} step", approverRole, workflow.getCurrentStep());
    }

    private void validateManagerAuthorization(ApprovalWorkflow workflow, ApprovalRequestDTO approvalRequest) {
        if (ROLE_MANAGER.equals(workflow.getCurrentApproverRole())) {
            if (workflow.getCurrentApproverId() == null) {
                throw new WorkflowException("No manager assigned to this workflow step");
            }

            if (!workflow.getCurrentApproverId().equals(approvalRequest.getApproverId())) {
                throw new WorkflowException(String.format("Manager %s cannot approve request assigned to manager %s",
                        approvalRequest.getApproverId(), workflow.getCurrentApproverId()));
            }
        }
    }

    // ============ HELPER METHODS ============

    private TravelRequestProxyDTO fetchTravelRequestSafe(UUID id) {
        try {
            return travelRequestClient.getTravelRequest(id);
        } catch (FeignException e) {
            log.error("Failed to fetch travel request {}: {}", id, e.getMessage());
            throw new WorkflowException("Failed to retrieve travel request");
        }
    }

    private EmployeeProxyDTO fetchEmployeeSafe(UUID employeeId) {
        try {
            return employeeClient.getEmployee(employeeId);
        } catch (FeignException e) {
            log.warn("Failed to fetch employee {}: {}", employeeId, e.getMessage());
            return EmployeeProxyDTO.builder().employeeId(employeeId).build();
        }
    }

    private UUID determineApproverId(WorkflowConfiguration step, TravelRequestProxyDTO travelRequest) {
        UUID employeeId = travelRequest.employeeId();

        switch (step.getApproverRole()) {
            case ROLE_MANAGER:
                return determineManagerApprover(step, employeeId);
            case ROLE_TRAVEL_DESK:
            case ROLE_HR:
            case ROLE_FINANCE:
                return determineRoleBasedApprover(step, travelRequest); // ✅ Fixed
            default:
                log.warn("Unknown approver role: {}", step.getApproverRole());
                return getSystemAdminIdFallback();
        }
    }

    private UUID determineManagerApprover(WorkflowConfiguration step, UUID employeeId) {
        try {
            EmployeeProxyDTO employee = employeeClient.getEmployee(employeeId);

            if (employee.getManagerId() != null) {
                logApproverAssignment(step.getStepName(), ROLE_MANAGER, employee.getManagerId(),
                        employee.getEmployeeId(), "EmployeeService");
                return employee.getManagerId();
            } else {
                UUID fallbackId = getSystemAdminIdFallback();
                logApproverAssignment(step.getStepName(), ROLE_MANAGER, fallbackId, employee.getEmployeeId(),
                        "Fallback: No manager found");
                return fallbackId;
            }
        } catch (Exception e) {
            log.error("❌ [{}] Failed to fetch manager for employee {}: {}", step.getStepName(), employeeId,
                    e.getMessage());
            UUID fallbackId = getSystemAdminIdFallback();
            logApproverAssignment(step.getStepName(), ROLE_MANAGER, fallbackId, employeeId, "Exception fallback");
            return fallbackId;
        }
    }

    private UUID determineRoleBasedApprover(WorkflowConfiguration step, TravelRequestProxyDTO travelRequest) {
        String role = step.getApproverRole();
        UUID employeeId = travelRequest.employeeId();
        
        log.info("🔍 Determining approver for role: {} (Employee: {})", role, employeeId);
        
        switch (role) {
            case ROLE_TRAVEL_DESK:
                return findFirstAvailableNonManagerApprover(ROLE_TRAVEL_DESK, employeeId);
            case ROLE_HR:
                return findFirstAvailableNonManagerApprover(ROLE_HR, employeeId);
            case ROLE_FINANCE:
                return findFirstAvailableNonManagerApprover(ROLE_FINANCE, employeeId);
            default:
                log.warn("Unknown approver role: {}", role);
                return getSystemAdminIdFallback();
        }
    }

    private UUID findFirstAvailableNonManagerApprover(String role, UUID employeeId) {
        try {
            List<EmployeeProxyDTO> availableApprovers = employeeClient.getEmployeesByRole(role);
            
            if (availableApprovers == null || availableApprovers.isEmpty()) {
                log.warn("⚠️ No {} users found, using system fallback", role);
                return getSystemAdminIdFallback();
            }
            
            // Filter out managers
            List<EmployeeProxyDTO> nonManagerApprovers = availableApprovers.stream()
                    .filter(emp -> !isManager(emp))
                    .collect(Collectors.toList());
            
            if (nonManagerApprovers.isEmpty()) {
                log.warn("⚠️ No non-manager {} users found, using all available users", role);
                nonManagerApprovers = availableApprovers;
            }
            
            Map<UUID, Long> approverWorkload = getApproverWorkload(nonManagerApprovers);
            
            EmployeeProxyDTO selectedApprover = nonManagerApprovers.stream()
                    .min(Comparator.comparing(emp -> approverWorkload.getOrDefault(emp.getEmployeeId(), 0L)))
                    .orElse(nonManagerApprovers.get(0));
            
            log.info("✅ Assigned {} role to {} (ID: {}) - Workload: {} pending approvals", 
                    role, selectedApprover.getFullName(), selectedApprover.getEmployeeId(), 
                    approverWorkload.getOrDefault(selectedApprover.getEmployeeId(), 0L));
            
            return selectedApprover.getEmployeeId();
            
        } catch (Exception e) {
            log.error("❌ Failed to find {} approver: {}", role, e.getMessage());
            return getSystemAdminIdFallback();
        }
    }

    private boolean isManager(EmployeeProxyDTO employee) {
        if (employee == null) return false;
        
        // Check roles for MANAGER
        if (employee.getRoles() != null && employee.getRoles().contains("MANAGER")) {
            return true;
        }
        
        // Check level for management indicators
        if (employee.getLevel() != null) {
            String level = employee.getLevel().toUpperCase();
            if (level.contains("MGR") || level.contains("MANAGER") || 
                (level.startsWith("M") && level.length() > 1 && Character.isDigit(level.charAt(1)))) {
                return true;
            }
        }
        
        return false;
    }

    private Map<UUID, Long> getApproverWorkload(List<EmployeeProxyDTO> approvers) {
        Map<UUID, Long> workload = new HashMap<>();
        
        if (approvers == null || approvers.isEmpty()) {
            return workload;
        }
        
        try {
            List<UUID> approverIds = approvers.stream()
                    .map(EmployeeProxyDTO::getEmployeeId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            
            if (!approverIds.isEmpty()) {
                Map<UUID, Long> pendingCounts = workflowRepository.getPendingApprovalsCountByApproverIds(approverIds);
                workload.putAll(pendingCounts);
            }
            
        } catch (Exception e) {
            log.warn("Failed to fetch workload data: {}", e.getMessage());
        }
        
        // Ensure all approvers have an entry
        for (EmployeeProxyDTO approver : approvers) {
            if (approver != null && approver.getEmployeeId() != null) {
                workload.putIfAbsent(approver.getEmployeeId(), 0L);
            }
        }
        
        return workload;
    }
    
    private UUID getSystemAdminIdFallback() {
        return UUID.fromString("ff78684e-ed8d-4696-bccf-582ecf1ab900");
    }

    private String getNextStep(List<WorkflowConfiguration> configs, int currentIndex) {
        return currentIndex < configs.size() - 1 ? configs.get(currentIndex + 1).getStepName() : STATUS_COMPLETED;
    }

    private LocalDateTime calculateDueDate(WorkflowConfiguration step) {
        return step.getTimeLimitHours() != null ? LocalDateTime.now().plusHours(step.getTimeLimitHours())
                : LocalDateTime.now().plusDays(3);
    }

    private String calculatePriority(TravelRequestProxyDTO travelRequest, Double estimatedCost) {
        if (estimatedCost != null && estimatedCost > 5000) return "HIGH";
        long days = java.time.temporal.ChronoUnit.DAYS.between(travelRequest.startDate(), travelRequest.endDate());
        if (days > 14) return "HIGH";
        return "NORMAL";
    }

    private int findCurrentStepIndex(List<WorkflowConfiguration> configs, String currentStep) {
        for (int i = 0; i < configs.size(); i++) {
            if (configs.get(i).getStepName().equals(currentStep)) {
                return i;
            }
        }
        throw new WorkflowException("Current step not found in configuration: " + currentStep);
    }

    private void updateTravelRequestStatus(UUID travelRequestId, String status) {
        try {
            travelRequestClient.updateRequestStatus(travelRequestId, status);
        } catch (Exception e) {
            log.warn("Failed to update travel request status: {}", e.getMessage());
        }
    }

    @Transactional
    public void updateTravelRequestBookingStatus(UUID travelRequestId, String status) {
        try {
            travelRequestClient.updateRequestStatus(travelRequestId, status);
            log.info("✅ Travel request {} status updated to: {}", travelRequestId, status);
        } catch (Exception e) {
            log.error("❌ Failed to update travel request status: {}", e.getMessage());
            throw new WorkflowException("Failed to update travel request status: " + e.getMessage());
        }
    }

    private void logApproverAssignment(String stepName, String role, UUID approverId, UUID employeeId, String source) {
        if (approverId != null) {
            log.info("🧭 [{}] Assigned {} role to approver {} for employee {} (source: {})", stepName, role, approverId,
                    employeeId, source);
        } else {
            log.warn("⚠️ [{}] No approver ID found for role {} (employee: {}, source: {})", stepName, role, employeeId,
                    source);
        }
    }

    // ============ NOTIFICATION METHODS ============

    @Async
    void sendNewApprovalNotification(ApprovalWorkflow workflow, TravelRequestProxyDTO travelRequest,
            EmployeeProxyDTO employee) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId())
                    .subject("Approval Required: Travel Request")
                    .message("Travel request from " + employee.getFullName() + " requires your approval")
                    .notificationType("APPROVAL_REQUEST")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType(REFERENCE_TYPE_TRAVEL_REQUEST)
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }
    }

    @Async
    void sendNextApprovalNotification(ApprovalWorkflow workflow) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId())
                    .subject("Action Required: Next Approval Step")
                    .message("Workflow requires your action at step: " + workflow.getCurrentStep())
                    .notificationType("APPROVAL_NEXT")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType(REFERENCE_TYPE_TRAVEL_REQUEST)
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send notification: {}", e.getMessage());
        }
    }

    @Async
    void sendRejectionNotification(ApprovalWorkflow workflow, String comments) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId())
                    .subject("Workflow Rejected")
                    .message("Workflow " + workflow.getWorkflowId() + " was rejected. Comments: " + comments)
                    .notificationType("WORKFLOW_REJECTED")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType(REFERENCE_TYPE_TRAVEL_REQUEST)
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send rejection notification: {}", e.getMessage());
        }
    }

    @Async
    void sendReturnNotification(ApprovalWorkflow workflow, String comments) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId())
                    .subject("Workflow Returned")
                    .message("Workflow " + workflow.getWorkflowId() + " returned for correction. Comments: " + comments)
                    .notificationType("WORKFLOW_RETURNED")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType(REFERENCE_TYPE_TRAVEL_REQUEST)
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send return notification: {}", e.getMessage());
        }
    }

    @Async
    void sendEscalationNotification(ApprovalWorkflow workflow, String reason) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId())
                    .subject("Workflow Escalated")
                    .message("Workflow " + workflow.getWorkflowId() + " escalated. Reason: " + reason)
                    .notificationType("WORKFLOW_ESCALATED")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType(REFERENCE_TYPE_TRAVEL_REQUEST)
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send escalation notification: {}", e.getMessage());
        }
    }

    @Async
    void sendCompletionNotification(ApprovalWorkflow workflow) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId())
                    .subject("Workflow Completed")
                    .message("Workflow " + workflow.getWorkflowId() + " has been completed")
                    .notificationType("WORKFLOW_COMPLETED")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType(REFERENCE_TYPE_TRAVEL_REQUEST)
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send completion notification: {}", e.getMessage());
        }
    }

    // ============ OTHER INTERFACE METHODS ============

    @Override
    @Transactional(readOnly = true)
    public ApprovalWorkflowDTO getWorkflowByRequestId(UUID travelRequestId) {
        return workflowRepository.findByTravelRequestId(travelRequestId).map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalWorkflowDTO getWorkflow(UUID workflowId) {
        return workflowRepository.findById(workflowId).map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowDTO> getPendingApprovals(String approverRole, UUID approverId) {
        List<ApprovalWorkflow> workflows;
        if (approverId != null) {
            workflows = workflowRepository.findByCurrentApproverIdAndStatus(approverId, STATUS_PENDING);
        } else {
            workflows = workflowRepository.findByCurrentApproverRoleAndStatus(approverRole, STATUS_PENDING);
        }
        return workflows.stream().map(mapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowDTO> getPendingApprovalsByRole(String approverRole) {
        return workflowRepository.findByCurrentApproverRoleAndStatus(approverRole, STATUS_PENDING).stream()
                .map(mapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowDTO> getWorkflowsByStatus(String status) {
        return workflowRepository.findByStatus(status).stream().map(mapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalActionDTO> getWorkflowHistory(UUID travelRequestId) {
        return actionRepository.findByTravelRequestIdOrderByCreatedAtDesc(travelRequestId).stream()
                .map(mapper::toActionDto).toList();
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO escalateWorkflow(UUID workflowId, String reason, UUID escalatedBy) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));
        workflow.setStatus(STATUS_ESCALATED);
        workflow.setPriority("HIGH");
        workflowRepository.save(workflow);
        sendEscalationNotification(workflow, reason);
        return mapper.toDto(workflow);
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO reassignWorkflow(UUID workflowId, String newApproverRole, UUID newApproverId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));
        workflow.setCurrentApproverRole(newApproverRole);
        workflow.setCurrentApproverId(newApproverId);
        workflowRepository.save(workflow);
        sendNextApprovalNotification(workflow);
        return mapper.toDto(workflow);
    }

    @Override
    public void reloadWorkflowConfigurations() {
        log.info("Workflow configurations reloaded");
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO updateWorkflowPriority(UUID workflowId, String priority) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));
        workflow.setPriority(priority);
        ApprovalWorkflow updated = workflowRepository.save(workflow);
        return mapper.toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowMetricsDTO getWorkflowMetrics() {
        long totalWorkflows = workflowRepository.count();
        long pendingWorkflows = workflowRepository.countByStatus(STATUS_PENDING);
        long approvedWorkflows = workflowRepository.countByStatus(STATUS_APPROVED);
        long rejectedWorkflows = workflowRepository.countByStatus(STATUS_REJECTED);
        long escalatedWorkflows = workflowRepository.countByStatus(STATUS_ESCALATED);

        double averageApprovalTime = calculateAverageApprovalTime();

        return WorkflowMetricsDTO.builder()
                .totalWorkflows(totalWorkflows)
                .pendingWorkflows(pendingWorkflows)
                .approvedWorkflows(approvedWorkflows)
                .rejectedWorkflows(rejectedWorkflows)
                .escalatedWorkflows(escalatedWorkflows)
                .averageApprovalTime(averageApprovalTime)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalStatsDTO> getApprovalStatsByApprover(UUID approverId) {
        List<ApprovalWorkflow> workflows = workflowRepository.findByCurrentApproverIdAndStatus(approverId, STATUS_PENDING);

        return List.of(ApprovalStatsDTO.builder()
                .approverId(approverId)
                .totalAssigned((long) workflows.size())
                .pending((long) workflows.size())
                .approved(0L)
                .rejected(0L)
                .averageProcessingTime(0.0)
                .build());
    }

    private double calculateAverageApprovalTime() {
        List<ApprovalWorkflow> completedWorkflows = workflowRepository.findByStatus(STATUS_APPROVED);
        if (completedWorkflows.isEmpty()) {
            return 0.0;
        }

        double totalHours = completedWorkflows.stream().mapToDouble(wf -> {
            if (wf.getCreatedAt() != null && wf.getCompletedAt() != null) {
                return java.time.Duration.between(wf.getCreatedAt(), wf.getCompletedAt()).toHours();
            }
            return 0.0;
        }).sum();

        return totalHours / completedWorkflows.size();
    }

    // ============ BOOKING MANAGEMENT METHODS ============

    @Override
    @Transactional
    public void recordBookingAction(UUID workflowId, UUID travelDeskId, String action, String comments) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        actionRepository
                .save(ApprovalAction.builder()
                        .workflowId(workflowId)
                        .travelRequestId(workflow.getTravelRequestId())
                        .approverRole(ROLE_TRAVEL_DESK)
                        .approverId(travelDeskId)
                        .action(action)
                        .step(STEP_TRAVEL_DESK_BOOKING)
                        .comments(comments)
                        .actionTakenAt(LocalDateTime.now())
                        .build());

        log.info("Booking action recorded: {} for workflow {}", action, workflowId);
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO markBookingUploaded(UUID workflowId, UUID uploadedBy) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STEP_TRAVEL_DESK_BOOKING.equals(workflow.getCurrentStep())) {
            throw new WorkflowException("Workflow is not in booking upload step");
        }

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(ROLE_TRAVEL_DESK)
                .approverId(uploadedBy)
                .action("UPLOAD_BOOKING")
                .step(STEP_TRAVEL_DESK_BOOKING)
                .comments("Travel bookings uploaded")
                .actionTakenAt(LocalDateTime.now())
                .build());

        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflow.getWorkflowType());

        WorkflowConfiguration nextStep = configs.stream()
                .filter(c -> STEP_HR_COMPLIANCE.equals(c.getStepName()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("HR compliance step not found"));

        workflow.setPreviousStep(workflow.getCurrentStep());
        workflow.setCurrentStep(nextStep.getStepName());
        workflow.setCurrentApproverRole(nextStep.getApproverRole());
        workflow.setCurrentApproverId(determineApproverId(nextStep, fetchTravelRequestSafe(workflow.getTravelRequestId())));
        workflow.setNextStep(getNextStep(configs, configs.indexOf(nextStep)));
        workflow.setDueDate(calculateDueDate(nextStep));

        sendNextApprovalNotification(workflow);

        return mapper.toDto(workflowRepository.save(workflow));
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO uploadBills(UUID workflowId, Double actualCost, UUID uploadedBy) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!WORKFLOW_TYPE_POST_TRAVEL.equals(workflow.getWorkflowType())) {
            throw new WorkflowException("Only post-travel workflows can have bills uploaded");
        }

        workflow.setActualCost(actualCost);

        actionRepository
                .save(ApprovalAction.builder()
                        .workflowId(workflowId)
                        .travelRequestId(workflow.getTravelRequestId())
                        .approverRole("EMPLOYEE")
                        .approverId(uploadedBy)
                        .action("UPLOAD_BILLS")
                        .step("BILL_UPLOAD")
                        .comments("Travel bills uploaded with actual cost: " + actualCost)
                        .actionTakenAt(LocalDateTime.now())
                        .build());

        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflow.getWorkflowType());

        WorkflowConfiguration nextStep = configs.stream()
                .filter(c -> "TRAVEL_DESK_BILL_REVIEW".equals(c.getStepName()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("Travel Desk bill review step not found"));

        workflow.setPreviousStep(workflow.getCurrentStep());
        workflow.setCurrentStep(nextStep.getStepName());
        workflow.setCurrentApproverRole(nextStep.getApproverRole());
        workflow.setCurrentApproverId(determineApproverId(nextStep, fetchTravelRequestSafe(workflow.getTravelRequestId())));
        workflow.setNextStep(getNextStep(configs, configs.indexOf(nextStep)));
        workflow.setDueDate(calculateDueDate(nextStep));
        workflow.setStatus(STATUS_PENDING);

        try {
            travelRequestClient.updateActualCost(workflow.getTravelRequestId(), actualCost);
        } catch (Exception e) {
            log.warn("Failed to update actual cost: {}", e.getMessage());
        }

        sendNextApprovalNotification(workflow);

        return mapper.toDto(workflowRepository.save(workflow));
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO markBookingCompleted(UUID workflowId, UUID travelDeskId, String comments, BookingDetailsDTO bookingDetails) {
        return markBookingCompleted(workflowId, travelDeskId, comments);
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO markBookingCompleted(UUID workflowId, UUID travelDeskId, String comments) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STEP_TRAVEL_DESK_BOOKING.equals(workflow.getCurrentStep())) {
            throw new WorkflowException("Workflow is not in booking upload step. Current step: " + workflow.getCurrentStep());
        }

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(ROLE_TRAVEL_DESK)
                .approverId(travelDeskId)
                .action("COMPLETE_BOOKING")
                .step(STEP_TRAVEL_DESK_BOOKING)
                .comments(comments != null ? comments : "All travel bookings completed and confirmed")
                .actionTakenAt(LocalDateTime.now())
                .build());

        updateTravelRequestBookingStatus(workflow.getTravelRequestId(), "BOOKED");

        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflow.getWorkflowType());

        WorkflowConfiguration nextStep = configs.stream()
                .filter(c -> STEP_HR_COMPLIANCE.equals(c.getStepName()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("HR compliance step not found"));

        workflow.setPreviousStep(workflow.getCurrentStep());
        workflow.setCurrentStep(nextStep.getStepName());
        workflow.setCurrentApproverRole(nextStep.getApproverRole());
        workflow.setCurrentApproverId(determineApproverId(nextStep, fetchTravelRequestSafe(workflow.getTravelRequestId())));
        workflow.setNextStep(getNextStep(configs, configs.indexOf(nextStep)));
        workflow.setDueDate(calculateDueDate(nextStep));

        sendNextApprovalNotification(workflow);

        ApprovalWorkflow updatedWorkflow = workflowRepository.save(workflow);

        log.info("✅ Bookings marked as completed for workflow {}, moved to HR compliance", workflowId);
        return mapper.toDto(updatedWorkflow);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowDTO> getWorkflowsByStatusAndStep(String status, String step) {
        return workflowRepository.findByStatusAndCurrentStep(status, step).stream().map(mapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingSummaryDTO getBookingSummary(UUID workflowId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        List<BookingDocumentDTO> bookingDocuments = fetchBookingDocuments(workflow.getTravelRequestId());
        BookingDetailsDTO bookingDetails = convertJsonToBookingDetails(workflow.getBookingDetails());

        return BookingSummaryDTO.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .totalBookings(calculateTotalBookings(bookingDetails))
                .totalDocuments(bookingDocuments.size())
                .totalBookingAmount(workflow.getTotalBookingAmount())
                .status(workflow.getStatus())
                .documents(mapToDocumentSummary(bookingDocuments))
                .bookingDetails(bookingDetails)
                .build();
    }

    @Override
    @Transactional
    public ApprovalWorkflowDTO updateBookingDetails(UUID workflowId, UUID updatedBy, BookingDetailsDTO bookingDetails, String comments) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STEP_TRAVEL_DESK_BOOKING.equals(workflow.getCurrentStep())) {
            throw new WorkflowException("Cannot update booking details. Current step: " + workflow.getCurrentStep());
        }

        workflow.setBookingDetails(convertBookingDetailsToJson(bookingDetails));
        workflow.setTotalBookingAmount(bookingDetails.getTotalBookingAmount());

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(ROLE_TRAVEL_DESK)
                .approverId(updatedBy)
                .action("UPDATE_BOOKING_DETAILS")
                .step(STEP_TRAVEL_DESK_BOOKING)
                .comments(comments != null ? comments : "Booking details updated")
                .actionTakenAt(LocalDateTime.now())
                .build());

        ApprovalWorkflow updatedWorkflow = workflowRepository.save(workflow);

        log.info("✅ Booking details updated for workflow {}", workflowId);
        return mapper.toDto(updatedWorkflow);
    }

    // ============ BOOKING MANAGEMENT HELPER METHODS ============

    private String convertBookingDetailsToJson(BookingDetailsDTO bookingDetails) {
        try {
            return objectMapper.writeValueAsString(bookingDetails);
        } catch (Exception e) {
            log.warn("Failed to convert booking details to JSON: {}", e.getMessage());
            return "{}";
        }
    }

    private BookingDetailsDTO convertJsonToBookingDetails(String json) {
        if (json == null || json.trim().isEmpty()) {
            return BookingDetailsDTO.builder().build();
        }
        try {
            return objectMapper.readValue(json, BookingDetailsDTO.class);
        } catch (Exception e) {
            log.warn("Failed to convert JSON to booking details: {}", e.getMessage());
            return BookingDetailsDTO.builder().build();
        }
    }

    private List<BookingDocumentDTO> fetchBookingDocuments(UUID travelRequestId) {
        try {
            return List.of();
        } catch (Exception e) {
            log.warn("Failed to fetch booking documents: {}", e.getMessage());
            return List.of();
        }
    }

    private Integer calculateTotalBookings(BookingDetailsDTO bookingDetails) {
        if (bookingDetails == null) return 0;
        
        int total = 0;
        if (bookingDetails.getFlightBookings() != null) total += bookingDetails.getFlightBookings().size();
        if (bookingDetails.getHotelBookings() != null) total += bookingDetails.getHotelBookings().size();
        if (bookingDetails.getCarRentals() != null) total += bookingDetails.getCarRentals().size();
        if (bookingDetails.getOtherBookings() != null) total += bookingDetails.getOtherBookings().size();
        
        return total;
    }

    private List<BookingSummaryDTO.BookingDocumentSummary> mapToDocumentSummary(List<BookingDocumentDTO> documents) {
        return documents.stream()
                .map(doc -> BookingSummaryDTO.BookingDocumentSummary.builder()
                        .documentType(doc.getDocumentType().name())
                        .fileName(doc.getFileName())
                        .originalFileName(doc.getOriginalFileName())
                        .uploadDate(doc.getUploadedAt().toString())
                        .fileSize(doc.getFileSize())
                        .build())
                .toList();
    }

    // ============ TRAVEL BOOKING METHODS ============

    @Override
    @Transactional
    public TravelBookingDTO addBookingToWorkflow(UUID workflowId, UUID travelDeskId, TravelBookingDTO bookingDTO) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STEP_TRAVEL_DESK_BOOKING.equals(workflow.getCurrentStep())) {
            throw new WorkflowException("Cannot add booking. Workflow is not in TRAVEL_DESK_BOOKING step. Current step: " + workflow.getCurrentStep());
        }

        BookingDetailsDTO existingBookingDetails = convertJsonToBookingDetails(workflow.getBookingDetails());
        if (existingBookingDetails == null) {
            existingBookingDetails = BookingDetailsDTO.builder().build();
        }

        TravelBookingDTO.BookingType bookingType = bookingDTO.getBookingType();
        if (bookingType == TravelBookingDTO.BookingType.FLIGHT) {
            if (existingBookingDetails.getFlightBookings() == null) {
                existingBookingDetails.setFlightBookings(new ArrayList<>());
            }
            existingBookingDetails.getFlightBookings().add(convertToFlightBooking(bookingDTO));
        } else if (bookingType == TravelBookingDTO.BookingType.HOTEL) {
            if (existingBookingDetails.getHotelBookings() == null) {
                existingBookingDetails.setHotelBookings(new ArrayList<>());
            }
            existingBookingDetails.getHotelBookings().add(convertToHotelBooking(bookingDTO));
        } else if (bookingType == TravelBookingDTO.BookingType.CAR_RENTAL) {
            if (existingBookingDetails.getCarRentals() == null) {
                existingBookingDetails.setCarRentals(new ArrayList<>());
            }
            existingBookingDetails.getCarRentals().add(convertToCarRental(bookingDTO));
        } else if (bookingType == TravelBookingDTO.BookingType.OTHER) {
            if (existingBookingDetails.getOtherBookings() == null) {
                existingBookingDetails.setOtherBookings(new ArrayList<>());
            }
            existingBookingDetails.getOtherBookings().add(convertToOtherBooking(bookingDTO));
        } else {
            throw new WorkflowException("Unknown booking type: " + bookingType);
        }

        Double currentTotal = existingBookingDetails.getTotalBookingAmount() != null ? 
                existingBookingDetails.getTotalBookingAmount() : 0.0;
        Double newBookingAmount = bookingDTO.getBookingAmount() != null ? bookingDTO.getBookingAmount() : 0.0;
        existingBookingDetails.setTotalBookingAmount(currentTotal + newBookingAmount);

        workflow.setBookingDetails(convertBookingDetailsToJson(existingBookingDetails));
        workflow.setTotalBookingAmount(existingBookingDetails.getTotalBookingAmount());

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(ROLE_TRAVEL_DESK)
                .approverId(travelDeskId)
                .action("ADD_BOOKING")
                .step(STEP_TRAVEL_DESK_BOOKING)
                .comments("Added " + bookingDTO.getBookingType() + " booking: " + bookingDTO.getDetails())
                .actionTakenAt(LocalDateTime.now())
                .build());

        workflowRepository.save(workflow);
        
        log.info("✅ Booking added to workflow {} by travel desk {}", workflowId, travelDeskId);
        return bookingDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelBookingDTO> getBookingsForWorkflow(UUID workflowId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        BookingDetailsDTO bookingDetails = convertJsonToBookingDetails(workflow.getBookingDetails());
        if (bookingDetails == null) {
            return List.of();
        }

        List<TravelBookingDTO> allBookings = new ArrayList<>();
        
        if (bookingDetails.getFlightBookings() != null) {
            bookingDetails.getFlightBookings().forEach(fb -> 
                allBookings.add(convertFromFlightBooking(fb, TravelBookingDTO.BookingType.FLIGHT)));
        }
        
        if (bookingDetails.getHotelBookings() != null) {
            bookingDetails.getHotelBookings().forEach(hb -> 
                allBookings.add(convertFromHotelBooking(hb, TravelBookingDTO.BookingType.HOTEL)));
        }
        
        if (bookingDetails.getCarRentals() != null) {
            bookingDetails.getCarRentals().forEach(cr -> 
                allBookings.add(convertFromCarRental(cr, TravelBookingDTO.BookingType.CAR_RENTAL)));
        }
        
        if (bookingDetails.getOtherBookings() != null) {
            bookingDetails.getOtherBookings().forEach(ob -> 
                allBookings.add(convertFromOtherBooking(ob, TravelBookingDTO.BookingType.OTHER)));
        }

        return allBookings;
    }

    @Override
    @Transactional
    public TravelBookingDTO updateBookingStatus(UUID workflowId, UUID bookingId, String status, UUID travelDeskId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STEP_TRAVEL_DESK_BOOKING.equals(workflow.getCurrentStep())) {
            throw new WorkflowException("Cannot update booking status. Workflow is not in TRAVEL_DESK_BOOKING step.");
        }

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(ROLE_TRAVEL_DESK)
                .approverId(travelDeskId)
                .action("UPDATE_BOOKING_STATUS")
                .step(STEP_TRAVEL_DESK_BOOKING)
                .comments("Updated booking status to: " + status)
                .actionTakenAt(LocalDateTime.now())
                .build());

        log.info("✅ Booking status updated for workflow {} by travel desk {}", workflowId, travelDeskId);
        
        return TravelBookingDTO.builder()
                .status(status)
                .build();
    }

    @Override
    @Transactional
    public void deleteBookingFromWorkflow(UUID workflowId, UUID bookingId, UUID travelDeskId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        if (!STEP_TRAVEL_DESK_BOOKING.equals(workflow.getCurrentStep())) {
            throw new WorkflowException("Cannot delete booking. Workflow is not in TRAVEL_DESK_BOOKING step.");
        }

        actionRepository.save(ApprovalAction.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole(ROLE_TRAVEL_DESK)
                .approverId(travelDeskId)
                .action("DELETE_BOOKING")
                .step(STEP_TRAVEL_DESK_BOOKING)
                .comments("Deleted booking from workflow")
                .actionTakenAt(LocalDateTime.now())
                .build());

        log.info("✅ Booking deleted from workflow {} by travel desk {}", workflowId, travelDeskId);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowBookingStatsDTO getWorkflowBookingStats(UUID workflowId) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException(MSG_WORKFLOW_NOT_FOUND));

        BookingDetailsDTO bookingDetails = convertJsonToBookingDetails(workflow.getBookingDetails());
        
        int totalBookings = calculateTotalBookings(bookingDetails);
        Double totalAmount = workflow.getTotalBookingAmount() != null ? workflow.getTotalBookingAmount() : 0.0;
        
        Map<String, Integer> bookingsByType = new HashMap<>();
        if (bookingDetails != null) {
            if (bookingDetails.getFlightBookings() != null) {
                bookingsByType.put("FLIGHT", bookingDetails.getFlightBookings().size());
            }
            if (bookingDetails.getHotelBookings() != null) {
                bookingsByType.put("HOTEL", bookingDetails.getHotelBookings().size());
            }
            if (bookingDetails.getCarRentals() != null) {
                bookingsByType.put("CAR_RENTAL", bookingDetails.getCarRentals().size());
            }
            if (bookingDetails.getOtherBookings() != null) {
                bookingsByType.put("OTHER", bookingDetails.getOtherBookings().size());
            }
        }
        
        Map<String, Integer> bookingsByStatus = new HashMap<>();
        bookingsByStatus.put("CONFIRMED", totalBookings);
        
        return WorkflowBookingStatsDTO.builder()
                .workflowId(workflowId)
                .travelRequestId(workflow.getTravelRequestId())
                .totalBookings(totalBookings)
                .totalBookingAmount(totalAmount)
                .bookingsByType(bookingsByType)
                .bookingsByStatus(bookingsByStatus)
                .pendingBookings(0)
                .confirmedBookings(totalBookings)
                .cancelledBookings(0)
                .build();
    }

    // ============ BOOKING CONVERSION HELPER METHODS ============

    private BookingDetailsDTO.FlightBookingDTO convertToFlightBooking(TravelBookingDTO bookingDTO) {
        return BookingDetailsDTO.FlightBookingDTO.builder()
                .airline(extractAirlineFromDetails(bookingDTO.getDetails()))
                .flightNumber(extractFlightNumberFromDetails(bookingDTO.getDetails()))
                .departureAirport("")
                .arrivalAirport("")
                .departureDate(bookingDTO.getBookingDate() != null ? bookingDTO.getBookingDate().toString() : "")
                .arrivalDate("")
                .amount(bookingDTO.getBookingAmount())
                .bookingReference(bookingDTO.getBookingReference())
                .status(bookingDTO.getStatus())
                .build();
    }

    private BookingDetailsDTO.HotelBookingDTO convertToHotelBooking(TravelBookingDTO bookingDTO) {
        return BookingDetailsDTO.HotelBookingDTO.builder()
                .hotelName(extractHotelNameFromDetails(bookingDTO.getDetails()))
                .location("")
                .checkInDate("")
                .checkOutDate("")
                .numberOfNights(1)
                .amount(bookingDTO.getBookingAmount())
                .bookingReference(bookingDTO.getBookingReference())
                .status(bookingDTO.getStatus())
                .build();
    }

    private BookingDetailsDTO.CarRentalDTO convertToCarRental(TravelBookingDTO bookingDTO) {
        return BookingDetailsDTO.CarRentalDTO.builder()
                .rentalCompany(extractRentalCompanyFromDetails(bookingDTO.getDetails()))
                .carType("")
                .pickupDate("")
                .dropoffDate("")
                .pickupLocation("")
                .amount(bookingDTO.getBookingAmount())
                .bookingReference(bookingDTO.getBookingReference())
                .status(bookingDTO.getStatus())
                .build();
    }

    private BookingDetailsDTO.OtherBookingDTO convertToOtherBooking(TravelBookingDTO bookingDTO) {
        return BookingDetailsDTO.OtherBookingDTO.builder()
                .type(bookingDTO.getBookingType().name())
                .description(bookingDTO.getDetails())
                .date(bookingDTO.getBookingDate() != null ? bookingDTO.getBookingDate().toString() : "")
                .amount(bookingDTO.getBookingAmount())
                .bookingReference(bookingDTO.getBookingReference())
                .status(bookingDTO.getStatus())
                .build();
    }

    private TravelBookingDTO convertFromFlightBooking(BookingDetailsDTO.FlightBookingDTO flightBooking, TravelBookingDTO.BookingType type) {
        return TravelBookingDTO.builder()
                .bookingType(type)
                .details(String.format("%s %s - %s to %s", 
                        flightBooking.getAirline(), 
                        flightBooking.getFlightNumber(),
                        flightBooking.getDepartureAirport(),
                        flightBooking.getArrivalAirport()))
                .bookingReference(flightBooking.getBookingReference())
                .bookingAmount(flightBooking.getAmount())
                .status(flightBooking.getStatus())
                .build();
    }

    private TravelBookingDTO convertFromHotelBooking(BookingDetailsDTO.HotelBookingDTO hotelBooking, TravelBookingDTO.BookingType type) {
        return TravelBookingDTO.builder()
                .bookingType(type)
                .details(String.format("%s - %s", 
                        hotelBooking.getHotelName(), 
                        hotelBooking.getLocation()))
                .bookingReference(hotelBooking.getBookingReference())
                .bookingAmount(hotelBooking.getAmount())
                .status(hotelBooking.getStatus())
                .build();
    }

    private TravelBookingDTO convertFromCarRental(BookingDetailsDTO.CarRentalDTO carRental, TravelBookingDTO.BookingType type) {
        return TravelBookingDTO.builder()
                .bookingType(type)
                .details(String.format("%s - %s", 
                        carRental.getRentalCompany(), 
                        carRental.getCarType()))
                .bookingReference(carRental.getBookingReference())
                .bookingAmount(carRental.getAmount())
                .status(carRental.getStatus())
                .build();
    }

    private TravelBookingDTO convertFromOtherBooking(BookingDetailsDTO.OtherBookingDTO otherBooking, TravelBookingDTO.BookingType type) {
        return TravelBookingDTO.builder()
                .bookingType(type)
                .details(otherBooking.getDescription())
                .bookingReference(otherBooking.getBookingReference())
                .bookingAmount(otherBooking.getAmount())
                .status(otherBooking.getStatus())
                .build();
    }

    // Simple extraction methods
    private String extractAirlineFromDetails(String details) {
        if (details == null) return "Unknown Airline";
        return details.split(" ")[0];
    }

    private String extractFlightNumberFromDetails(String details) {
        if (details == null) return "";
        String[] parts = details.split(" ");
        for (String part : parts) {
            if (part.matches(".*\\d+.*")) {
                return part;
            }
        }
        return "";
    }

    private String extractHotelNameFromDetails(String details) {
        if (details == null) return "Unknown Hotel";
        return details.split("-")[0].trim();
    }

    private String extractRentalCompanyFromDetails(String details) {
        if (details == null) return "Unknown Rental Company";
        return details.split("-")[0].trim();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ApprovalHistoryDTO> getApprovalHistory(UUID approverId, LocalDateTime startDate, LocalDateTime endDate) {
        // Set default values if dates are not provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30); // Default: last 30 days
        }
        if (endDate == null) {
            endDate = LocalDateTime.now(); // Default: current time
        }
        
        // Validate date range
        if (startDate.isAfter(endDate)) {
            throw new WorkflowException("Start date cannot be after end date");
        }
        
        // Optional: Set maximum date range (e.g., 1 year)
        if (startDate.isBefore(LocalDateTime.now().minusYears(1))) {
            startDate = LocalDateTime.now().minusYears(1);
            log.warn("Date range limited to maximum 1 year for performance reasons");
        }
        
        List<ApprovalAction> actions = actionRepository.findByApproverIdAndActionTakenAtBetween(
                approverId, startDate, endDate);
        
        log.info("Retrieved {} approval actions for approver {} between {} and {}", 
                actions.size(), approverId, startDate, endDate);
        
        return actions.stream()
                .map(this::mapToApprovalHistoryDTO)
                .sorted((a1, a2) -> a2.getActionTakenAt().compareTo(a1.getActionTakenAt())) // Most recent first
                .toList();
    }

    private ApprovalHistoryDTO mapToApprovalHistoryDTO(ApprovalAction action) {
        ApprovalWorkflow workflow = workflowRepository.findById(action.getWorkflowId()).orElse(null);
        TravelRequestProxyDTO travelRequest = null;
        EmployeeProxyDTO employee = null;
        
        if (workflow != null) {
            try {
                travelRequest = fetchTravelRequestSafe(workflow.getTravelRequestId());
                if (travelRequest != null) {
                    employee = fetchEmployeeSafe(travelRequest.employeeId());
                }
            } catch (Exception e) {
                log.warn("Failed to fetch details for action {}: {}", action.getActionId(), e.getMessage());
            }
        }
        
        return ApprovalHistoryDTO.builder()
                .actionId(action.getActionId())
                .workflowId(action.getWorkflowId())
                .travelRequestId(action.getTravelRequestId())
                .approverRole(action.getApproverRole())
                .action(action.getAction())
                .step(action.getStep())
                .comments(action.getComments())
                .actionTakenAt(action.getActionTakenAt())
                .employeeName(employee != null ? employee.getFullName() : "Unknown Employee")
                .travelPurpose(travelRequest != null ? travelRequest.purpose() : "Unknown Purpose")
                .estimatedCost(workflow != null ? workflow.getEstimatedCost() : null)
                .amountApproved(action.getAmountApproved())
                .escalationReason(action.getEscalationReason())
                .build();
    }

 // Add to your ApprovalWorkflowServiceImpl
    @Override
    @Transactional(readOnly = true)
    public List<TravelDeskHistoryDTO> getTravelDeskHistory(UUID travelDeskId, LocalDateTime startDate, LocalDateTime endDate) {
        // Set default date range if not provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        List<ApprovalAction> actions = actionRepository.findTravelDeskActionsByUserAndDateRange(
                travelDeskId, startDate, endDate);
        
        log.info("Retrieved {} travel desk actions for user {} between {} and {}", 
                actions.size(), travelDeskId, startDate, endDate);
        
        return actions.stream()
                .map(this::mapToTravelDeskHistoryDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelDeskHistoryDTO> getTravelDeskActionsByRequest(UUID travelRequestId) {
        List<ApprovalAction> actions = actionRepository.findByApproverRoleAndTravelRequestIdOrderByActionTakenAtDesc(
                "TRAVEL_DESK", travelRequestId);
        
        return actions.stream()
                .map(this::mapToTravelDeskHistoryDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelDeskHistoryDTO> getAllTravelDeskActivities(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        List<ApprovalAction> actions = actionRepository.findTravelDeskActionsByDateRange(startDate, endDate);
        
        return actions.stream()
                .map(this::mapToTravelDeskHistoryDTO)
                .toList();
    }

    private TravelDeskHistoryDTO mapToTravelDeskHistoryDTO(ApprovalAction action) {
        // Fetch additional context
        ApprovalWorkflow workflow = workflowRepository.findById(action.getWorkflowId()).orElse(null);
        TravelRequestProxyDTO travelRequest = null;
        EmployeeProxyDTO employee = null;
        
        if (workflow != null) {
            try {
                travelRequest = fetchTravelRequestSafe(workflow.getTravelRequestId());
                if (travelRequest != null) {
                    employee = fetchEmployeeSafe(travelRequest.employeeId());
                }
            } catch (Exception e) {
                log.warn("Failed to fetch details for action {}: {}", action.getActionId(), e.getMessage());
            }
        }
        
        return TravelDeskHistoryDTO.builder()
                .actionId(action.getActionId())
                .workflowId(action.getWorkflowId())
                .travelRequestId(action.getTravelRequestId())
                .approverName(action.getApproverName())
                .action(action.getAction())
                .step(action.getStep())
                .comments(action.getComments())
                .actionTakenAt(action.getActionTakenAt())
                .isEscalated(action.getIsEscalated())
                .escalationReason(action.getEscalationReason())
                .amountApproved(action.getAmountApproved())
                .reimbursementAmount(action.getReimbursementAmount())
                .employeeName(employee != null ? employee.getFullName() : "Unknown Employee")
                .travelPurpose(travelRequest != null ? travelRequest.purpose() : "Unknown Purpose")
                .estimatedCost(workflow != null ? workflow.getEstimatedCost() : null)
                .build();
    }



    @Override
    @Transactional(readOnly = true)
    public TravelDeskStatsDTO getTravelDeskStats(UUID travelDeskId, LocalDateTime startDate, LocalDateTime endDate) {
        // Set default date range if not provided
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        List<ApprovalAction> actions = actionRepository.findTravelDeskActionsByUserAndDateRange(
                travelDeskId, startDate, endDate);
        
        if (actions.isEmpty()) {
            return TravelDeskStatsDTO.builder()
                    .travelDeskId(travelDeskId)
                    .totalActions(0L)
                    .approvals(0L)
                    .rejections(0L)
                    .bookingsCompleted(0L)
                    .overpricedMarkings(0L)
                    .build();
        }
        
        long approvals = actions.stream().filter(a -> "APPROVE".equals(a.getAction())).count();
        long rejections = actions.stream().filter(a -> "REJECT".equals(a.getAction())).count();
        long bookingsCompleted = actions.stream().filter(a -> "COMPLETE_BOOKING".equals(a.getAction())).count();
        long overpricedMarkings = actions.stream()
                .filter(a -> a.getComments() != null && a.getComments().toLowerCase().contains("overpriced"))
                .count();
        
        LocalDateTime firstAction = actions.stream()
                .map(ApprovalAction::getActionTakenAt)
                .min(LocalDateTime::compareTo)
                .orElse(null);
        LocalDateTime lastAction = actions.stream()
                .map(ApprovalAction::getActionTakenAt)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        
        return TravelDeskStatsDTO.builder()
                .travelDeskId(travelDeskId)
                .totalActions((long) actions.size())
                .approvals(approvals)
                .rejections(rejections)
                .bookingsCompleted(bookingsCompleted)
                .overpricedMarkings(overpricedMarkings)
                .firstAction(firstAction)
                .lastAction(lastAction)
                .build();
    }
    
    
    @Override
    @Transactional
    public ApprovalWorkflowDTO progressToTravelDeskReview(UUID workflowId, UUID submittedBy, String action) {
        log.info("Progressing workflow {} to Travel Desk for bill review, submitted by: {}", workflowId, submittedBy);
        
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));
        
        // Validate current state - should be in employee bill submission stage
        if (!"EMPLOYEE_BILL_UPLOAD".equals(workflow.getCurrentStep())) {
            throw new IllegalStateException("Workflow not in bill submission stage. Current step: " + workflow.getCurrentStep());
        }
        
        // Progress to Travel Desk bill review step
        workflow.setCurrentStep("TRAVEL_DESK_BILL_REVIEW");
        workflow.setStatus("PENDING_BILL_REVIEW"); // ✅ Fixed: Use 'status' instead of 'currentStatus'
        workflow.setCurrentApproverRole("TRAVEL_DESK");
        
        // Determine Travel Desk approver
        TravelRequestProxyDTO travelRequest = fetchTravelRequestSafe(workflow.getTravelRequestId());
        UUID travelDeskApproverId = determineApproverId(
            WorkflowConfiguration.builder()
                .approverRole("TRAVEL_DESK")
                .stepName("TRAVEL_DESK_BILL_REVIEW")
                .build(),
            travelRequest
        );
        workflow.setCurrentApproverId(travelDeskApproverId);
        
        // Record the action in history
        ApprovalAction approvalAction = ApprovalAction.builder()
                .workflowId(workflow.getWorkflowId()) // ✅ Fixed: Use workflowId
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole("EMPLOYEE")
                .approverId(submittedBy)
                .action("BILLS_SUBMITTED")
                .step("TRAVEL_DESK_BILL_REVIEW")
                .comments("Bills submitted for Travel Desk review")
                .actionTakenAt(LocalDateTime.now())
                .build();
        actionRepository.save(approvalAction);
        
        ApprovalWorkflow updatedWorkflow = workflowRepository.save(workflow);
        
        // Send notification to Travel Desk
        sendNextApprovalNotification(updatedWorkflow);
        
        log.info("Workflow {} progressed to Travel Desk bill review successfully. Assigned to: {}", 
                workflowId, travelDeskApproverId);
        
        return mapper.toDto(updatedWorkflow);
    }
    
    @Override
    @Transactional
    public ApprovalWorkflowDTO reviewBills(UUID workflowId, UUID travelDeskId, boolean approved, String comments) {
        log.info("Travel Desk {} reviewing bills for workflow {}: approved={}", travelDeskId, workflowId, approved);
        
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));
        
        // Validate current state - should be in Travel Desk bill review stage
        if (!"TRAVEL_DESK_BILL_REVIEW".equals(workflow.getCurrentStep())) {
            throw new IllegalStateException("Workflow not in Travel Desk bill review stage");
        }
        
        // Validate Travel Desk authorization
        if (!travelDeskId.equals(workflow.getCurrentApproverId())) {
            throw new WorkflowException("Travel Desk user not authorized to review these bills");
        }
        
        String action = approved ? "APPROVE_BILLS" : "REJECT_BILLS";
        String reviewComments = comments != null ? comments : 
            (approved ? "Bills approved by Travel Desk" : "Bills rejected by Travel Desk");
        
        // Record the review action
        ApprovalAction approvalAction = ApprovalAction.builder()
                .workflowId(workflow.getWorkflowId())
                .travelRequestId(workflow.getTravelRequestId())
                .approverRole("TRAVEL_DESK")
                .approverId(travelDeskId)
                .action(action)
                .step("TRAVEL_DESK_BILL_REVIEW")
                .comments(reviewComments)
                .actionTakenAt(LocalDateTime.now())
                .build();
        actionRepository.save(approvalAction);
        
        if (approved) {
            // Progress to next step (Finance approval for bills)
            progressToNextStepAfterBillReview(workflow);
        } else {
            // Reject the bills and return to employee
            handleBillRejection(workflow, reviewComments);
        }
        
        ApprovalWorkflow updatedWorkflow = workflowRepository.save(workflow);
        log.info("Travel Desk bill review completed for workflow {}: {}", workflowId, approved ? "APPROVED" : "REJECTED");
        
        return mapper.toDto(updatedWorkflow);
    }

    private void progressToNextStepAfterBillReview(ApprovalWorkflow workflow) {
        List<WorkflowConfiguration> configs = configRepository
                .findByWorkflowTypeAndIsActiveTrueOrderBySequenceOrder(workflow.getWorkflowType());
        
        // For POST_TRAVEL workflow, go to Finance approval after Travel Desk review
        WorkflowConfiguration nextStep = configs.stream()
                .filter(c -> "FINANCE_REIMBURSEMENT".equals(c.getStepName()))
                .findFirst()
                .orElseThrow(() -> new WorkflowException("Finance approval step not found"));
        
        workflow.setPreviousStep(workflow.getCurrentStep());
        workflow.setCurrentStep(nextStep.getStepName());
        workflow.setCurrentApproverRole(nextStep.getApproverRole());
        workflow.setCurrentApproverId(determineApproverId(nextStep, fetchTravelRequestSafe(workflow.getTravelRequestId())));
        workflow.setNextStep(getNextStep(configs, findCurrentStepIndex(configs, nextStep.getStepName())));
        workflow.setDueDate(calculateDueDate(nextStep));
        workflow.setStatus("PENDING");
        
        sendNextApprovalNotification(workflow);
    }

    private void handleBillRejection(ApprovalWorkflow workflow, String comments) {
        // Return to employee for bill correction
        workflow.setCurrentStep("EMPLOYEE_BILL_UPLOAD");
        workflow.setCurrentApproverRole("EMPLOYEE");
        workflow.setCurrentApproverId(workflow.getTravelRequestId()); // Employee who submitted
        workflow.setStatus("RETURNED_FOR_CORRECTION");
        
        // Notify employee about bill rejection
        sendBillRejectionNotification(workflow, comments);
    }

    @Async
    void sendBillRejectionNotification(ApprovalWorkflow workflow, String comments) {
        try {
            NotificationRequestDTO notification = NotificationRequestDTO.builder()
                    .userId(workflow.getCurrentApproverId()) // Employee ID
                    .subject("Bills Returned for Correction")
                    .message("Your submitted bills require correction. Comments: " + comments)
                    .notificationType("BILLS_RETURNED")
                    .referenceId(workflow.getTravelRequestId())
                    .referenceType("TRAVEL_REQUEST")
                    .build();
            notificationClient.sendNotification(notification);
        } catch (Exception e) {
            log.warn("Failed to send bill rejection notification: {}", e.getMessage());
        }
    }
    
    
    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowDTO> getPendingBillReviewsForTravelDesk() {
        List<ApprovalWorkflow> workflows = workflowRepository.findPendingBillReviewsForTravelDesk();
        log.info("Found {} pending bill reviews for Travel Desk", workflows.size());
        return workflows.stream().map(mapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowDTO> getPendingBillReviewsByTravelDeskId(UUID travelDeskId) {
        List<ApprovalWorkflow> workflows = workflowRepository.findPendingBillReviewsByTravelDeskId(travelDeskId);
        log.info("Found {} pending bill reviews for Travel Desk user {}", workflows.size(), travelDeskId);
        return workflows.stream().map(mapper::toDto).toList();
    }
    
}