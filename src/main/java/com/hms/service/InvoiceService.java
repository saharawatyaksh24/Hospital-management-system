package com.hms.service;

import com.hms.entity.Invoice;
import com.hms.entity.InvoiceStatus;

import java.util.List;

public interface InvoiceService {
    Invoice create(Invoice invoice);

    List<Invoice> findAll();

    Invoice findById(Long id);

    Invoice update(Long id, Invoice invoice);

    Invoice updateStatus(Long id, InvoiceStatus status);

    void delete(Long id);

    List<Invoice> findByPatient(Long patientId);
}
