package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.entity.Patient;
import com.hms.service.PatientService;
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
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<ApiResponse<Patient>> create(@Valid @RequestBody Patient patient) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient created", patientService.create(patient)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Patient>> register(@Valid @RequestBody Patient patient) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered", patientService.create(patient)));
    }

    @GetMapping
    public ApiResponse<List<Patient>> findAll() {
        return ApiResponse.success("Patients fetched", patientService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Patient> findById(@PathVariable Long id) {
        return ApiResponse.success("Patient fetched", patientService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Patient> update(@PathVariable Long id, @Valid @RequestBody Patient patient) {
        return ApiResponse.success("Patient updated", patientService.update(id, patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted", null));
    }
}
