//package com.bwc.approval_workflow_service.service;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//import com.bwc.approval_workflow_service.dto.ApprovalActionDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalHistoryDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalRequestDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalStatsDTO;
//import com.bwc.approval_workflow_service.dto.ApprovalWorkflowDTO;
//import com.bwc.approval_workflow_service.dto.BookingDetailsDTO;
//import com.bwc.approval_workflow_service.dto.BookingSummaryDTO;
//import com.bwc.approval_workflow_service.dto.ManagerActionRequestDTO;
//import com.bwc.approval_workflow_service.dto.TravelBookingDTO;
//import com.bwc.approval_workflow_service.dto.TravelDeskHistoryDTO;
//import com.bwc.approval_workflow_service.dto.TravelDeskStatsDTO;
//import com.bwc.approval_workflow_service.dto.TravelRequestProxyDTO;
//import com.bwc.approval_workflow_service.dto.WorkflowBookingStatsDTO;
//import com.bwc.approval_workflow_service.dto.WorkflowMetricsDTO;
//
//public interface ApprovalWorkflowService {
//
//    // Default method for backward compatibility
//    default ApprovalWorkflowDTO initiateWorkflow(UUID travelRequestId) {
//        return initiateWorkflow(travelRequestId, "PRE_TRAVEL", null);
//    }
//    
//    // Existing method (keep for backward compatibility)
//    ApprovalWorkflowDTO initiateWorkflow(UUID travelRequestId, String workflowType, Double estimatedCost);
// 
//    // New optimized method
//    ApprovalWorkflowDTO initiateWorkflow(TravelRequestProxyDTO travelRequest, String workflowType, Double estimatedCost);
//
//    ApprovalWorkflowDTO processApproval(ApprovalRequestDTO approvalRequest);
//
//    ApprovalWorkflowDTO getWorkflowByRequestId(UUID travelRequestId);
//
//    ApprovalWorkflowDTO getWorkflow(UUID workflowId);
//
//    List<ApprovalWorkflowDTO> getPendingApprovals(String approverRole, UUID approverId);
//
//    List<ApprovalWorkflowDTO> getPendingApprovalsByRole(String approverRole);
//
//    List<ApprovalWorkflowDTO> getWorkflowsByStatus(String status);
//
//    List<ApprovalActionDTO> getWorkflowHistory(UUID travelRequestId);
//
//    ApprovalWorkflowDTO escalateWorkflow(UUID workflowId, String reason, UUID escalatedBy);
//
//    ApprovalWorkflowDTO reassignWorkflow(UUID workflowId, String newApproverRole, UUID newApproverId);
//
//    ApprovalWorkflowDTO updateWorkflowPriority(UUID workflowId, String priority);
//
//    WorkflowMetricsDTO getWorkflowMetrics();
//
//    List<ApprovalStatsDTO> getApprovalStatsByApprover(UUID approverId);
//
//    void reloadWorkflowConfigurations();
//
//    ApprovalWorkflowDTO markBookingUploaded(UUID workflowId, UUID uploadedBy);
//    
//    ApprovalWorkflowDTO uploadBills(UUID workflowId, Double actualCost, UUID uploadedBy);
//    
//    /**
//     * Mark bookings as completed and progress workflow to next step
//     */
//    ApprovalWorkflowDTO markBookingCompleted(UUID workflowId, UUID uploadedBy, String comments, BookingDetailsDTO bookingDetails);
//
//    /**
//     * Get booking summary including documents and booking details
//     */
//    BookingSummaryDTO getBookingSummary(UUID workflowId);
//
//    /**
//     * Update booking details without progressing workflow
//     */
//    ApprovalWorkflowDTO updateBookingDetails(UUID workflowId, UUID updatedBy, BookingDetailsDTO bookingDetails, String comments);
//    
//    // Booking Management Methods
//    TravelBookingDTO addBookingToWorkflow(UUID workflowId, UUID travelDeskId, TravelBookingDTO bookingDTO);
//    List<TravelBookingDTO> getBookingsForWorkflow(UUID workflowId);
//    TravelBookingDTO updateBookingStatus(UUID workflowId, UUID bookingId, String status, UUID travelDeskId);
//    void deleteBookingFromWorkflow(UUID workflowId, UUID bookingId, UUID travelDeskId);
//    WorkflowBookingStatsDTO getWorkflowBookingStats(UUID workflowId);
//    
//    /**
//     * Record booking-related actions in workflow
//     */
//    void recordBookingAction(UUID workflowId, UUID travelDeskId, String action, String comments);
//    
//    /**
//     * Mark bookings as completed and progress workflow to next step
//     */
//    ApprovalWorkflowDTO markBookingCompleted(UUID workflowId, UUID travelDeskId, String comments);
//    
//    /**
//     * Get workflows by status and step
//     */
//    List<ApprovalWorkflowDTO> getWorkflowsByStatusAndStep(String status, String step);
//    
//    /**
//     * Get approval history for any approver (generic for all roles)
//     */
//    List<ApprovalHistoryDTO> getApprovalHistory(UUID approverId, LocalDateTime startDate, LocalDateTime endDate);
//    
//    /**
//     * Get travel desk approval history for a specific travel desk user
//     */
//    List<TravelDeskHistoryDTO> getTravelDeskHistory(UUID travelDeskId, LocalDateTime startDate, LocalDateTime endDate);
//    
//    /**
//     * Get travel desk actions for a specific travel request
//     */
//    List<TravelDeskHistoryDTO> getTravelDeskActionsByRequest(UUID travelRequestId);
//    
//    /**
//     * Get all travel desk activities across all travel desk users
//     */
//    List<TravelDeskHistoryDTO> getAllTravelDeskActivities(LocalDateTime startDate, LocalDateTime endDate);
//    
//    /**
//     * Get travel desk statistics
//     */
//    TravelDeskStatsDTO getTravelDeskStats(UUID travelDeskId, LocalDateTime startDate, LocalDateTime endDate);
//
//	ApprovalWorkflowDTO progressToTravelDeskReview(UUID workflowId, UUID submittedBy, String action);
//
//	ApprovalWorkflowDTO reviewBills(UUID workflowId, UUID travelDeskId, boolean approved, String comments);
//
//
//	  /**
//     * Get pending bill reviews for Travel Desk
//     */
//    List<ApprovalWorkflowDTO> getPendingBillReviewsForTravelDesk();
//    
//    /**
//     * Get pending bill reviews assigned to specific Travel Desk user
//     */
//    List<ApprovalWorkflowDTO> getPendingBillReviewsByTravelDeskId(UUID travelDeskId);
//    
//    
//    ApprovalWorkflowDTO takeManagerAction(ManagerActionRequestDTO managerRequest);
//
//
//}