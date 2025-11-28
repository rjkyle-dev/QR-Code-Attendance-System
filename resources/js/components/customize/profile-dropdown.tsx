import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { AdminProfileDropdown } from './admin-profile-dropdown';
import { EmployeeProfileDropdown } from './employee-profile-dropdown';

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

// Main Profile Dropdown Component
export function ProfileDropdown() {
    const page = usePage<SharedData & { employee?: Employee | Employee[] }>().props;

    // Check if we're in employee context
    // If page.employee exists and is an object (not an array), it's an employee view page
    const isEmployeeContext = !!page.employee && !Array.isArray(page.employee);
    const userData = isEmployeeContext ? page.employee as Employee : page.auth?.user;

    // If no user data available, don't render the dropdown
    if (!userData) {
        return null;
    }

    // Render the appropriate component based on context
    if (isEmployeeContext && userData && 'employeeid' in userData) {
        return <EmployeeProfileDropdown user={userData as Employee} />;
    } else if (userData && 'email' in userData) {
        return <AdminProfileDropdown user={userData as any} />;
    }

    return null;
}
