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

    // ✅ Fetch workflow with steps and actions (detailed view)
    @Query("""
        SELECT DISTINCT w 
        FROM ApprovalWorkflow w
        LEFT JOIN FETCH w.steps s
        LEFT JOIN FETCH s.actorActions
        WHERE w.workflowId = :workflowId
    """)
    Optional<ApprovalWorkflow> findByIdWithStepsAndActions(@Param("workflowId") UUID workflowId);


    // ✅ Find by travel request ID and workflow type
    Optional<ApprovalWorkflow> findByTravelRequestIdAndWorkflowType(UUID travelRequestId, String workflowType);


    // ✅ Find workflows currently in progress for a given role
    @Query("""
        SELECT w 
        FROM ApprovalWorkflow w 
        WHERE w.currentApproverRole = :approverRole 
          AND w.status = 'IN_PROGRESS'
    """)
    List<ApprovalWorkflow> findPendingApprovalsByRole(@Param("approverRole") String approverRole);


    // ✅ Find workflows where a user has taken some action
    @Query("""
        SELECT DISTINCT w 
        FROM ApprovalWorkflow w 
        JOIN w.steps s 
        JOIN s.actorActions a 
        WHERE a.actorId = :actorId
    """)
    List<ApprovalWorkflow> findWorkflowsWithUserActions(@Param("actorId") UUID actorId);


    // ✅ Find workflows with exceptions raised by a specific user
    @Query("""
        SELECT DISTINCT w 
        FROM ApprovalWorkflow w 
        JOIN w.steps s 
        JOIN s.actorActions a 
        JOIN a.exceptions e 
        WHERE e.raisedById = :userId
    """)
    List<ApprovalWorkflow> findWorkflowsWithUserExceptions(@Param("userId") UUID userId);


    // ✅ Find workflows awaiting clarification for a role
    @Query("""
        SELECT w 
        FROM ApprovalWorkflow w 
        WHERE w.status LIKE '%CLARIFICATION%' 
          AND w.currentApproverRole = :role
    """)
    List<ApprovalWorkflow> findAwaitingClarificationByRole(@Param("role") String role);


    @Query("""
        SELECT w 
        FROM ApprovalWorkflow w 
        WHERE w.status LIKE '%RETURNED%' 
          AND w.currentApproverRole = :role
    """)
    List<ApprovalWorkflow> findReturnedRequestsByRole(@Param("role") String role);


    @Query("""
    	    SELECT DISTINCT w, e.reason, e.raisedAt 
    	    FROM ApprovalWorkflow w
    	    JOIN w.steps s
    	    JOIN s.actorActions a
    	    JOIN a.exceptions e
    	    WHERE w.status = 'IN_PROGRESS'
    	      AND w.currentApproverRole = :role
    	    ORDER BY e.raisedAt DESC
    	""")
    	List<Object[]> findPendingWorkflowsWithExceptionsByRole(@Param("role") String role);

}
