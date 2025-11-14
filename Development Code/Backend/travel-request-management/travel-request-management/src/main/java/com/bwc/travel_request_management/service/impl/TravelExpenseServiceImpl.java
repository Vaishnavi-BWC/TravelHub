package com.bwc.travel_request_management.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bwc.travel_request_management.client.WorkflowServiceClient;
import com.bwc.travel_request_management.dto.TravelExpenseDTO;
import com.bwc.travel_request_management.entity.TravelExpense;
import com.bwc.travel_request_management.entity.TravelRequest;
import com.bwc.travel_request_management.exception.ResourceNotFoundException;
import com.bwc.travel_request_management.mapper.TravelExpenseMapper;
import com.bwc.travel_request_management.repository.TravelExpenseRepository;
import com.bwc.travel_request_management.repository.TravelRequestRepository;
import com.bwc.travel_request_management.service.TravelExpenseService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TravelExpenseServiceImpl implements TravelExpenseService {

    private final TravelExpenseRepository expenseRepository;
    private final TravelRequestRepository requestRepository;
    private final TravelExpenseMapper mapper;
    private final WorkflowServiceClient workflowServiceClient;

    @Override
    @Transactional
    public TravelExpenseDTO addExpense(UUID requestId, TravelExpenseDTO expenseDto) {
        TravelRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel Request not found with id: " + requestId));

        TravelExpense expense = mapper.toEntity(expenseDto);
        expense.setTravelRequest(request);
        TravelExpense saved = expenseRepository.save(expense);

        return mapper.toDto(saved);
    }


    @Override
    @Transactional(readOnly = true)
    public TravelExpenseDTO getExpense(UUID expenseId) {
        return expenseRepository.findById(expenseId)
                .map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TravelExpenseDTO> getExpensesForRequest(UUID requestId) {
        return expenseRepository.findByTravelRequest_TravelRequestId(requestId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }


    @Override
    @Transactional
    public void deleteExpense(UUID expenseId) {
        if (!expenseRepository.existsById(expenseId)) {
            throw new ResourceNotFoundException("Expense not found with id: " + expenseId);
        }
        expenseRepository.deleteById(expenseId);
    }
}
