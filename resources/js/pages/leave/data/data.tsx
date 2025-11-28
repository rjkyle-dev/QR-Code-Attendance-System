export const statuses = [
    { label: 'Pending Supervisor Approval', value: 'Pending Supervisor Approval' },
    { label: 'Pending HR Approval', value: 'Pending HR Approval' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected by Supervisor', value: 'Rejected by Supervisor' },
    { label: 'Rejected by HR', value: 'Rejected by HR' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Cancelled', value: 'Cancelled' },
    // Legacy statuses for backward compatibility
    { label: 'Pending', value: 'Pending' },
];

// Supervisor approval statuses
export const supervisorStatuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

// HR approval statuses
export const hrStatuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
];

export const workStatus = [
    { label: 'Regular', value: 'Regular' },
    { label: 'Add Crew', value: 'Add Crew' },
];
