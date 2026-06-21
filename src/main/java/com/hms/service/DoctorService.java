package com.hms.service;

import com.hms.entity.Doctor;

import java.util.List;

public interface DoctorService {
    Doctor create(Doctor doctor);

    List<Doctor> findAll();

    Doctor findById(Long id);

    Doctor update(Long id, Doctor doctor);

    void delete(Long id);
}
