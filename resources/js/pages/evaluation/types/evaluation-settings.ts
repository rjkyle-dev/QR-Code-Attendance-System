// Evaluation Settings Configuration
// This file contains department-specific settings for evaluations

// Work function item with optional description
export interface WorkFunctionItem {
    name: string;
    description?: string;
}

// Type for work function items - can be string (backward compatible) or object with name and description
export type WorkFunctionItemType = string | WorkFunctionItem;

export interface DepartmentEvaluationSettings {
    title: string;
    subtitle: string;
    description: string;
    sectionNumber?: number;
    showWorkFunctions?: boolean;
    showAttitudeTowardsCoworker?: boolean;
    criteria?: {
        attendance?: string;
        attitudeTowardsSupervisor?: string;
        attitudeTowardsCoworker?: string;
        workAttitude?: string;
        workOperations?: string;
        workFunctions?: string;
    };
    workFunctions:
        | string[]
        | {
              sections: {
                  title: string;
                  items: WorkFunctionItemType[];
              }[];
          };
    category: 'operations' | 'functions' | 'maintenance' | 'specialized';
}

export const evaluationSettings: Record<string, DepartmentEvaluationSettings> = {
    'Management & Staff(Admin)': {
        title: 'Work Functions',
        subtitle: 'Management&Staff(Admin)',
        description: 'Evaluate employee performance in Management & Staff(Admin) department operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-Worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '4. Work Operations',
            workFunctions: '5. Work Functions',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: [
                        'Encode workers daily time & accomplishment report (WDTAR)',
                        'Prepare the payroll of periodic paid employees, COOP leave, honorarium and hired workers',
                        'Maintain files of timesheets and other source documents',
                        'Update generation of the following documents in order to catch up with the remittance/payments schedules',
                        "Prepare and furnish the bookeeper summary of beneficiary's deduction made againts their respective proceeds",
                        'Prepare individual billing of beneficiaries based on the individual production report summary submitted by the AGRI & PROD.Facilitator',
                        'Perform other duties as may be assigned by his/her immediate superior and nor the manager',
                    ],
                },
            ],
        },
        category: 'functions',
    },
    'Packing Plant': {
        title: 'Work Operations',
        subtitle: 'Packing Plant Department',
        description: 'Evaluate employee performance in packaging and production operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: [
                        {
                            name: 'Patio',
                            description: 'Handles initial receiving and placement of harvested fruits in the patio area for sorting and processing.',
                        },
                        {
                            name: 'Dehander',
                            description: 'Removes hands (clusters) from banana bunches, preparing them for further processing and packaging.',
                        },
                        {
                            name: 'Selector',
                            description: 'Inspects and selects fruits based on quality standards, size, and ripeness for appropriate packaging.',
                        },
                    ],
                },
                {
                    title: 'WTS',
                    items: [
                        {
                            name: 'Rejector/Utility',
                            description:
                                'Identifies and removes defective or substandard fruits, and performs utility tasks to maintain workflow efficiency.',
                        },
                    ],
                },
                {
                    title: '',
                    items: [
                        {
                            name: 'Weigher',
                            description: 'Accurately weighs fruits to ensure proper packaging weight and compliance with quality standards.',
                        },
                    ],
                },
                {
                    title: 'Labeller',
                    items: [
                        {
                            name: 'Inspector',
                            description: 'Examines fruits for quality, defects, and compliance with standards before labeling and packaging.',
                        },
                    ],
                },
                {
                    title: "CP'S",
                    items: [
                        {
                            name: 'Crew',
                            description:
                                'Performs various tasks as part of the CP (Crown Plant) crew, including handling, processing, and packaging operations.',
                        },
                    ],
                },
                {
                    title: '',
                    items: [
                        {
                            name: 'Packer',
                            description:
                                'Carefully packs selected fruits into containers, boxes, or packages according to specifications and quality standards.',
                        },
                    ],
                },
                {
                    title: 'Topper',
                    items: [
                        {
                            name: 'Box Former',
                            description:
                                'Assembles and forms boxes or containers for packaging, ensuring proper structure and readiness for filling.',
                        },
                    ],
                },
                {
                    title: 'Final Weigher',
                    items: [
                        {
                            name: 'Boxes Counter',
                            description: 'Counts and verifies the number of boxes or packages, ensuring accurate inventory and shipment quantities.',
                        },
                    ],
                },
                {
                    title: 'Box Former',
                    items: [
                        {
                            name: 'Palletizer',
                            description:
                                'Arranges and stacks packed boxes onto pallets for storage and transportation, ensuring stable and secure loading.',
                        },
                    ],
                },
            ],
        },
        category: 'operations',
    },
    Harvesting: {
        title: 'Work Operations',
        subtitle: 'Harvesting Department',
        description: 'Evaluate employee performance in harvesting and field operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: [
                        {
                            name: 'Follow S.O.P. in calibrating the fruit',
                            description:
                                'Adheres to Standard Operating Procedures when calibrating fruits to ensure proper size, quality, and ripeness standards.',
                        },
                        {
                            name: 'Proper cutting of bunch',
                            description: 'Performs accurate and careful cutting of banana bunches to minimize damage and maintain fruit quality.',
                        },
                        {
                            name: 'Proper placement of harvested stumps',
                            description:
                                'Correctly positions and arranges harvested stumps to prevent damage and facilitate efficient collection and transport.',
                        },
                        {
                            name: 'Use of latex in actual receiving',
                            description:
                                'Properly applies latex or protective coating during the receiving process to maintain fruit quality and prevent damage.',
                        },
                        {
                            name: 'Observe ideal NO. of stems of Guyod/Trip',
                            description:
                                'Follows guidelines for the optimal number of stems per guyod or trip to ensure efficient harvesting and transportation.',
                        },
                        {
                            name: 'Timely delivery of roller',
                            description:
                                'Ensures prompt and timely delivery of rollers or transportation equipment to support continuous harvesting operations.',
                        },
                    ],
                },
            ],
        },
        category: 'operations',
    },
    'Pest & Decease': {
        title: 'Work Operations',
        subtitle: 'Pest & Disease Department',
        description: 'Evaluate employee performance in pest control and disease management',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: 'Monitoring',
                    items: [
                        {
                            name: 'Area Survey',
                            description:
                                'Conducts regular field surveys to identify and monitor pest populations, disease outbreaks, and overall plant health conditions.',
                        },
                        {
                            name: 'Aerial Spray',
                            description:
                                'Performs or assists in aerial spraying operations to apply pesticides or treatments over large field areas.',
                        },
                        {
                            name: 'F.O.C. Area',
                            description:
                                'Monitors and manages F.O.C. (Fusarium Oxysporum f. sp. Cubense) affected areas to track disease spread and containment.',
                        },
                        {
                            name: 'Moko Area',
                            description: 'Monitors and tracks Moko disease affected areas, documenting infection patterns and containment measures.',
                        },
                    ],
                },
                {
                    title: 'Eradication',
                    items: [
                        {
                            name: 'Fence/Repair',
                            description: 'Maintains and repairs field fences to prevent pest entry and protect crops from external threats.',
                        },
                        {
                            name: 'Footbath',
                            description:
                                'Maintains footbath stations and ensures proper disinfection protocols to prevent disease spread through footwear.',
                        },
                        {
                            name: 'Weed Slashing',
                            description: 'Removes weeds through slashing to eliminate pest habitats and reduce competition for plant resources.',
                        },
                        {
                            name: 'Sticking',
                            description: 'Marks or tags infected plants or areas for identification and targeted treatment or removal.',
                        },
                        {
                            name: 'Digging Socker',
                            description: 'Removes infected plant sockets by digging them out to prevent disease spread to healthy plants.',
                        },
                    ],
                },
                {
                    title: 'Maintenance',
                    items: [],
                },
            ],
        },
        category: 'operations',
    },
    'Coop Area': {
        title: 'Work Operations',
        subtitle: 'Cooperative Area Department',
        description: 'Evaluate employee performance in cooperative management and operations',
        sectionNumber: 4,
        showWorkFunctions: false,
        showAttitudeTowardsCoworker: false,
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards ARB',
            workAttitude: '3. Work Attitude/Performance',
            workOperations: '4. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: 'Plant Care:',
                    items: [
                        {
                            name: 'Weed Control',
                            description: 'Removes and manages weeds around banana plants to prevent competition for nutrients and water.',
                        },
                        {
                            name: 'Cleaning/Cutting Stumps',
                            description: 'Cleans and cuts old stumps to maintain field cleanliness and prevent disease spread.',
                        },
                        {
                            name: 'Pruning',
                            description: 'Trims and removes unnecessary leaves and plant parts to promote healthy growth and fruit development.',
                        },
                        {
                            name: 'Replanting',
                            description: 'Replaces dead or diseased plants with new seedlings to maintain optimal plant density and productivity.',
                        },
                        {
                            name: 'Fertilization Application',
                            description: 'Applies fertilizers according to schedule and specifications to ensure proper plant nutrition and growth.',
                        },
                        {
                            name: 'Propping',
                            description: 'Provides support structures to banana plants to prevent toppling under the weight of developing bunches.',
                        },
                    ],
                },
                {
                    title: 'Fruit Care:',
                    items: [
                        {
                            name: 'Bud Bugging',
                            description:
                                'Removes flower buds or applies treatments to control bud-related pests and ensure proper fruit development.',
                        },
                        {
                            name: 'Caloco/DE & DE',
                            description: 'Applies Caloco or DE (Diatomaceous Earth) treatments to protect fruits from pests and maintain quality.',
                        },
                        {
                            name: 'Bunch Spray',
                            description: 'Sprays protective treatments on developing bunches to prevent pest infestation and disease.',
                        },
                        {
                            name: 'Bagging',
                            description:
                                'Covers developing fruit bunches with protective bags to shield them from pests, diseases, and physical damage.',
                        },
                        {
                            name: 'Hand Bagging/Soksok',
                            description: 'Manually applies protective bags or covers to individual hands or clusters of fruits.',
                        },
                        {
                            name: 'Deleafing',
                            description: 'Removes old or damaged leaves to improve air circulation, reduce disease risk, and enhance fruit quality.',
                        },
                        {
                            name: 'Sigatoka Trimming',
                            description: 'Trims leaves affected by Sigatoka disease to prevent spread and maintain plant health.',
                        },
                    ],
                },
                {
                    title: 'Pest & Disease Control/Actual:',
                    items: [
                        {
                            name: 'Moko Eradication',
                            description: 'Identifies and removes plants infected with Moko disease to prevent spread and maintain field health.',
                        },
                        {
                            name: 'Fusarium Eradication',
                            description: 'Removes and disposes of plants affected by Fusarium wilt to control disease spread.',
                        },
                        {
                            name: 'Scale Insect/Mealy Bug',
                            description: 'Controls and eliminates scale insects and mealy bugs through appropriate treatment methods.',
                        },
                        {
                            name: 'Bunchy Top Eradication',
                            description: 'Removes plants infected with Bunchy Top virus to prevent disease transmission to healthy plants.',
                        },
                    ],
                },
                {
                    title: 'OHCP/Actual:',
                    items: [
                        {
                            name: 'Other Duties as Prescribed',
                            description:
                                'Other duties as prescribed by immediate superior related to OHCP (Operational Health and Care Program) activities.',
                        },
                    ],
                },
            ],
        },
        category: 'operations',
    },
    Engineering: {
        title: 'Work Operations',
        subtitle: 'Engineering Department',
        description: 'Evaluate employee performance in engineering and maintenance operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: [
                        // Example: Using string format (backward compatible)
                        {
                            name: 'Welding',
                            description: 'Welding of metal components and structures for construction and repair.',
                        },
                        {
                            name: 'Electrical Wiring',
                            description: 'Installation, maintenance, and repair of electrical systems and wiring in facilities and equipment.',
                        },
                    ],
                },
                {
                    title: 'Maintenance',
                    items: [
                        // You can mix string and object formats
                        {
                            name: 'Glueing',
                            description: 'Glueing of metal components and structures for construction and repair.',
                        },
                        {
                            name: 'Conveyor',
                            description: 'Maintenance and repair of conveyor belt systems used in production lines.',
                        },
                        {
                            name: 'Spray Can',
                            description: 'Spraying of paint and other materials on surfaces for decoration and protection.',
                        },
                        {
                            name: 'Vacuum',
                            description: 'Maintenance of vacuum systems and equipment.',
                        },
                        {
                            name: 'Roller',
                            description: 'Rolling of metal components and structures for construction and repair.',
                        },
                        {
                            name: 'Cable Way',
                            description: 'Maintenance and repair of cable way systems for transportation.',
                        },
                        {
                            name: 'Bridge',
                            description: 'Maintenance and repair of bridges for transportation and operational purposes.',
                        },
                    ],
                },
                {
                    title: 'Obtructions',
                    items: [
                        {
                            name: 'Trimming',
                            description: 'Removal of obstructions and trimming of vegetation or materials that block pathways or equipment.',
                        },
                    ],
                },
                {
                    title: 'Spare',
                    items: [
                        {
                            name: 'Driving',
                            description: 'Operating vehicles and equipment for transportation and operational purposes.',
                        },
                    ],
                },
            ],
        },
        category: 'maintenance',
    },
    Utility: {
        title: 'Work Operations',
        subtitle: 'Utility Department',
        description: 'Evaluate employee performance in utility maintenance and operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards ARP',
            attitudeTowardsCoworker: '2. Attitude Towards ARP',
            workAttitude: '3. Work Attitude/Performance',
            workOperations: '4. Work Operations',
            workFunctions: '5. Work Functions',
        },
        workFunctions: {
            sections: [
                {
                    title: 'Sanitation For:',
                    items: [
                        {
                            name: 'Office Areas',
                            description: 'Maintains cleanliness and sanitation of office spaces, including desks, floors, and common areas.',
                        },
                        {
                            name: 'Garden',
                            description: 'Keeps garden areas clean, maintains landscaping, and ensures proper waste disposal in outdoor spaces.',
                        },
                        {
                            name: 'Kitchen Area',
                            description: 'Maintains hygiene and cleanliness in kitchen facilities, including equipment, surfaces, and storage areas.',
                        },
                        {
                            name: 'Toilet',
                            description: 'Ensures restroom facilities are clean, sanitized, and well-maintained with adequate supplies.',
                        },
                        {
                            name: 'Garbage Disposal',
                            description:
                                'Properly collects, segregates, and disposes of waste materials according to environmental and safety standards.',
                        },
                    ],
                },
                {
                    title: 'Office Beautification',
                    items: [],
                },
                {
                    title: 'Safekeeping:',
                    items: [
                        {
                            name: 'Office Equipment',
                            description: 'Safely stores, maintains, and protects office equipment such as computers, printers, and other devices.',
                        },
                        {
                            name: 'Supplies',
                            description: 'Manages and safeguards office supplies, ensuring proper storage and inventory control.',
                        },
                        {
                            name: 'Kitchen Utensils',
                            description: 'Maintains and secures kitchen utensils and equipment, ensuring they are clean and properly stored.',
                        },
                    ],
                },
                {
                    title: '',
                    items: [
                        {
                            name: 'Other Duties Priscribed By Immediate Superior',
                            description:
                                'Performs additional tasks and responsibilities as assigned by immediate supervisor to support department operations.',
                        },
                    ],
                },
            ],
        },
        category: 'maintenance',
    },
};

