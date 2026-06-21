package com.hms.service.impl;

import com.hms.entity.Doctor;
import com.hms.exception.BadRequestException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.repository.DoctorRepository;
import com.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Override
    public Doctor create(Doctor doctor) {
        validateUniqueEmail(doctor.getEmail(), null);
        return doctorRepository.save(doctor);
    }

    @Override
    public List<Doctor> findAll() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + id));
    }

    @Override
    public Doctor update(Long id, Doctor doctor) {
        Doctor existing = findById(id);
        validateUniqueEmail(doctor.getEmail(), existing.getEmail());
        existing.setFullName(doctor.getFullName());
        existing.setSpecialization(doctor.getSpecialization());
        existing.setPhone(doctor.getPhone());
        existing.setEmail(doctor.getEmail());
        existing.setQualification(doctor.getQualification());
        existing.setExperienceYears(doctor.getExperienceYears());
        existing.setAvailability(doctor.getAvailability());
        return doctorRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        doctorRepository.delete(findById(id));
    }

    private void validateUniqueEmail(String newEmail, String currentEmail) {
        if (newEmail != null && !newEmail.isBlank() && !newEmail.equalsIgnoreCase(currentEmail)
                && doctorRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("Doctor email already exists");
        }
    }
}
