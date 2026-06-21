package com.hms.repository;

import com.hms.entity.Invoice;
import com.hms.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientIdOrderByInvoiceDateDesc(Long patientId);

    long countByPatientIdAndStatus(Long patientId, InvoiceStatus status);

    List<Invoice> findByStatus(InvoiceStatus status);

    default BigDecimal totalPendingAmount() {
        return findByStatus(InvoiceStatus.PENDING).stream()
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
