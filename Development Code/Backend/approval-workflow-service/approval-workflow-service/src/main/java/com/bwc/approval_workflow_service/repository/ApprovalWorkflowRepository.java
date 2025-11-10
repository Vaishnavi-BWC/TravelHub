//package com.bwc.approval_workflow_service.repository;
//
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;
//
//@Repository
//public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, UUID> {
//
//    Optional<ApprovalWorkflow> findByTravelRequestId(UUID travelRequestId);
//
//    // ✅ Add this new method
//    Optional<ApprovalWorkflow> findByTravelRequestIdAndWorkflowType(UUID travelRequestId, String workflowType);
//
//    List<ApprovalWorkflow> findByCurrentApproverRoleAndStatus(String approverRole, String status);
//    List<ApprovalWorkflow> findByCurrentApproverIdAndStatus(UUID approverId, String status);
//    List<ApprovalWorkflow> findByStatus(String status);
//    List<ApprovalWorkflow> findByWorkflowTypeAndStatus(String workflowType, String status);
//
//    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.currentApproverRole = :role AND w.status = 'PENDING'")
//    List<ApprovalWorkflow> findPendingByApproverRole(@Param("role") String role);
//
//    long countByStatus(String status);
//    long countByCurrentApproverRoleAndStatus(String approverRole, String status);
//
//    List<ApprovalWorkflow> findByStatusAndCurrentStep(String status, String currentStep);
//    
//    // Add this method for metrics
//    long count();
//    
//    
//    
//
//    @Query("SELECT w.currentApproverId, COUNT(w) FROM ApprovalWorkflow w " +
//            "WHERE w.currentApproverId IN :approverIds AND w.status = 'PENDING' " +
//            "GROUP BY w.currentApproverId")
//     List<Object[]> countPendingApprovalsByApproverIds(@Param("approverIds") List<UUID> approverIds);
//     
//     default Map<UUID, Long> getPendingApprovalsCountByApproverIds(List<UUID> approverIds) {
//         List<Object[]> results = countPendingApprovalsByApproverIds(approverIds);
//         return results.stream()
//                 .collect(Collectors.toMap(
//                     obj -> (UUID) obj[0],
//                     obj -> (Long) obj[1]
//                 ));
//     }
//     
//     
//     // ✅ Add this method to find workflows by current step and status
//     List<ApprovalWorkflow> findByCurrentStepAndStatus(String currentStep, String status);
//     
//     // ✅ Add this method to find Travel Desk pending bill reviews
//     @Query("SELECT w FROM ApprovalWorkflow w WHERE w.currentStep = 'TRAVEL_DESK_BILL_REVIEW' AND w.status = 'PENDING_BILL_REVIEW' AND w.currentApproverRole = 'TRAVEL_DESK'")
//     List<ApprovalWorkflow> findPendingBillReviewsForTravelDesk();
//     
//     // ✅ Add this method to find specific Travel Desk user's pending bill reviews
//     @Query("SELECT w FROM ApprovalWorkflow w WHERE w.currentStep = 'TRAVEL_DESK_BILL_REVIEW' AND w.status = 'PENDING_BILL_REVIEW' AND w.currentApproverId = :travelDeskId")
//     List<ApprovalWorkflow> findPendingBillReviewsByTravelDeskId(@Param("travelDeskId") UUID travelDeskId);
//     
//     
//     @Query("SELECT w FROM ApprovalWorkflow w LEFT JOIN FETCH w.steps WHERE w.workflowId = :workflowId")
//     Optional<ApprovalWorkflow> findByIdWithSteps(@Param("workflowId") UUID workflowId);
//     
//     
//     @Query("""
//    		    SELECT DISTINCT w FROM ApprovalWorkflow w
//    		    LEFT JOIN FETCH w.steps s
//    		    LEFT JOIN FETCH s.actorActions
//    		    WHERE w.workflowId = :workflowId
//    		    """)
//    		Optional<ApprovalWorkflow> findByIdWithStepsAndActions(@Param("workflowId") UUID workflowId);
//
//}


package com.bwc.approval_workflow_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, UUID> {

	@Query("""
		    SELECT DISTINCT w 
		    FROM ApprovalWorkflow w
		    LEFT JOIN FETCH w.steps s
		    LEFT JOIN FETCH s.actorActions
		    WHERE w.workflowId = :workflowId
		    """)
		Optional<ApprovalWorkflow> findByIdWithStepsAndActions(@Param("workflowId") UUID workflowId);


    // Add this missing method
    Optional<ApprovalWorkflow> findByTravelRequestIdAndWorkflowType(UUID travelRequestId, String workflowType);


    // Find workflows pending approval for a specific role
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.currentApproverRole = :approverRole AND w.status = 'IN_PROGRESS'")
    List<ApprovalWorkflow> findPendingApprovalsByRole(@Param("approverRole") String approverRole);
    
    // Find workflows where user has taken action
    @Query("SELECT DISTINCT w FROM ApprovalWorkflow w JOIN w.steps s JOIN s.actorActions a WHERE a.actorId = :actorId")
    List<ApprovalWorkflow> findWorkflowsWithUserActions(@Param("actorId") UUID actorId);
    
    // Find workflows with exceptions raised by user
    @Query("SELECT DISTINCT w FROM ApprovalWorkflow w JOIN w.steps s JOIN s.actorActions a JOIN a.exceptions e WHERE e.raisedById = :userId")
    List<ApprovalWorkflow> findWorkflowsWithUserExceptions(@Param("userId") UUID userId);
    
    // Find workflows awaiting clarification
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.status LIKE '%CLARIFICATION%' AND w.currentApproverRole = :role")
    List<ApprovalWorkflow> findAwaitingClarificationByRole(@Param("role") String role);
    
    // Find returned requests
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.status LIKE '%RETURNED%' AND w.currentApproverRole = :role")
    List<ApprovalWorkflow> findReturnedRequestsByRole(@Param("role") String role);



}