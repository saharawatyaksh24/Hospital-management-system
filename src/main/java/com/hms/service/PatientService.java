package com.hms.service;

import com.hms.entity.Patient;

import java.util.List;

public interface PatientService {
    Patient create(Patient patient);

    List<Patient> findAll();

    Patient findById(Long id);

    Patient update(Long id, Patient patient);

    void delete(Long id);
}
