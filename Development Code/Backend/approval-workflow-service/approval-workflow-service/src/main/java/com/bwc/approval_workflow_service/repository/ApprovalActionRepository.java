//package com.bwc.approval_workflow_service.repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import com.bwc.approval_workflow_service.entity.ApprovalAction;
//
//@Repository
//public interface ApprovalActionRepository extends JpaRepository<ApprovalAction, UUID> {
//
//    List<ApprovalAction> findByTravelRequestIdOrderByCreatedAtDesc(UUID travelRequestId);
//    List<ApprovalAction> findByWorkflow_WorkflowIdOrderByCreatedAtDesc(UUID workflowId);
//    List<ApprovalAction> findByTravelRequestIdOrderByActionTakenAtAsc(UUID travelRequestId);
//
//    // Date range filtering method
//    List<ApprovalAction> findByApproverIdAndActionTakenAtBetween(
//        UUID approverId, LocalDateTime startDate, LocalDateTime endDate);
//    
//    // Alternative: Using @Query for more complex filtering
//    @Query("SELECT a FROM ApprovalAction a WHERE a.approverId = :approverId " +
//           "AND a.actionTakenAt BETWEEN :startDate AND :endDate " +
//           "ORDER BY a.actionTakenAt DESC")
//    List<ApprovalAction> findApprovalHistoryByApproverAndDateRange(
//        @Param("approverId") UUID approverId,
//        @Param("startDate") LocalDateTime startDate,
//        @Param("endDate") LocalDateTime endDate);
//    
//    
//    // Travel desk specific queries
//    List<ApprovalAction> findByApproverRoleAndApproverIdOrderByActionTakenAtDesc(String approverRole, UUID approverId);
//    
//    List<ApprovalAction> findByApproverRoleAndActionTakenAtBetweenOrderByActionTakenAtDesc(
//        String approverRole, LocalDateTime startDate, LocalDateTime endDate);
//    
//    List<ApprovalAction> findByApproverRoleAndTravelRequestIdOrderByActionTakenAtDesc(
//        String approverRole, UUID travelRequestId);
//    
//    @Query("SELECT a FROM ApprovalAction a WHERE a.approverRole = 'TRAVEL_DESK' AND a.approverId = :travelDeskId AND a.actionTakenAt BETWEEN :startDate AND :endDate ORDER BY a.actionTakenAt DESC")
//    List<ApprovalAction> findTravelDeskActionsByUserAndDateRange(
//            @Param("travelDeskId") UUID travelDeskId,
//            @Param("startDate") LocalDateTime startDate,
//            @Param("endDate") LocalDateTime endDate);
//
//    @Query("SELECT a FROM ApprovalAction a WHERE a.approverRole = 'TRAVEL_DESK' AND a.actionTakenAt BETWEEN :startDate AND :endDate ORDER BY a.actionTakenAt DESC")
//    List<ApprovalAction> findTravelDeskActionsByDateRange(
//            @Param("startDate") LocalDateTime startDate,
//            @Param("endDate") LocalDateTime endDate);
//    
//    
//    
//}