// Helper function to get department settings
export const getDepartmentSettings = (department: string): DepartmentEvaluationSettings | null => {
    return evaluationSettings[department] || null;
};

// Helper function to get all available departments
export const getAvailableDepartments = (): string[] => {
    return Object.keys(evaluationSettings);
};

// Helper function to check if workFunctions is structured
export const isStructuredWorkFunctions = (workFunctions: any): workFunctions is { sections: { title: string; items: WorkFunctionItemType[] }[] } => {
    return workFunctions && typeof workFunctions === 'object' && 'sections' in workFunctions;
};

// Helper function to get the name from a work function item (handles both string and object formats)
export const getWorkFunctionName = (item: WorkFunctionItemType): string => {
    if (typeof item === 'string') {
        return item;
    }
    return item.name;
};

// Helper function to get the description from a work function item (returns empty string if not available)
export const getWorkFunctionDescription = (item: WorkFunctionItemType): string => {
    if (typeof item === 'string') {
        return '';
    }
    return item.description || '';
};

// Helper function to check if an item has a description
export const hasWorkFunctionDescription = (item: WorkFunctionItemType): boolean => {
    if (typeof item === 'string') {
        return false;
    }
    return !!item.description;
};

// Helper function to get all work functions as a flat array (for backward compatibility)
export const getAllWorkFunctions = (department: string): string[] => {
    const settings = evaluationSettings[department];
    if (!settings) return [];

    if (isStructuredWorkFunctions(settings.workFunctions)) {
        return settings.workFunctions.sections.flatMap((section) => section.items.map((item) => getWorkFunctionName(item)));
    }

    return settings.workFunctions as string[];
};

