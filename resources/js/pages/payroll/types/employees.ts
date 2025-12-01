// Filename: employee.ts
export interface Employees {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    picture: string; // URL from backend for listing/views
    gender: string;
    department: string;
    position: string;
    phone: string;
    work_status: string;
    date_of_birth: string;
    marital_status: string;
    service_tenure: string;
    email: string;
    address: string;
    pin?: string; // Employee PIN for login
    fingerprints?: any[]; // Fingerprint info from backend
}

export interface Department {
    id: number;
    name: string;
}

export interface Position {
    id: number;
    name: string;
}
