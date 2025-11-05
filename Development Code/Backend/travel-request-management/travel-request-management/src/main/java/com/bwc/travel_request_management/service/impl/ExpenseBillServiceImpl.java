package com.bwc.travel_request_management.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.bwc.travel_request_management.client.WorkflowServiceClient;
import com.bwc.travel_request_management.dto.ExpenseBillDTO;
import com.bwc.travel_request_management.dto.ExpenseBillSummaryDTO;
import com.bwc.travel_request_management.entity.ExpenseBill;
import com.bwc.travel_request_management.exception.FileStorageException;
import com.bwc.travel_request_management.exception.ResourceNotFoundException;
import com.bwc.travel_request_management.mapper.ExpenseBillMapper;
import com.bwc.travel_request_management.repository.ExpenseBillRepository;
import com.bwc.travel_request_management.service.ExpenseBillService;
import com.bwc.travel_request_management.service.FileStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseBillServiceImpl implements ExpenseBillService {

    private final ExpenseBillRepository billRepository;
    private final FileStorageService fileStorageService;
    private final WorkflowServiceClient workflowServiceClient;
    private final ExpenseBillMapper mapper;

    private static final String BILL_NOT_FOUND = "Expense bill not found with id: ";

    @Override
    @Transactional
    public ExpenseBillDTO uploadExpenseBill(UUID travelRequestId, UUID workflowId, UUID employeeId,
                                           MultipartFile file, ExpenseBillDTO billDTO) {
        
        log.info("Uploading expense bill for travel request: {}, workflow: {}, employee: {}", 
                travelRequestId, workflowId, employeeId);

        // Validate file
        validateBillFile(file);

        // Store file physically
        String storedFileName = fileStorageService.storeFile(file, travelRequestId, "EXPENSE_BILL");

        // Create bill entity
        ExpenseBill bill = ExpenseBill.builder()
                .travelRequestId(travelRequestId)
                .workflowId(workflowId)
                .employeeId(employeeId)
                .billDate(billDTO.getBillDate())
                .expenseCategory(billDTO.getExpenseCategory())
                .description(billDTO.getDescription())
                .amount(billDTO.getAmount())
                .currency(billDTO.getCurrency() != null ? billDTO.getCurrency() : "INR")
                .fileName(storedFileName)
                .originalFileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(storedFileName)
                .billStatus(ExpenseBill.BillStatus.PENDING)
                .build();

        ExpenseBill savedBill = billRepository.save(bill);
        log.info("Expense bill uploaded successfully: {} for travel request: {}", 
                savedBill.getBillId(), travelRequestId);

        // Generate download URLs
        ExpenseBillDTO responseDTO = mapper.toDto(savedBill);
        responseDTO.setDownloadUrl(generateDownloadUrl(savedBill.getBillId()));
        responseDTO.setViewUrl(generateViewUrl(savedBill.getBillId()));

        return responseDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseBillDTO getBill(UUID billId) {
        ExpenseBill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException(BILL_NOT_FOUND + billId));
        
        ExpenseBillDTO dto = mapper.toDto(bill);
        dto.setDownloadUrl(generateDownloadUrl(billId));
        dto.setViewUrl(generateViewUrl(billId));
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseBillDTO> getBillsByTravelRequest(UUID travelRequestId) {
        return billRepository.findByTravelRequestId(travelRequestId)
                .stream()
                .map(bill -> {
                    ExpenseBillDTO dto = mapper.toDto(bill);
                    dto.setDownloadUrl(generateDownloadUrl(bill.getBillId()));
                    dto.setViewUrl(generateViewUrl(bill.getBillId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseBillDTO> getBillsByWorkflow(UUID workflowId) {
        return billRepository.findByWorkflowId(workflowId)
                .stream()
                .map(bill -> {
                    ExpenseBillDTO dto = mapper.toDto(bill);
                    dto.setDownloadUrl(generateDownloadUrl(bill.getBillId()));
                    dto.setViewUrl(generateViewUrl(bill.getBillId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseBillDTO> getBillsByEmployee(UUID employeeId) {
        return billRepository.findByEmployeeId(employeeId)
                .stream()
                .map(bill -> {
                    ExpenseBillDTO dto = mapper.toDto(bill);
                    dto.setDownloadUrl(generateDownloadUrl(bill.getBillId()));
                    dto.setViewUrl(generateViewUrl(bill.getBillId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ExpenseBillDTO updateBillStatus(UUID billId, ExpenseBill.BillStatus status, 
                                         String verificationNotes, UUID verifiedBy) {
        
        ExpenseBill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException(BILL_NOT_FOUND + billId));

        bill.setBillStatus(status);
        bill.setVerificationNotes(verificationNotes);
        bill.setVerifiedBy(verifiedBy);
        bill.setVerifiedAt(LocalDateTime.now());

        ExpenseBill updatedBill = billRepository.save(bill);
        log.info("Expense bill status updated: {} -> {}", billId, status);

        ExpenseBillDTO dto = mapper.toDto(updatedBill);
        dto.setDownloadUrl(generateDownloadUrl(billId));
        dto.setViewUrl(generateViewUrl(billId));
        
        return dto;
    }

    @Override
    @Transactional
    public void deleteBill(UUID billId) {
        ExpenseBill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException(BILL_NOT_FOUND + billId));

        // Delete physical file
        fileStorageService.deleteFile(bill.getFileName());

        // Delete database record
        billRepository.delete(bill);
        log.info("Expense bill deleted: {}", billId);
    }

    @Override
    public Resource downloadBill(UUID billId) {
        ExpenseBill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException(BILL_NOT_FOUND + billId));

        return fileStorageService.loadFileAsResource(bill.getTravelRequestId(), bill.getFileName());
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalApprovedAmount(UUID travelRequestId) {
        BigDecimal total = billRepository.calculateTotalApprovedAmountByRequest(travelRequestId);
        return total != null ? total : BigDecimal.ZERO;
    }


    @Override
    @Transactional(readOnly = true)
    public Long getPendingBillsCount(UUID travelRequestId) {
        return billRepository.countPendingBillsByRequest(travelRequestId);
    }

    @Override
    @Transactional
    public ExpenseBillDTO updateBillDetails(UUID billId, ExpenseBillDTO billDTO) {
        ExpenseBill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException(BILL_NOT_FOUND + billId));

        // Only allow updating certain fields
        if (billDTO.getDescription() != null) {
            bill.setDescription(billDTO.getDescription());
        }
        if (billDTO.getAmount() != null) {
            bill.setAmount(billDTO.getAmount());
        }
        if (billDTO.getBillDate() != null) {
            bill.setBillDate(billDTO.getBillDate());
        }
        if (billDTO.getExpenseCategory() != null) {
            bill.setExpenseCategory(billDTO.getExpenseCategory());
        }

        ExpenseBill updatedBill = billRepository.save(bill);
        
        ExpenseBillDTO responseDTO = mapper.toDto(updatedBill);
        responseDTO.setDownloadUrl(generateDownloadUrl(billId));
        responseDTO.setViewUrl(generateViewUrl(billId));
        
        return responseDTO;
    }

    @Override
    public List<ExpenseBill.ExpenseCategory> getExpenseCategories() {
        return Arrays.asList(ExpenseBill.ExpenseCategory.values());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseBillSummaryDTO getExpenseBillSummary(UUID workflowId) {
        List<ExpenseBill> bills = billRepository.findByWorkflowId(workflowId);

        // ✅ Total Amount (BigDecimal sum)
        BigDecimal totalAmount = bills.stream()
                .map(ExpenseBill::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ✅ Approved Amount
        BigDecimal approvedAmount = bills.stream()
                .filter(bill -> ExpenseBill.BillStatus.APPROVED.equals(bill.getBillStatus()))
                .map(ExpenseBill::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ✅ Counts
        long pendingCount = bills.stream()
                .filter(bill -> ExpenseBill.BillStatus.PENDING.equals(bill.getBillStatus()))
                .count();

        long approvedCount = bills.stream()
                .filter(bill -> ExpenseBill.BillStatus.APPROVED.equals(bill.getBillStatus()))
                .count();

        long rejectedCount = bills.stream()
                .filter(bill -> ExpenseBill.BillStatus.REJECTED.equals(bill.getBillStatus()))
                .count();

        return ExpenseBillSummaryDTO.builder()
                .workflowId(workflowId)
                .totalBills(bills.size())
                .totalAmount(totalAmount)
                .approvedAmount(approvedAmount)
                .pendingCount(pendingCount)
                .approvedCount(approvedCount)
                .rejectedCount(rejectedCount)
                .bills(mapper.toDtoList(bills))
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public boolean hasPendingBills(UUID workflowId) {
        return billRepository.findByWorkflowIdAndStatus(workflowId, ExpenseBill.BillStatus.PENDING)
                .size() > 0;
    }

    private void validateBillFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("Failed to store empty file.");
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit for bills
            throw new FileStorageException("File size exceeds maximum limit of 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || 
            (!contentType.startsWith("image/") && 
             !contentType.equals("application/pdf") &&
             !contentType.equals("application/msword") &&
             !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
             !contentType.equals("application/vnd.ms-excel") &&
             !contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))) {
            throw new FileStorageException("Only images, PDF, Word, and Excel documents are allowed for expense bills.");
        }
    }

    private String generateDownloadUrl(UUID billId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/expense-bills/")
                .path(billId.toString())
                .path("/download")
                .toUriString();
    }

    private String generateViewUrl(UUID billId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/expense-bills/")
                .path(billId.toString())
                .path("/view")
                .toUriString();
    }
}