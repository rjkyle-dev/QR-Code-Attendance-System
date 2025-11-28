// Filename: employee.ts

// Interface for displaying employee data (from backend)
export interface Employee {
    employeeid: string;
    employee_name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    gender: string;
    department: string;
    position: string;
    phone: string;
    work_status: string;
    marital_status: string;
    email: string;
    address: string;
    service_tenure: string;
    date_of_birth: string;
    picture: string; // URL string for display
    city: string;
    state: string;
    country: string;
    zip_code: string;
    nationality?: string;
    tin_password: string;
    tin_user_id: string;
    tin_username: string;
    sss_user_id: string;
    sss_username: string;
    sss_password: string;
    philhealth_user_id: string;
    philhealth_username: string;
    philhealth_password: string;
    hdmf_user_id: string;
    hdmf_username: string;
    hdmf_password: string;

    gmail_password: string;
    recommendation_letter?: string; // URL string for display
    [key: string]: any;
}

// Interface for form data (for creating/editing employees)
export interface Employees {
    employeeid: string;
    employee_name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    gender: string;
    department: string;
    position: string;
    phone: string;
    work_status: string;
    marital_status: string;
    email: string;
    address: string;
    service_tenure: string;
    date_of_birth: string;
    picture: File | null; // File object for uploads
    city: string;
    state: string;
    country: string;
    zip_code: string;
    nationality?: string;
    tin_password: string;
    tin_user_id: string;
    tin_username: string;
    sss_user_id: string;
    sss_username: string;
    sss_password: string;
    philhealth_user_id: string;
    philhealth_username: string;
    philhealth_password: string;
    hdmf_user_id: string;
    hdmf_username: string;
    hdmf_password: string;
    gmail_password: string;
    recommendation_letter: File | null; // File object for uploads
    [key: string]: any;
}

// Initial form data for new employees
export const initialEmployeeFormData: Employees = {
    employeeid: '',
    employee_name: '',
    firstname: '',
    middlename: '',
    lastname: '',
    gender: '',
    department: '',
    position: '',
    phone: '',
    work_status: '',
    marital_status: '',
    service_tenure: '',
    date_of_birth: '',
    email: '',
    address: '',
    city: '',
    state: '',
    picture: null,
    country: '',
    zip_code: '',
    nationality: '',

    tin_password: '',
    tin_user_id: '',
    tin_username: '',
    sss_user_id: '',
    sss_username: '',
    sss_password: '',
    philhealth_user_id: '',
    philhealth_username: '',
    philhealth_password: '',
    hdmf_user_id: '',
    hdmf_username: '',
    hdmf_password: '',
    gmail_password: '',
    recommendation_letter: null,
};
