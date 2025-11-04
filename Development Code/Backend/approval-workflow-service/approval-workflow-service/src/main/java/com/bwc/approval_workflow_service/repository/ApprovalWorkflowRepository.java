package com.bwc.approval_workflow_service.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bwc.approval_workflow_service.entity.ApprovalWorkflow;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, UUID> {

    Optional<ApprovalWorkflow> findByTravelRequestId(UUID travelRequestId);

    // ✅ Add this new method
    Optional<ApprovalWorkflow> findByTravelRequestIdAndWorkflowType(UUID travelRequestId, String workflowType);

    List<ApprovalWorkflow> findByCurrentApproverRoleAndStatus(String approverRole, String status);
    List<ApprovalWorkflow> findByCurrentApproverIdAndStatus(UUID approverId, String status);
    List<ApprovalWorkflow> findByStatus(String status);
    List<ApprovalWorkflow> findByWorkflowTypeAndStatus(String workflowType, String status);

    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.currentApproverRole = :role AND w.status = 'PENDING'")
    List<ApprovalWorkflow> findPendingByApproverRole(@Param("role") String role);

    long countByStatus(String status);
    long countByCurrentApproverRoleAndStatus(String approverRole, String status);

    List<ApprovalWorkflow> findByStatusAndCurrentStep(String status, String currentStep);
    
    // Add this method for metrics
    long count();
    
    
    

    @Query("SELECT w.currentApproverId, COUNT(w) FROM ApprovalWorkflow w " +
            "WHERE w.currentApproverId IN :approverIds AND w.status = 'PENDING' " +
            "GROUP BY w.currentApproverId")
     List<Object[]> countPendingApprovalsByApproverIds(@Param("approverIds") List<UUID> approverIds);
     
     default Map<UUID, Long> getPendingApprovalsCountByApproverIds(List<UUID> approverIds) {
         List<Object[]> results = countPendingApprovalsByApproverIds(approverIds);
         return results.stream()
                 .collect(Collectors.toMap(
                     obj -> (UUID) obj[0],
                     obj -> (Long) obj[1]
                 ));
     }
}
