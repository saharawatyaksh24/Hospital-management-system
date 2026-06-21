package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.entity.Invoice;
import com.hms.entity.InvoiceStatus;
import com.hms.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<Invoice>> create(@Valid @RequestBody Invoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice created", invoiceService.create(invoice)));
    }

    @GetMapping
    public ApiResponse<List<Invoice>> findAll() {
        return ApiResponse.success("Invoices fetched", invoiceService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Invoice> findById(@PathVariable Long id) {
        return ApiResponse.success("Invoice fetched", invoiceService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Invoice> update(@PathVariable Long id, @Valid @RequestBody Invoice invoice) {
        return ApiResponse.success("Invoice updated", invoiceService.update(id, invoice));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Invoice> updateStatus(@PathVariable Long id, @RequestParam InvoiceStatus status) {
        return ApiResponse.success("Invoice status updated", invoiceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted", null));
    }

    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<Invoice>> patientInvoices(@PathVariable Long patientId) {
        return ApiResponse.success("Patient invoices fetched", invoiceService.findByPatient(patientId));
    }
}
