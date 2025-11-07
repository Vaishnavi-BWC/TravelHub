package com.bwc.approval_workflow_service.repository;

import com.bwc.approval_workflow_service.entity.StepException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StepExceptionRepository extends JpaRepository<StepException, UUID> {
    
    @Query("SELECT e FROM StepException e WHERE e.raisedById = :userId ORDER BY e.raisedAt DESC")
    List<StepException> findExceptionsByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT e FROM StepException e JOIN e.action a JOIN a.step s JOIN s.workflow w WHERE w.workflowId = :workflowId ORDER BY e.raisedAt DESC")
    List<StepException> findExceptionsByWorkflowId(@Param("workflowId") UUID workflowId);
    
    @Query("SELECT e FROM StepException e WHERE e.raisedByRole = :role ORDER BY e.raisedAt DESC")
    List<StepException> findExceptionsByRole(@Param("role") String role);
}