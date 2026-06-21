package com.hms.service;

import com.hms.entity.MedicalRecord;

import java.util.List;

public interface MedicalRecordService {
    MedicalRecord create(MedicalRecord medicalRecord);

    List<MedicalRecord> findAll();

    MedicalRecord findById(Long id);

    MedicalRecord update(Long id, MedicalRecord medicalRecord);

    void delete(Long id);

    List<MedicalRecord> findByPatient(Long patientId);
}
