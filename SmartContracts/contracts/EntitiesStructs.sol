// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract EntitiesStructs {
    struct PersonalInformation {
        string name;
        uint16 age;
        string gender;
        string email;
        string countryCode;
        string phoneNumber;
    }

    struct Patient {
        bool isActive;
        PersonalInformation personalInformation;
    }

    struct Doctor {
        bool isActive;
        PersonalInformation personalInformation;
        string specialization;
    }

    struct Hospital {
        bool isActive;
        string name;
        string phoneNumber;
    }

    struct File {
        string typeFile;
        string hashFile;
    }

    struct PatientRecord {
        bool isActive;
        address doctorId;
        address patientId;
        string date;
        File diagnosisFile;
    }
}
