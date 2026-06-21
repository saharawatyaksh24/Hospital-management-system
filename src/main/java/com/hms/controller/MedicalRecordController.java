package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.entity.MedicalRecord;
import com.hms.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalRecord>> create(@Valid @RequestBody MedicalRecord medicalRecord) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Medical record created", medicalRecordService.create(medicalRecord)));
    }

    @GetMapping
    public ApiResponse<List<MedicalRecord>> findAll() {
        return ApiResponse.success("Medical records fetched", medicalRecordService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<MedicalRecord> findById(@PathVariable Long id) {
        return ApiResponse.success("Medical record fetched", medicalRecordService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<MedicalRecord> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicalRecord medicalRecord) {
        return ApiResponse.success("Medical record updated", medicalRecordService.update(id, medicalRecord));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        medicalRecordService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Medical record deleted", null));
    }

    @GetMapping("/patient/{patientId}")
    public ApiResponse<List<MedicalRecord>> patientRecords(@PathVariable Long patientId) {
        return ApiResponse.success("Patient medical records fetched", medicalRecordService.findByPatient(patientId));
    }
}