// Helper function to get structured work functions
export const getStructuredWorkFunctions = (department: string) => {
    const settings = evaluationSettings[department];
    if (!settings) return null;

    if (isStructuredWorkFunctions(settings.workFunctions)) {
        return settings.workFunctions;
    }

    return null;
};

// Helper function to get custom criteria labels
export const getCriteriaLabel = (department: string, criteriaType: keyof NonNullable<DepartmentEvaluationSettings['criteria']>): string => {
    const settings = evaluationSettings[department];
    if (!settings?.criteria?.[criteriaType]) {
        // Return empty string if no custom label is defined
        return '';
    }
    return settings.criteria[criteriaType]!;
};

// Helper function to get departments by category
export const getDepartmentsByCategory = (category: DepartmentEvaluationSettings['category']): string[] => {
    return Object.entries(evaluationSettings)
        .filter(([_, settings]) => settings.category === category)
        .map(([department, _]) => department);
};

// Helper function to get evaluator information (now returns default values only)
// Note: Actual evaluator information is now fetched from database supervisor assignments
export const getEvaluatorInfo = (department: string) => {
    return {
        supervisor: 'Supervisor',
        hrPersonnel: 'HR Personnel',
        manager: 'Manager',
    };
};

// Default settings for unknown departments
export const getDefaultDepartmentSettings = (department: string): DepartmentEvaluationSettings => {
    return {
        title: 'Work Functions',
        subtitle: `${department} Department`,
        description: `Evaluate employee performance in ${department} department operations`,
        workFunctions: [
            'Perform assigned duties and responsibilities',
            'Maintain quality standards in work output',
            'Follow department procedures and protocols',
            'Collaborate with team members effectively',
            'Contribute to department goals and objectives',
        ],
        category: 'functions',
    };
};
