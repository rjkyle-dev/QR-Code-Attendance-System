export interface Evaluation {
    id: number;
    employee_id: number;
    employee_name: string;
    employeeid: string;
    department: string;
    position: string;
    picture?: string;
    evaluation_year?: number;
    year?: number;
    evaluation_period?: number;
    evaluation_frequency?: string;
    rating_date: string;
    total_rating?: number;
    ratings?: string;
    
    // New evaluation format
    attendance?: {
        daysLate?: number;
        daysAbsent?: number;
        days_late?: number;
        days_absent?: number;
        rating: number;
        remarks?: string;
    };
    attitudes?: {
        supervisor_rating: number;
        supervisor_remarks?: string;
        coworker_rating: number;
        coworker_remarks?: string;
    };
    workAttitude?: {
        responsible: number;
        jobKnowledge?: number;
        job_knowledge?: number;
        cooperation: number;
        initiative: number;
        dependability: number;
        remarks?: string;
    };
    workFunctions?: Array<{
        function_name: string;
        work_quality: number;
        work_efficiency: number;
    }>;
    observations?: string;
    evaluator?: string;
    
    // Legacy evaluation format
    work_quality?: string;
    teamwork?: string;
    safety_compliance?: string;
    punctuality?: string;
    equipment_handling?: string;
    organization?: string;
    comment?: string;
}
