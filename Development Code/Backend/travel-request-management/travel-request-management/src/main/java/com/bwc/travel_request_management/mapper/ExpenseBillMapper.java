package com.bwc.travel_request_management.mapper;

import com.bwc.travel_request_management.dto.ExpenseBillDTO;
import com.bwc.travel_request_management.entity.ExpenseBill;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ExpenseBillMapper {

    public ExpenseBillDTO toDto(ExpenseBill entity) {
        if (entity == null) return null;
        
        return ExpenseBillDTO.builder()
                .billId(entity.getBillId())
                .travelRequestId(entity.getTravelRequestId())
                .employeeId(entity.getEmployeeId())
                .billDate(entity.getBillDate())
                .expenseCategory(entity.getExpenseCategory())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .fileName(entity.getFileName())
                .originalFileName(entity.getOriginalFileName())
                .fileType(entity.getFileType())
                .fileSize(entity.getFileSize())
                .filePath(entity.getFilePath())
                .billStatus(entity.getBillStatus())
                .verificationNotes(entity.getVerificationNotes())
                .verifiedBy(entity.getVerifiedBy())
                .verifiedAt(entity.getVerifiedAt())
                .uploadedAt(entity.getUploadedAt())
                .build();
    }

    public ExpenseBill toEntity(ExpenseBillDTO dto) {
        if (dto == null) return null;
        
        return ExpenseBill.builder()
                .billId(dto.getBillId())
                .travelRequestId(dto.getTravelRequestId())
                .employeeId(dto.getEmployeeId())
                .billDate(dto.getBillDate())
                .expenseCategory(dto.getExpenseCategory())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .currency(dto.getCurrency())
                .fileName(dto.getFileName())
                .originalFileName(dto.getOriginalFileName())
                .fileType(dto.getFileType())
                .fileSize(dto.getFileSize())
                .filePath(dto.getFilePath())
                .billStatus(dto.getBillStatus())
                .verificationNotes(dto.getVerificationNotes())
                .verifiedBy(dto.getVerifiedBy())
                .verifiedAt(dto.getVerifiedAt())
                .build();
    }

    public List<ExpenseBillDTO> toDtoList(List<ExpenseBill> entities) {
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }
}