// hooks/useCompanyData.ts

export const departments: string[] = [
    'Management & Staff(Admin)',
    'Packing Plant',
    'Harvesting',
    'Pest & Decease',
    'Miscellaneous',
    'Coop Area',
    'Security Forces',
    'Engineering',
    'Utility',
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

export const engineeringPositions: string[] = [
     'N/A'
];
export const utilityPositions: string[] = [
     'N/A'
];

// Department-specific positions
export const managementAndStaffPositions: string[] = [
    'Manager',
    'Farm Superintendent',
    'HR',
    'Packing Plant Supervisor',
    'Harvesting Supervisor',
    'P&D Supervisor',
    'M&S Supervisor',
    'Accounting Supervisor',
    'Cashier',
    'Office Employees Main',
    'Packing Plant Assistant',
    'Packing Plant Maintenance',
    'Driver',
    'M&S Aide',
    'Security Supervisor',
    'Coop Area/Manage Coop Supervisor',
    'Probationary Office Staff',
];

export const packingPlantPositions: string[] = ['Regular Hired Workers', 'Fruit Recorder', 'Probitionary', 'Seasonal'];

export const harvestingPositions: string[] = ['Regular Hired Workers', 'Probitionary', 'Spare'];

export const pestDeceasePositions: string[] = ['Regular Hired Workers', 'Footbath Maintenance', 'Probitionary PDC', 'PDC Seasonal'];

export const coopAreaPositions: string[] = ['Regular Hired Workers', 'Probitionary'];

export const miscellaneousPositions: string[] = [
    'Utility/Janitorial',
    'Field Surveyor',
    'Field Surveyor/Spare',
    'Miscellaneous - Probitionary',
    'Sigatoka Deleafer',
    'Sigatoka Monitoring',
];

export const securityForcesPositions: string[] = ['Security Guard: Agency-MINVITS', 'Security Guard: SECURUS', 'Spray Man (Main Gate)'];

export const workStatus = ['Regular', 'Add Crew', 'Probationary'];

export const maritalStatus = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other'];

export const gender = ['Male', 'Female'];

// Combined positions array from all departments
export const positions: string[] = [
    ...managementAndStaffPositions,
    ...packingPlantPositions,
    ...harvestingPositions,
    ...pestDeceasePositions,
    ...coopAreaPositions,
    ...miscellaneousPositions,
    ...securityForcesPositions,
];

// Helper function to get positions for a specific department
export const getPositionsForDepartment = (department: string): string[] => {
    switch (department) {
        case 'Management & Staff(Admin)':
            return managementAndStaffPositions;
        case 'Packing Plant':
            return packingPlantPositions;
        case 'Harvesting':
            return harvestingPositions;
        case 'Pest & Decease':
            return pestDeceasePositions;
        case 'Coop Area':
            return coopAreaPositions;
        case 'Security Forces':
            return securityForcesPositions;
        case 'Miscellaneous':
            return miscellaneousPositions;
        default:
            return [];
    }
};
