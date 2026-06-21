package com.hms.service.impl;

import com.hms.entity.Patient;
import com.hms.exception.BadRequestException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.PatientRepository;
import com.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    @Override
    public Patient create(Patient patient) {
        validateUniqueEmail(patient.getEmail(), null);
        return patientRepository.save(patient);
    }

    @Override
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Override
    public Patient findById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));
    }

    @Override
    public Patient update(Long id, Patient patient) {
        Patient existing = findById(id);
        validateUniqueEmail(patient.getEmail(), existing.getEmail());
        existing.setFullName(patient.getFullName());
        existing.setPhone(patient.getPhone());
        existing.setEmail(patient.getEmail());
        existing.setDateOfBirth(patient.getDateOfBirth());
        existing.setGender(patient.getGender());
        existing.setAddress(patient.getAddress());
        existing.setBloodGroup(patient.getBloodGroup());
        existing.setEmergencyContact(patient.getEmergencyContact());
        return patientRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        patientRepository.delete(findById(id));
    }

    private void validateUniqueEmail(String newEmail, String currentEmail) {
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equalsIgnoreCase(currentEmail)
                && patientRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("Patient email already exists");
        }
    }
}
