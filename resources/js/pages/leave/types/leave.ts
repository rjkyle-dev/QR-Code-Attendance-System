export interface Leave {
    id: string;
    leave_start_date: string;
    employee_name: string;
    leave_type: string;
    leave_end_date: string;
    leave_days: string;
    status: string;
    leave_reason: string;
    leave_date_reported: string;
    leave_date_approved: string;
    leave_comments: string;
    picture: string;
    department: string;
    position: string;
    employeeid: string;
    remaining_credits?: number;
    used_credits?: number;
    total_credits?: number;
    // Supervisor approval fields
    supervisor_status?: string | null;
    supervisor_approved_by?: number | null;
    supervisor_approved_at?: string | null;
    supervisor_comments?: string | null;
    supervisor_approver?: {
        id: number;
        name: string;
        email: string;
    } | null;
    // HR approval fields
    hr_status?: string | null;
    hr_approved_by?: number | null;
    hr_approved_at?: string | null;
    hr_comments?: string | null;
    hr_approver?: {
        id: number;
        name: string;
        email: string;
    } | null;
    // Leave status (legacy field, may contain values like 'Pending Supervisor Approval', 'Pending HR Approval', etc.)
    leave_status?: string;
}
