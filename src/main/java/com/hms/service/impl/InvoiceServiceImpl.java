package com.hms.service.impl;

import com.hms.entity.Invoice;
import com.hms.entity.InvoiceStatus;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.InvoiceRepository;
import com.hms.service.AppointmentService;
import com.hms.service.InvoiceService;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @Override
    public Invoice create(Invoice invoice) {
        attachReferences(invoice);
        return invoiceRepository.save(invoice);
    }

    @Override
    public List<Invoice> findAll() {
        return invoiceRepository.findAll();
    }

    @Override
    public Invoice findById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id " + id));
    }

    @Override
    public Invoice update(Long id, Invoice invoice) {
        Invoice existing = findById(id);
        attachReferences(invoice);
        existing.setPatient(invoice.getPatient());
        existing.setAppointment(invoice.getAppointment());
        existing.setDescription(invoice.getDescription());
        existing.setAmount(invoice.getAmount());
        existing.setInvoiceDate(invoice.getInvoiceDate());
        existing.setStatus(invoice.getStatus());
        return invoiceRepository.save(existing);
    }

    @Override
    public Invoice updateStatus(Long id, InvoiceStatus status) {
        Invoice existing = findById(id);
        existing.setStatus(status);
        return invoiceRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        invoiceRepository.delete(findById(id));
    }

    @Override
    public List<Invoice> findByPatient(Long patientId) {
        patientService.findById(patientId);
        return invoiceRepository.findByPatientIdOrderByInvoiceDateDesc(patientId);
    }

    private void attachReferences(Invoice invoice) {
        invoice.setPatient(patientService.findById(invoice.getPatient().getId()));
        if (invoice.getAppointment() != null && invoice.getAppointment().getId() != null) {
            invoice.setAppointment(appointmentService.findById(invoice.getAppointment().getId()));
        }
    }
}
