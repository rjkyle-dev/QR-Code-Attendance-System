export const departments: string[] = [
    'Accounting',
    'Finance',
    'Audit',
    'Human Resources',
    'Para Legal',
];
export const evaluationDepartments: string[] = [
    'Management & Staff(Admin)',
    'Packing Plant',
    'Harvesting',
    'Pest & Decease',
    'Coop Area',
    'Engineering',
    'Utility',
];


// Department-specific positions
export const accountingPositions: string[] = [
    'Accounting Supervisor',
    'Cashier',
];

export const auditingPositions: string[] = [
    'Audit Supervisor',
    'Audit Officer',
    'Audit Assistant',
];

export const legalPositions: string[] = [
    'Legal Supervisor',
    'Legal Officer',
    'Legal Assistant',
];

export const workStatus = ['Regular', 'Probationary', 'Project Based'];

export const maritalStatus = ['Single', 'Married', 'Widowed'];

export const gender = ['Male', 'Female'];


export const financePositions: string[] = ['Finance Supervisor', 'Finance Officer', 'Finance Assistant', 'Probationary'];

export const humanResourcesPositions: string[] = ['Human Resources Supervisor', 'Human Resources Officer', 'Human Resources Assistant', 'Probationary'];

export const positions: string[] = [
    ...accountingPositions,
    ...financePositions,
    ...humanResourcesPositions,
    ...auditingPositions,
    ...legalPositions,
];

// Helper function to get positions for a specific department
export const getPositionsForDepartment = (department: string): string[] => {
    switch (department) {
        case 'Management & Staff(Admin)':
            return accountingPositions;
        case 'Finance':
            return financePositions;
        case 'Human Resources':
            return humanResourcesPositions;
        case 'Audit':
            return auditingPositions;
        case 'Legal':
            return legalPositions;
        default:
            return [];
    }
};
