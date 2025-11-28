import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContentLoading } from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { evaluationDepartments as globalDepartments } from '@/hooks/data';
import { Employees } from '@/hooks/employees';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, FileText, RotateCcw, Star, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { WorkFunctionsSection } from './components/work-functions-section';
import {
    getAllWorkFunctions,
    getCriteriaLabel,
    getDefaultDepartmentSettings,
    getDepartmentSettings,
    getWorkFunctionDescription,
    getWorkFunctionName,
    hasWorkFunctionDescription,
} from './types/evaluation-settings';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
    {
        title: 'Department Evaluation',
        href: '/evaluation/department-evaluation',
    },
];

interface Props {
    departments: string[];
    employees_all: Employees[];
    evaluation_configs: any[];
    supervisor_assignments: Array<{
        id: number;
        department: string;
        supervisor_name: string;
        supervisor_email: string;
        can_evaluate: boolean;
    }>;
    hr_assignments?: Array<{
        id: number;
        department: string;
        user: {
            id: number;
            firstname: string;
            lastname: string;
            email: string;
        };
    }>;
    manager_assignments?: Array<{
        id: number;
        department: string;
        user: {
            id: number;
            firstname: string;
            lastname: string;
            email: string;
        };
    }>;
    user_permissions: {
        can_evaluate: boolean;
        is_super_admin: boolean;
        is_supervisor: boolean;
        evaluable_departments: string[];
    };
}

interface EvaluationData {
    attendance: {
        daysLate: number;
        daysAbsent: number;
        rating: number;
        remarks: string;
    };
    attitudeSupervisor: {
        rating: number;
        remarks: string;
    };
    attitudeCoworker: {
        rating: number;
        remarks: string;
    };
    workAttitude: {
        responsible: number;
        jobKnowledge: number;
        cooperation: number;
        initiative: number;
        dependability: number;
        remarks: string;
    };
    workFunctions: {
        [key: string]: {
            workQuality: number;
            workEfficiency: number;
        };
    };
    observations: string;
    evaluator: string;
}

// Department-specific work functions are now managed through evaluation settings
// See: ./types/evaluation-settings.ts

export default function DepartmentEvaluation({
    departments,
    employees_all,
    evaluation_configs,
    supervisor_assignments,
    hr_assignments = [],
    manager_assignments = [],
    user_permissions,
}: Props) {
    // DEBUG: Log props when component mounts or props change
    useEffect(() => {
        console.log('🔍 [DEBUG] Component props received:');
        console.log('  - supervisor_assignments:', supervisor_assignments);
        console.log('  - supervisor_assignments type:', typeof supervisor_assignments);
        console.log('  - supervisor_assignments is array:', Array.isArray(supervisor_assignments));
        console.log('  - supervisor_assignments length:', supervisor_assignments?.length);
        if (supervisor_assignments && supervisor_assignments.length > 0) {
            console.log('  - First assignment sample:', supervisor_assignments[0]);
            console.log('  - All assignments:', JSON.stringify(supervisor_assignments, null, 2));
        }
    }, [supervisor_assignments]);

    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [evaluationData, setEvaluationData] = useState<EvaluationData>({
        attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
        attitudeSupervisor: { rating: 0, remarks: '' },
        attitudeCoworker: { rating: 0, remarks: '' },
        workAttitude: {
            responsible: 0,
            jobKnowledge: 0,
            cooperation: 0,
            initiative: 0,
            dependability: 0,
            remarks: '',
        },
        workFunctions: {},
        observations: '',
        evaluator: '',
    });

    // State for existing evaluation
    const [existingEvaluation, setExistingEvaluation] = useState<any>(null);
    const [isFormReadOnly, setIsFormReadOnly] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Use global departments instead of prop departments
    const availableDepartments = globalDepartments;

    // Function to get supervisor(s) for a department from database assignments
    // Flow:
    // 1. User selects department (e.g., "Packing Plant")
    // 2. This function filters supervisor_assignments from supervisor_departments table where:
    //    - department column matches selected department
    //    - can_evaluate = true
    //    - user_id links to users table (user must have "Supervisor" role)
    // 3. Returns the supervisor's employee name (fetched from employees table via email)
    const getSupervisorForDepartment = (department: string) => {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🔍 [DEBUG] getSupervisorForDepartment called');
        console.log('  📋 Input department:', department);
        console.log('  📊 Total supervisor_assignments available:', supervisor_assignments?.length || 0);
        console.log('  📦 supervisor_assignments data:', supervisor_assignments);

        if (!department) {
            console.warn('⚠️ [DEBUG] No department provided');
            return 'No Department Selected';
        }

        if (!supervisor_assignments || supervisor_assignments.length === 0) {
            console.warn('⚠️ [DEBUG] No supervisor_assignments available');
            return 'No Supervisor Assignments Found';
        }

        // Filter supervisor assignments by department and can_evaluate flag
        // supervisor_assignments comes from supervisor_departments table in database
        // Structure: { id, department, supervisor_name, supervisor_email, can_evaluate }
        const assignments = supervisor_assignments.filter((assignment) => {
            const matchesDepartment = assignment.department === department;
            const canEvaluate = assignment.can_evaluate === true;

            // DEBUG: Log each assignment check
            console.log('  🔎 Checking assignment:', {
                assignment_id: assignment.id,
                assignment_department: `"${assignment.department}"`,
                selected_department: `"${department}"`,
                department_match: matchesDepartment,
                can_evaluate_value: assignment.can_evaluate,
                can_evaluate_type: typeof assignment.can_evaluate,
                can_evaluate_match: canEvaluate,
                supervisor_name: assignment.supervisor_name,
                supervisor_email: assignment.supervisor_email,
                will_include: matchesDepartment && canEvaluate,
            });

            return matchesDepartment && canEvaluate;
        });

        console.log('  ✅ Filtered assignments count:', assignments.length);
        console.log('  📋 Filtered assignments:', assignments);

        if (assignments.length === 0) {
            console.warn('⚠️ [DEBUG] No supervisor found for department:', department);
            // DEBUG: Check if there are any assignments for this department without can_evaluate filter
            const deptOnlyAssignments = supervisor_assignments.filter((a) => a.department === department);
            console.log('  🔍 Assignments for department (ignoring can_evaluate):', deptOnlyAssignments);

            // Check for partial matches (case-insensitive, contains, etc.)
            const partialMatches = supervisor_assignments.filter(
                (a) => a.department.toLowerCase().includes(department.toLowerCase()) || department.toLowerCase().includes(a.department.toLowerCase()),
            );
            console.log('  🔍 Partial department matches:', partialMatches);

            return 'No Supervisor Assigned';
        } else if (assignments.length === 1) {
            // Return the supervisor's full name (e.g., "Kyle Lastname" from employees table)
            const supervisorName = assignments[0].supervisor_name;
            console.log('  ✅ [SUCCESS] Found supervisor:', supervisorName);
            console.log('  📧 Supervisor email:', assignments[0].supervisor_email);
            console.log('═══════════════════════════════════════════════════════════');
            return supervisorName;
        } else {
            // Multiple evaluators - join with " / " separator
            const names = assignments.map((assignment) => assignment.supervisor_name).join(' / ');
            console.log('  ✅ [SUCCESS] Found multiple supervisors:', names);
            console.log('═══════════════════════════════════════════════════════════');
            return names;
        }
    };

    // Function to get all evaluators for a department (for debugging or display purposes)
    const getEvaluatorsForDepartment = (department: string) => {
        return supervisor_assignments.filter((assignment) => assignment.department === department && assignment.can_evaluate);
    };

    // Function to get HR Personnel for a department (filtered by department from hr_department_assignments table)
    const getHRForDepartment = (department: string) => {
        const assignments = hr_assignments?.filter((assignment) => assignment.department === department) || [];

        if (assignments.length === 0) {
            return 'No HR Personnel Assigned';
        } else if (assignments.length === 1) {
            return `${assignments[0].user.firstname} ${assignments[0].user.lastname}`;
        } else {
            // Multiple HR Personnel - join with " / " separator
            return assignments.map((assignment) => `${assignment.user.firstname} ${assignment.user.lastname}`).join(' / ');
        }
    };

    // Function to get Manager for a department
    const getManagerForDepartment = (department: string) => {
        const assignments = manager_assignments?.filter((assignment) => assignment.department === department) || [];

        if (assignments.length === 0) {
            return 'No Manager Assigned';
        } else if (assignments.length === 1) {
            return `${assignments[0].user.firstname} ${assignments[0].user.lastname}`;
        } else {
            // Multiple Managers - join with " / " separator
            return assignments.map((assignment) => `${assignment.user.firstname} ${assignment.user.lastname}`).join(' / ');
        }
    };

    // Allowed departments based on role/permissions
    const allowedDepartments = useMemo(() => {
        if (user_permissions?.is_super_admin) return availableDepartments;
        if (Array.isArray(user_permissions?.evaluable_departments) && user_permissions.evaluable_departments.length > 0) {
            return availableDepartments.filter((dept) => user_permissions.evaluable_departments.includes(dept));
        }
        return availableDepartments;
    }, [availableDepartments, user_permissions]);

    // Filter employees by selected department and exclude those already evaluated
    const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
    const [isFilteringEmployees, setIsFilteringEmployees] = useState(false);

    // Filter employees when department changes
    useEffect(() => {
        if (!selectedDepartment) {
            setFilteredEmployees([]);
            return;
        }

        setIsFilteringEmployees(true);

        // Get current period and year for evaluation frequency check
        const now = new Date();
        const currentPeriod = now.getMonth() <= 5 ? 1 : 2; // Jan-Jun = 1, Jul-Dec = 2
        const currentYear = now.getFullYear();

        // Get evaluation frequency for the department
        const departmentFrequency = evaluation_configs.find((cfg) => cfg.department === selectedDepartment)?.evaluation_frequency || 'annual';

        // First filter by department
        const departmentEmployees = employees_all.filter((emp) => emp.department === selectedDepartment);

        // Auto-populate evaluator field when department changes
        // DEBUG: Log department change
        console.log('🔄 [DEBUG] Department changed to:', selectedDepartment);
        console.log('🔄 [DEBUG] Fetching supervisor for department...');

        const supervisorName = getSupervisorForDepartment(selectedDepartment);

        console.log('🔄 [DEBUG] Supervisor name retrieved:', supervisorName);
        console.log('🔄 [DEBUG] Updating evaluationData.evaluator to:', supervisorName);

        setEvaluationData((prev) => ({
            ...prev,
            evaluator: supervisorName,
        }));

        // Also update Inertia form data
        setData((prev) => ({ ...prev, evaluator: supervisorName }));

        console.log('🔄 [DEBUG] Evaluation data updated with supervisor:', supervisorName);

        // Check each employee's evaluation status
        const checkEmployeeEvaluationStatus = async () => {
            const availableEmployees = [];

            for (const emp of departmentEmployees) {
                try {
                    const response = await fetch(`/evaluation/check-existing/${emp.id}/${selectedDepartment}`);
                    const data = await response.json();

                    if (!data.exists) {
                        availableEmployees.push(emp);
                    }
                } catch (error) {
                    console.error(`Error checking evaluation for employee ${emp.employee_name}:`, error);
                    // If there's an error, include the employee to be safe
                    availableEmployees.push(emp);
                }
            }

            setFilteredEmployees(availableEmployees);
            setIsFilteringEmployees(false);
        };

        checkEmployeeEvaluationStatus();
    }, [selectedDepartment, employees_all, evaluation_configs]);

    // Get selected employee details
    const selectedEmployeeData = useMemo(() => {
        const matchId = (emp: any) => String((emp as any).id ?? (emp as any).employee_id ?? (emp as any).employeeid) === String(selectedEmployee);
        return employees_all.find((emp: any) => matchId(emp));
    }, [selectedEmployee, employees_all]);

    // Check for existing evaluation when employee is selected
    const checkExistingEvaluation = async (employeeId: string, department: string) => {
        if (!employeeId || !department) return;

        try {
            const response = await fetch(`/evaluation/check-existing/${employeeId}/${department}`);
            const data = await response.json();

            if (data.exists) {
                setExistingEvaluation(data.evaluation);
                setIsFormReadOnly(true);

                // Populate form with existing data
                if (data.evaluation.attendance) {
                    const newEvaluationData = {
                        attendance: {
                            daysLate: parseInt(data.evaluation.attendance.days_late) || 0,
                            daysAbsent: parseInt(data.evaluation.attendance.days_absent) || 0,
                            rating: parseFloat(data.evaluation.attendance.rating) || 10,
                            remarks: data.evaluation.attendance.remarks || '',
                        },
                        attitudeSupervisor: {
                            rating: parseFloat(data.evaluation.attitudes?.supervisor_rating) || 0,
                            remarks: data.evaluation.attitudes?.supervisor_remarks || '',
                        },
                        attitudeCoworker: {
                            rating: parseFloat(data.evaluation.attitudes?.coworker_rating) || 0,
                            remarks: data.evaluation.attitudes?.coworker_remarks || '',
                        },
                        workAttitude: {
                            responsible: parseFloat(data.evaluation.workAttitude?.responsible) || 0,
                            jobKnowledge: parseFloat(data.evaluation.workAttitude?.job_knowledge) || 0,
                            cooperation: parseFloat(data.evaluation.workAttitude?.cooperation) || 0,
                            initiative: parseFloat(data.evaluation.workAttitude?.initiative) || 0,
                            dependability: parseFloat(data.evaluation.workAttitude?.dependability) || 0,
                            remarks: data.evaluation.workAttitude?.remarks || '',
                        },
                        workFunctions: {} as { [key: string]: { workQuality: number; workEfficiency: number } },
                        observations: data.evaluation.observations || '',
                        evaluator: data.evaluation.evaluator || '',
                    };

                    // Handle work functions separately to ensure proper structure
                    // First, initialize with department's default work functions
                    const allFunctions = getAllWorkFunctions(department);
                    allFunctions.forEach((func: string) => {
                        (newEvaluationData.workFunctions as any)[func] = {
                            workQuality: 0,
                            workEfficiency: 0,
                        };
                    });

                    // Then, overlay any existing work functions data
                    if (data.evaluation.workFunctions && Array.isArray(data.evaluation.workFunctions)) {
                        data.evaluation.workFunctions.forEach((func: any) => {
                            if (func.function_name) {
                                // Check if this function exists in our department's work functions
                                if ((newEvaluationData.workFunctions as any)[func.function_name]) {
                                    (newEvaluationData.workFunctions as any)[func.function_name] = {
                                        workQuality: parseFloat(func.work_quality) || 0,
                                        workEfficiency: parseFloat(func.work_efficiency) || 0,
                                    };
                                }
                            }
                        });
                    }

                    // Set the complete evaluation data
                    setEvaluationData(newEvaluationData);
                }
            } else {
                setExistingEvaluation(null);
                setIsFormReadOnly(false);
                // Keep current selections and initialized form; do not reset on no existing evaluation
            }
        } catch (error) {
            console.error('Error checking existing evaluation:', error);
        }
    };

    // Fetch employee attendance data when employee is selected
    const fetchEmployeeAttendance = async (employeeId: string, department?: string) => {
        if (!employeeId) return;

        // Use provided department or fall back to selectedDepartment state
        const dept = department || selectedDepartment;
        if (!dept) {
            console.warn('⚠️ No department available for attendance fetch');
            return;
        }

        try {
            // Get current period and year for attendance calculation
            const now = new Date();
            const currentPeriod = now.getMonth() <= 5 ? 1 : 2; // Jan-Jun = 1, Jul-Dec = 2
            const currentYear = now.getFullYear();

            // Get department frequency to determine attendance period
            const departmentFrequency = evaluation_configs.find((cfg) => cfg.department === dept)?.evaluation_frequency || 'annual';

            let startDate, endDate;
            if (departmentFrequency === 'annual') {
                // For annual, get attendance for the entire year
                startDate = `${currentYear}-01-01`;
                endDate = `${currentYear}-12-31`;
            } else {
                // For semi-annual, get attendance for current period
                if (currentPeriod === 1) {
                    startDate = `${currentYear}-01-01`;
                    endDate = `${currentYear}-06-30`;
                } else {
                    startDate = `${currentYear}-07-01`;
                    endDate = `${currentYear}-12-31`;
                }
            }

            console.log('🔍 [DEBUG] Fetching attendance for:', {
                employeeId,
                department: dept,
                startDate,
                endDate,
                frequency: departmentFrequency,
            });

            const response = await fetch(`/api/employee-attendance/${employeeId}?start_date=${startDate}&end_date=${endDate}`);

            // Check if response is OK before parsing
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [DEBUG] API returned non-OK status:', response.status, errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            console.log('🔍 [DEBUG] Attendance API Response:', data);

            if (data.success && data.attendance) {
                const daysLate = Number(data.attendance.days_late) || 0;
                const daysAbsent = Number(data.attendance.days_absent) || 0;

                console.log('✅ [DEBUG] Setting attendance data:', {
                    daysLate,
                    daysAbsent,
                });

                setEvaluationData((prev) => ({
                    ...prev,
                    attendance: {
                        ...prev.attendance,
                        daysLate,
                        daysAbsent,
                    },
                }));

                // Also update Inertia form data
                setData((prev) => ({
                    ...prev,
                    attendance: {
                        ...prev.attendance,
                        daysLate,
                        daysAbsent,
                    },
                }));
            } else {
                console.warn('⚠️ [DEBUG] API response missing success or attendance data:', data);
                // If API fails, set default values
                setEvaluationData((prev) => ({
                    ...prev,
                    attendance: {
                        ...prev.attendance,
                        daysLate: 0,
                        daysAbsent: 0,
                    },
                }));
            }
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching employee attendance:', error);
            // Set default values on error
            setEvaluationData((prev) => ({
                ...prev,
                attendance: {
                    ...prev.attendance,
                    daysLate: 0,
                    daysAbsent: 0,
                },
            }));
        }
    };

    // Get evaluation frequency for selected department
    const departmentEvaluationFrequency = useMemo(() => {
        if (!selectedDepartment) return 'annual';
        // Ensure evaluation_configs is an array before using .find()
        if (!Array.isArray(evaluation_configs)) return 'annual';
        const config = evaluation_configs.find((cfg) => cfg.department === selectedDepartment);
        return config ? config.evaluation_frequency : 'annual';
    }, [selectedDepartment, evaluation_configs]);

    // Initialize work functions when department changes
    useEffect(() => {
        if (selectedDepartment) {
            const departmentSettings = getDepartmentSettings(selectedDepartment) || getDefaultDepartmentSettings(selectedDepartment);
            const allFunctions = getAllWorkFunctions(selectedDepartment);
            const initialWorkFunctions: { [key: string]: { workQuality: number; workEfficiency: number } } = {};

            allFunctions.forEach((func: string) => {
                // Always initialize with default values - existing data will be loaded separately
                initialWorkFunctions[func] = { workQuality: 0, workEfficiency: 0 };
            });

            // Initialize work functions structure for the department
            setEvaluationData((prev) => {
                // Only initialize if work functions are empty or don't match the current department
                const currentWorkFunctions = prev.workFunctions || {};
                const expectedFunctions = allFunctions || [];

                // Check if we need to initialize (empty or different structure)
                const needsInitialization =
                    Object.keys(currentWorkFunctions).length === 0 || !expectedFunctions.every((func) => currentWorkFunctions[func]);

                if (needsInitialization) {
                    return {
                        ...prev,
                        workFunctions: initialWorkFunctions,
                    };
                } else {
                    return prev;
                }
            });
        }
    }, [selectedDepartment]);

    // Calculate attendance rating
    const calculateAttendanceRating = (late: number, absent: number) => {
        const total = late + absent;
        // Better formula: Perfect attendance (0 late/absent) = 10, Max penalty = 0
        // Formula: 10 - (total / 24) * 10, capped at 0
        const rating = Math.max(0, 10 - (total / 24) * 10);
        return Math.round(rating * 10) / 10;
    };

    // Update attendance rating when late/absent changes
    useEffect(() => {
        const rating = calculateAttendanceRating(evaluationData.attendance.daysLate, evaluationData.attendance.daysAbsent);
        setEvaluationData((prev) => ({
            ...prev,
            attendance: { ...prev.attendance, rating },
        }));
    }, [evaluationData.attendance.daysLate, evaluationData.attendance.daysAbsent]);

    // Calculate total rating
    const totalRating = useMemo(() => {
        // Check if any actual evaluation has been done
        const hasEvaluationData =
            evaluationData.attitudeSupervisor.rating > 0 ||
            evaluationData.attitudeCoworker.rating > 0 ||
            evaluationData.workAttitude.responsible > 0 ||
            evaluationData.workAttitude.jobKnowledge > 0 ||
            evaluationData.workAttitude.cooperation > 0 ||
            evaluationData.workAttitude.initiative > 0 ||
            evaluationData.workAttitude.dependability > 0 ||
            Object.values(evaluationData.workFunctions || {}).some((func: any) => (func?.workQuality || 0) > 0 || (func?.workEfficiency || 0) > 0);

        // If no evaluation data has been entered, return null
        if (!hasEvaluationData) {
            return null;
        }

        const attendanceScore = evaluationData.attendance.rating || 0;
        const attitudeSupervisorScore = evaluationData.attitudeSupervisor.rating || 0;
        const attitudeCoworkerScore = evaluationData.attitudeCoworker.rating || 0;

        const workAttitudeScores = [
            evaluationData.workAttitude.responsible || 0,
            evaluationData.workAttitude.jobKnowledge || 0,
            evaluationData.workAttitude.cooperation || 0,
            evaluationData.workAttitude.initiative || 0,
            evaluationData.workAttitude.dependability || 0,
        ];
        const workAttitudeAvg = workAttitudeScores.reduce((a, b) => a + b, 0) / workAttitudeScores.length;

        const workFunctionScores = Object.values(evaluationData.workFunctions || {}).map((func: any) => {
            const quality = func?.workQuality || 0;
            const efficiency = func?.workEfficiency || 0;
            return (quality + efficiency) / 2;
        });
        const workFunctionAvg = workFunctionScores.length > 0 ? workFunctionScores.reduce((a, b) => a + b, 0) / workFunctionScores.length : 0;

        // Get department settings to determine number of criteria
        const departmentSettings = getDepartmentSettings(selectedDepartment) || getDefaultDepartmentSettings(selectedDepartment);
        const isCoopArea = selectedDepartment === 'Coop Area';

        let total;
        if (isCoopArea) {
            // Coop Area has only 4 criteria: Attendance, Attitude Towards ARB, Work Attitude, Work Operations
            total = (attendanceScore + attitudeSupervisorScore + workAttitudeAvg + workFunctionAvg) / 4;
        } else {
            // Other departments have 5 criteria: Attendance, Attitude Towards Supervisor, Attitude Towards Co-worker, Work Attitude, Work Operations
            total = (attendanceScore + attitudeSupervisorScore + attitudeCoworkerScore + workAttitudeAvg + workFunctionAvg) / 5;
        }

        // Ensure we don't return NaN
        return isNaN(total) ? 0 : Math.round(total * 10) / 10;
    }, [evaluationData, existingEvaluation, selectedDepartment]);

    // Get rating label and color
    const getRatingInfo = (rating: number | null) => {
        if (rating === null) return { label: 'No Rating', color: 'text-gray-500' };
        if (rating >= 8) return { label: 'Very Satisfactory', color: 'text-green-600' };
        if (rating >= 5) return { label: 'Satisfactory', color: 'text-yellow-600' };
        return { label: 'Needs Improvement', color: 'text-red-600' };
    };

    // Initialize Inertia form
    const { data, setData, post, processing, errors } = useForm({
        department: '',
        employee_id: '',
        attendance: {
            daysLate: 0,
            daysAbsent: 0,
            rating: 10,
            remarks: '',
        },
        attitudeSupervisor: {
            rating: 0,
            remarks: '',
        },
        attitudeCoworker: {
            rating: 0,
            remarks: '',
        },
        workAttitude: {
            responsible: 0,
            jobKnowledge: 0,
            cooperation: 0,
            initiative: 0,
            dependability: 0,
            remarks: '',
        },
        workFunctions: {},
        observations: '',
        evaluator: '',
    });

    // Remove problematic useEffect hooks that cause infinite loops
    // useEffect(() => {
    //     if (Object.keys(evaluationData.workFunctions).length > 0) {
    //         setData((prev) => ({
    //             ...prev,
    //             workFunctions: evaluationData.workFunctions,
    //         }));
    //     }
    // }, [evaluationData.workFunctions, setData]);

    // Sync all evaluation data with Inertia form when it changes
    useEffect(() => {
        // Keep Inertia form data in sync with component state at all times
        setData((prev) => ({
            ...prev,
            attendance: evaluationData.attendance,
            attitudeSupervisor: evaluationData.attitudeSupervisor,
            attitudeCoworker: evaluationData.attitudeCoworker,
            workAttitude: evaluationData.workAttitude,
            workFunctions: evaluationData.workFunctions,
            observations: evaluationData.observations,
            evaluator: evaluationData.evaluator,
        }));
    }, [evaluationData, setData]);

    const handleSubmit = () => {
        if (isFormReadOnly) {
            toast.error('Cannot submit evaluation for an employee who has already been evaluated');
            return;
        }

        if (!selectedDepartment || !selectedEmployee) {
            toast.error('Please select both department and employee');
            return;
        }

        if (!evaluationData.evaluator.trim()) {
            toast.error('Please enter evaluator name and position');
            return;
        }

        // Check if workFunctions has data
        if (Object.keys(evaluationData.workFunctions).length === 0) {
            toast.error('Please complete the work functions evaluation');
            return;
        }

        const payload = {
            department: selectedDepartment,
            employee_id: selectedEmployee,
            attendance: evaluationData.attendance,
            attitudeSupervisor: evaluationData.attitudeSupervisor,
            attitudeCoworker: evaluationData.attitudeCoworker,
            workAttitude: evaluationData.workAttitude,
            workFunctions: evaluationData.workFunctions,
            observations: evaluationData.observations,
            evaluator: evaluationData.evaluator,
        } as const;

        setSubmitting(true);
        const submitPromise = new Promise<void>((resolve, reject) => {
            router.post('/evaluation/department-evaluation', payload, {
                onSuccess: () => {
                    setSubmitting(false);
                    resolve();
                    handleReset();
                },
                onError: (errors: any) => {
                    setSubmitting(false);
                    console.error('Form errors:', errors);
                    reject(errors);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
                preserveScroll: true,
            });
        });

        toast.promise(submitPromise, {
            loading: 'Submitting evaluation... calculating ratings...',
            success: 'Evaluation submitted successfully!',
            error: 'Failed to submit evaluation. Please check your inputs.',
        });
    };

    const handleReset = () => {
        setSelectedDepartment('');
        setSelectedEmployee('');
        setExistingEvaluation(null);
        setIsFormReadOnly(false);
        setEvaluationData({
            attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
            attitudeSupervisor: { rating: 0, remarks: '' },
            attitudeCoworker: { rating: 0, remarks: '' },
            workAttitude: {
                responsible: 0,
                jobKnowledge: 0,
                cooperation: 0,
                initiative: 0,
                dependability: 0,
                remarks: '',
            },
            workFunctions: {},
            observations: '',
            evaluator: '',
        });

        // Reset Inertia form data
        setData({
            department: '',
            employee_id: '',
            attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
            attitudeSupervisor: { rating: 0, remarks: '' },
            attitudeCoworker: { rating: 0, remarks: '' },
            workAttitude: {
                responsible: 0,
                jobKnowledge: 0,
                cooperation: 0,
                initiative: 0,
                dependability: 0,
                remarks: '',
            },
            workFunctions: {},
            observations: '',
            evaluator: '',
        });
    };

    const StarRating = ({
        rating,
        onRatingChange,
        size = 'md',
        disabled = false,
    }: {
        rating: number;
        onRatingChange: (rating: number) => void;
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
    }) => {
        const sizeClasses = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        className={`transition-colors hover:scale-110 focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={disabled}
                    >
                        <Star className={`${sizeClasses[size]} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">{rating}/10</span>
            </div>
        );
    };

    return (
        <SidebarProvider>
            <Head title="Department Evaluation" />
            {/* <Toaster position="top-center" richColors /> */}

            {/* Sidebar hover logic */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {processing ? (
                        <ContentLoading />
                    ) : (
                        <>
                            <Main fixed>
                                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                    <div>
                                        <div className="ms-2 flex items-center">
                                            <Users className="size-11" />
                                            <div className="ms-2">
                                                <h2 className="flex text-2xl font-bold tracking-tight">Department Evaluation</h2>
                                                <p className="text-muted-foreground">Evaluate employees by department with specific criteria</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Department and Employee Selection */}
                                <Card className="border-main dark:bg-backgrounds mb-6 bg-background drop-shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Department & Employee Selection</CardTitle>
                                        <CardDescription>Select department and employee to begin evaluation</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            {/* Department Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Department
                                                    <span className="ms-1 text-sm text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={selectedDepartment}
                                                    onValueChange={async (value) => {
                                                        setSelectedDepartment(value);
                                                        setData((prev) => ({ ...prev, department: value }));
                                                        // Clear employee selection when department changes
                                                        setSelectedEmployee('');
                                                        setExistingEvaluation(null);
                                                        setIsFormReadOnly(false);
                                                        // Reset evaluation data to clear any previous data
                                                        setEvaluationData({
                                                            attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
                                                            attitudeSupervisor: { rating: 0, remarks: '' },
                                                            attitudeCoworker: { rating: 0, remarks: '' },
                                                            workAttitude: {
                                                                responsible: 0,
                                                                jobKnowledge: 0,
                                                                cooperation: 0,
                                                                initiative: 0,
                                                                dependability: 0,
                                                                remarks: '',
                                                            },
                                                            workFunctions: {},
                                                            observations: '',
                                                            evaluator: value ? getSupervisorForDepartment(value) : '',
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allowedDepartments.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Employee Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Employee
                                                    <span className="ms-1 text-sm text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={selectedEmployee}
                                                    onValueChange={async (value) => {
                                                        setSelectedEmployee(value);
                                                        setData((prev) => ({ ...prev, employee_id: value }));
                                                        if (value && selectedDepartment) {
                                                            // Check for existing evaluation first
                                                            await checkExistingEvaluation(value, selectedDepartment);

                                                            // Fetch fresh employee attendance data
                                                            // This will update the attendance fields with current data from the attendance table
                                                            await fetchEmployeeAttendance(value, selectedDepartment);
                                                        }
                                                    }}
                                                    disabled={!selectedDepartment}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue
                                                            placeholder={selectedDepartment ? 'Select Employee' : 'Select Department First'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {isFilteringEmployees ? (
                                                            <div className="px-2 py-1 text-sm text-gray-500">Loading available employees...</div>
                                                        ) : filteredEmployees.length > 0 ? (
                                                            filteredEmployees.map((emp: any) => (
                                                                <SelectItem
                                                                    key={String(
                                                                        (emp as any).id ?? (emp as any).employee_id ?? (emp as any).employeeid,
                                                                    )}
                                                                    value={String(
                                                                        (emp as any).id ?? (emp as any).employee_id ?? (emp as any).employeeid,
                                                                    )}
                                                                >
                                                                    {emp.employee_name} - {emp.position}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="px-2 py-1 text-sm text-gray-500">
                                                                No employees available for evaluation in this department
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Work Status Display */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Work Status</Label>
                                                <div className="rounded-lg border bg-gray-50 px-3 py-2">
                                                    {selectedEmployeeData ? (
                                                        <Badge variant="secondary" className="text-sm">
                                                            {selectedEmployeeData.work_status}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Select employee to view status</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Department Evaluation Frequency */}
                                        {selectedDepartment && (
                                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <div className="text-sm text-blue-700">
                                                    <strong>Evaluation Frequency:</strong>{' '}
                                                    {departmentEvaluationFrequency === 'semi_annual' ? 'Semi-Annual (Jan-Jun & Jul-Dec)' : 'Annual'}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Employee Info */}
                                        {selectedEmployeeData && (
                                            <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={
                                                            typeof selectedEmployeeData.picture === 'string'
                                                                ? selectedEmployeeData.picture
                                                                : '/Logo.png'
                                                        }
                                                        alt={selectedEmployeeData.employee_name}
                                                        className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg"
                                                    />
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-800">{selectedEmployeeData.employee_name}</h3>
                                                        <p className="text-gray-600">{selectedEmployeeData.position}</p>
                                                        <p className="text-sm text-gray-500">ID: {selectedEmployeeData.employeeid}</p>
                                                    </div>
                                                </div>

                                                {/* Evaluation Status */}
                                                <div className="mt-4 rounded-lg border border-blue-200 bg-white p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-blue-700">
                                                            <strong>Evaluation Status:</strong>
                                                        </div>
                                                        <div className="text-right">
                                                            {(() => {
                                                                const now = new Date();
                                                                const currentPeriod = now.getMonth() <= 5 ? 1 : 2;
                                                                const currentYear = now.getFullYear();
                                                                const periodLabel = currentPeriod === 1 ? 'Jan-Jun' : 'Jul-Dec';
                                                                const frequency = departmentEvaluationFrequency;

                                                                return (
                                                                    <div className="text-sm">
                                                                        <div className="font-medium text-blue-800">
                                                                            {frequency === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
                                                                        </div>
                                                                        <div className="text-blue-600">
                                                                            Current Period: {periodLabel} {currentYear}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Existing Evaluation Warning */}
                                                {existingEvaluation && (
                                                    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-orange-600">⚠️</div>
                                                            <div>
                                                                <div className="font-medium text-orange-800">Employee Already Evaluated</div>
                                                                <div className="text-sm text-orange-700">
                                                                    {existingEvaluation.message ||
                                                                        'This employee has already been evaluated for the current period.'}
                                                                </div>
                                                                <div className="mt-1 text-xs text-orange-600">
                                                                    Evaluation Date: {existingEvaluation.rating_date}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Evaluation Form */}
                                {selectedEmployeeData && (
                                    <div className="space-y-6">
                                        {/* Read-Only Message */}
                                        {isFormReadOnly && (
                                            <Card className="border-main dark:bg-backgrounds border-orange-200 bg-orange-50 drop-shadow-lg">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">📋</div>
                                                        <div>
                                                            <div className="font-medium text-orange-800">Viewing Existing Evaluation</div>
                                                            <div className="text-sm text-orange-700">
                                                                This form is read-only because the employee has already been evaluated for the current
                                                                period. You can view the evaluation details or clear the form to start a new
                                                                evaluation.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Attendance */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5" />
                                                    {getCriteriaLabel(selectedDepartment, 'attendance') || '1. Attendance'}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Days Late</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={evaluationData.attendance.daysLate}
                                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                                            readOnly={true}
                                                            disabled={true}
                                                        />
                                                       
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Days Absent</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={evaluationData.attendance.daysAbsent}
                                                            className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                                            readOnly={true}
                                                            disabled={true}
                                                        />
                                                       
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                                    <div className="mb-2 text-sm text-green-700">
                                                        <strong>Formula:</strong> 10 - ((Late + Absent) / 24 × 10) = Rating (minimum: 0)
                                                    </div>
                                                    <div className="mb-2 text-sm text-green-700">
                                                        <strong>Calculation:</strong> 10 - ({evaluationData.attendance.daysLate} +{' '}
                                                        {evaluationData.attendance.daysAbsent}) / 24 × 10 ={' '}
                                                        {(
                                                            10 -
                                                            ((evaluationData.attendance.daysLate + evaluationData.attendance.daysAbsent) / 24) * 10
                                                        ).toFixed(1)}
                                                    </div>
                                                    <div className="text-lg font-semibold text-green-800">
                                                        Calculated Rating: {evaluationData.attendance.rating}
                                                    </div>
                                                    <div className="mt-2 text-sm text-green-600">
                                                        {evaluationData.attendance.rating >= 8
                                                            ? 'Excellent Attendance'
                                                            : evaluationData.attendance.rating >= 5
                                                              ? 'Good Attendance'
                                                              : evaluationData.attendance.rating >= 3
                                                                ? 'Fair Attendance'
                                                                : 'Poor Attendance'}
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Remarks</label>
                                                    <Textarea
                                                        placeholder="Enter remarks about attendance..."
                                                        value={evaluationData.attendance.remarks}
                                                        onChange={(e) =>
                                                            setEvaluationData((prev) => ({
                                                                ...prev,
                                                                attendance: { ...prev.attendance, remarks: e.target.value },
                                                            }))
                                                        }
                                                        className="resize-none"
                                                        readOnly={isFormReadOnly}
                                                        disabled={isFormReadOnly}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 2. Attitude Towards Supervisor */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    {getCriteriaLabel(selectedDepartment, 'attitudeTowardsSupervisor') ||
                                                        '2. Attitude Towards Supervisor'}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                                                        <StarRating
                                                            rating={evaluationData.attitudeSupervisor.rating}
                                                            onRatingChange={(rating) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attitudeSupervisor: { ...prev.attitudeSupervisor, rating },
                                                                }))
                                                            }
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Remarks</label>
                                                        <Textarea
                                                            placeholder="Enter remarks about attitude towards supervisor..."
                                                            value={evaluationData.attitudeSupervisor.remarks}
                                                            onChange={(e) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attitudeSupervisor: { ...prev.attitudeSupervisor, remarks: e.target.value },
                                                                }))
                                                            }
                                                            className="resize-none"
                                                            readOnly={isFormReadOnly}
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Attitude Towards Co-worker */}
                                        {(() => {
                                            const departmentSettings =
                                                getDepartmentSettings(selectedDepartment) || getDefaultDepartmentSettings(selectedDepartment);
                                            if (departmentSettings.showAttitudeTowardsCoworker !== false) {
                                                return (
                                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                                        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                            <CardTitle className="flex items-center gap-2">
                                                                <User className="h-5 w-5" />
                                                                {getCriteriaLabel(selectedDepartment, 'attitudeTowardsCoworker') ||
                                                                    '3. Attitude Towards Co-worker'}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-6">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                                                                    <StarRating
                                                                        rating={evaluationData.attitudeCoworker.rating}
                                                                        onRatingChange={(rating) =>
                                                                            setEvaluationData((prev) => ({
                                                                                ...prev,
                                                                                attitudeCoworker: { ...prev.attitudeCoworker, rating },
                                                                            }))
                                                                        }
                                                                        disabled={isFormReadOnly}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-sm font-medium text-gray-700">Remarks</label>
                                                                    <Textarea
                                                                        placeholder="Enter remarks about attitude towards co-workers..."
                                                                        value={evaluationData.attitudeCoworker.remarks}
                                                                        onChange={(e) =>
                                                                            setEvaluationData((prev) => ({
                                                                                ...prev,
                                                                                attitudeCoworker: {
                                                                                    ...prev.attitudeCoworker,
                                                                                    remarks: e.target.value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        className="resize-none"
                                                                        readOnly={isFormReadOnly}
                                                                        disabled={isFormReadOnly}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Work Attitude/Performance */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    {getCriteriaLabel(selectedDepartment, 'workAttitude') || '4. Work Attitude/Performance'}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700">Responsible in Work Assignment</div>
                                                            <p className="text-xs text-gray-500">
                                                                Completes assigned tasks on time and follows instructions with minimal supervision.
                                                            </p>
                                                            <div className="mt-1">
                                                                <StarRating
                                                                    rating={evaluationData.workAttitude.responsible}
                                                                    onRatingChange={(rating) =>
                                                                        setEvaluationData((prev) => ({
                                                                            ...prev,
                                                                            workAttitude: { ...prev.workAttitude, responsible: rating },
                                                                        }))
                                                                    }
                                                                    disabled={isFormReadOnly}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700">Job Knowledge</div>
                                                            <p className="text-xs text-gray-500">
                                                                Understands job duties, tools, and procedures necessary for effective work.
                                                            </p>
                                                            <div className="mt-1">
                                                                <StarRating
                                                                    rating={evaluationData.workAttitude.jobKnowledge}
                                                                    onRatingChange={(rating) =>
                                                                        setEvaluationData((prev) => ({
                                                                            ...prev,
                                                                            workAttitude: { ...prev.workAttitude, jobKnowledge: rating },
                                                                        }))
                                                                    }
                                                                    disabled={isFormReadOnly}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700">Cooperation</div>
                                                            <p className="text-xs text-gray-500">
                                                                Works well with others, shares knowledge, and contributes to a positive work
                                                                environment.
                                                            </p>
                                                            <div className="mt-1">
                                                                <StarRating
                                                                    rating={evaluationData.workAttitude.cooperation}
                                                                    onRatingChange={(rating) =>
                                                                        setEvaluationData((prev) => ({
                                                                            ...prev,
                                                                            workAttitude: { ...prev.workAttitude, cooperation: rating },
                                                                        }))
                                                                    }
                                                                    disabled={isFormReadOnly}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700">Work Initiative</div>
                                                            <p className="text-xs text-gray-500">
                                                                Takes initiative to complete tasks, identifies improvements, and proactively addresses
                                                                issues.
                                                            </p>
                                                            <div className="mt-1">
                                                                <StarRating
                                                                    rating={evaluationData.workAttitude.initiative}
                                                                    onRatingChange={(rating) =>
                                                                        setEvaluationData((prev) => ({
                                                                            ...prev,
                                                                            workAttitude: { ...prev.workAttitude, initiative: rating },
                                                                        }))
                                                                    }
                                                                    disabled={isFormReadOnly}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700">Dependability</div>
                                                            <p className="text-xs text-gray-500">
                                                                Reliable, follows through on commitments, and consistently meets deadlines.
                                                            </p>
                                                            <div className="mt-1">
                                                                <StarRating
                                                                    rating={evaluationData.workAttitude.dependability}
                                                                    onRatingChange={(rating) =>
                                                                        setEvaluationData((prev) => ({
                                                                            ...prev,
                                                                            workAttitude: { ...prev.workAttitude, dependability: rating },
                                                                        }))
                                                                    }
                                                                    disabled={isFormReadOnly}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <label className="text-sm font-medium text-gray-700">Overall Work Attitude Remarks</label>
                                                    <Textarea
                                                        placeholder="Enter overall remarks about work attitude and performance..."
                                                        value={evaluationData.workAttitude.remarks}
                                                        onChange={(e) =>
                                                            setEvaluationData((prev) => ({
                                                                ...prev,
                                                                workAttitude: { ...prev.workAttitude, remarks: e.target.value },
                                                            }))
                                                        }
                                                        className="resize-none"
                                                        readOnly={isFormReadOnly}
                                                        disabled={isFormReadOnly}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 4. Work Operations - For Coop Area Department */}
                                        {(() => {
                                            const departmentSettings =
                                                getDepartmentSettings(selectedDepartment) || getDefaultDepartmentSettings(selectedDepartment);
                                            if (
                                                departmentSettings.showWorkFunctions === false &&
                                                departmentSettings.workFunctions &&
                                                typeof departmentSettings.workFunctions === 'object' &&
                                                'sections' in departmentSettings.workFunctions
                                            ) {
                                                return (
                                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                                        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                                                            <CardTitle className="flex items-center gap-2">
                                                                <FileText className="h-5 w-5" />
                                                                {getCriteriaLabel(selectedDepartment, 'workOperations') || '4. Work Operations'}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="p-6">
                                                            {/* Department Description */}
                                                            <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
                                                                <p className="text-sm text-teal-700">{departmentSettings.description}</p>
                                                            </div>

                                                            {/* Render structured work functions */}
                                                            <div className="space-y-8">
                                                                {departmentSettings.workFunctions.sections.map(
                                                                    (section: any, sectionIndex: number) => (
                                                                        <div key={sectionIndex} className="space-y-4">
                                                                            <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
                                                                                {section.title}
                                                                            </h3>
                                                                            <div className="space-y-4">
                                                                                {section.items.map((workFunctionItem: any, index: number) => {
                                                                                    const workFunctionName = getWorkFunctionName(workFunctionItem);
                                                                                    const workFunctionDescription =
                                                                                        getWorkFunctionDescription(workFunctionItem);
                                                                                    const hasDescription =
                                                                                        hasWorkFunctionDescription(workFunctionItem);

                                                                                    return (
                                                                                        <div key={index} className="rounded-lg border bg-gray-50 p-4">
                                                                                            <h4 className="mb-2 font-medium text-gray-800">
                                                                                                {workFunctionName}
                                                                                            </h4>
                                                                                            {hasDescription && (
                                                                                                <p className="mb-4 text-sm text-gray-600 italic">
                                                                                                    {workFunctionDescription}
                                                                                                </p>
                                                                                            )}
                                                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                                                <div>
                                                                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                                                                        Work Quality (1-10)
                                                                                                    </label>
                                                                                                    <StarRating
                                                                                                        rating={
                                                                                                            evaluationData.workFunctions[
                                                                                                                workFunctionName
                                                                                                            ]?.workQuality || 0
                                                                                                        }
                                                                                                        onRatingChange={(rating) =>
                                                                                                            setEvaluationData((prev: any) => ({
                                                                                                                ...prev,
                                                                                                                workFunctions: {
                                                                                                                    ...prev.workFunctions,
                                                                                                                    [workFunctionName]: {
                                                                                                                        ...prev.workFunctions[
                                                                                                                            workFunctionName
                                                                                                                        ],
                                                                                                                        workQuality: rating,
                                                                                                                    },
                                                                                                                },
                                                                                                            }))
                                                                                                        }
                                                                                                        disabled={isFormReadOnly}
                                                                                                    />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                                                                                        Work Efficiency (1-10)
                                                                                                    </label>
                                                                                                    <StarRating
                                                                                                        rating={
                                                                                                            evaluationData.workFunctions[
                                                                                                                workFunctionName
                                                                                                            ]?.workEfficiency || 0
                                                                                                        }
                                                                                                        onRatingChange={(rating) =>
                                                                                                            setEvaluationData((prev: any) => {
                                                                                                                return {
                                                                                                                    ...prev,
                                                                                                                    workFunctions: {
                                                                                                                        ...prev.workFunctions,
                                                                                                                        [workFunctionName]: {
                                                                                                                            ...prev.workFunctions[
                                                                                                                                workFunctionName
                                                                                                                            ],
                                                                                                                            workEfficiency: rating,
                                                                                                                        },
                                                                                                                    },
                                                                                                                };
                                                                                                            })
                                                                                                        }
                                                                                                        disabled={isFormReadOnly}
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* 5. Work Functions/Operations - Department Specific */}
                                        {(() => {
                                            const departmentSettings =
                                                getDepartmentSettings(selectedDepartment) || getDefaultDepartmentSettings(selectedDepartment);
                                            if (departmentSettings.showWorkFunctions !== false) {
                                                return (
                                                    <WorkFunctionsSection
                                                        selectedDepartment={selectedDepartment}
                                                        evaluationData={evaluationData}
                                                        setEvaluationData={setEvaluationData}
                                                        isFormReadOnly={isFormReadOnly}
                                                    />
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Total Rating */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Star className="h-5 w-5" />
                                                    Total Rating
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 text-center">
                                                {totalRating !== null ? (
                                                    <>
                                                        <div className="mb-2 text-6xl font-bold text-yellow-600">{totalRating}/10</div>
                                                        <div className={`text-xl font-semibold ${getRatingInfo(totalRating).color}`}>
                                                            {getRatingInfo(totalRating).label}
                                                        </div>
                                                        <div className="mt-4 flex justify-center">
                                                            <StarRating rating={totalRating} onRatingChange={() => {}} size="lg" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="mb-2 text-6xl font-bold text-gray-400">No Rating</div>
                                                        <div className="text-xl font-semibold text-gray-500">Complete evaluation to see rating</div>
                                                        <div className="mt-4 flex justify-center">
                                                            <StarRating rating={0} onRatingChange={() => {}} size="lg" disabled={true} />
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Observations/Comments */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Observations / Comments
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <Textarea
                                                    placeholder="Enter detailed observations and comments about the employee's performance..."
                                                    value={evaluationData.observations}
                                                    onChange={(e) =>
                                                        setEvaluationData((prev) => ({
                                                            ...prev,
                                                            observations: e.target.value,
                                                        }))
                                                    }
                                                    className="min-h-[120px] resize-none"
                                                    readOnly={isFormReadOnly}
                                                    disabled={isFormReadOnly}
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Evaluation Signatures */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Evaluation Signatures
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                                    {/* Evaluated by - Supervisor */}
                                                    {/* 
                                                        Flow: 
                                                        1. User selects department (e.g., "Packing Plant")
                                                        2. System fetches supervisor from supervisor_departments table where:
                                                           - department column = selected department
                                                           - can_evaluate = true
                                                           - user_id links to users table (user must have "Supervisor" role)
                                                        3. System looks up employee name from employees table using user's email
                                                        4. Displays the supervisor's actual employee name
                                                    */}
                                                    <div>
                                                        <div className="rounded-lg border border-gray-300 bg-gray-50 p-3">
                                                            <div className="mb-2 text-sm font-medium text-blue-700">Evaluated by:</div>
                                                            <div className="font-medium text-gray-800">
                                                                {(() => {
                                                                    if (!selectedDepartment) {
                                                                        return 'Select Department First';
                                                                    }

                                                                    // DEBUG: Log when rendering supervisor name
                                                                    // console.log(
                                                                    //     '🔍 [DEBUG] Rendering supervisor for department:',
                                                                    //     selectedDepartment,
                                                                    // );
                                                                    const supervisorName = getSupervisorForDepartment(selectedDepartment);
                                                                    // console.log('🔍 [DEBUG] Supervisor name to display:', supervisorName);

                                                                    return supervisorName;
                                                                })()}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {selectedDepartment
                                                                    ? (() => {
                                                                          const evaluators = getEvaluatorsForDepartment(selectedDepartment);
                                                                          // console.log('🔍 [DEBUG] Evaluators found for helper text:', evaluators);
                                                                          if (evaluators.length === 0) {
                                                                              return 'No supervisor assigned to this department in supervisor_departments table';
                                                                          } else if (evaluators.length === 1) {
                                                                              return `Supervisor`;
                                                                          } else {
                                                                              return `Supervisors: ${evaluators.map((e) => e.supervisor_name).join(', ')}`;
                                                                          }
                                                                      })()
                                                                    : 'Will be populated when department is selected'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Noted by - HR Personnel */}
                                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                        <div className="mb-2 text-sm font-medium text-blue-700">Noted by:</div>
                                                        <div className="font-semibold text-blue-800">
                                                            {selectedDepartment ? getHRForDepartment(selectedDepartment) : 'Select Department First'}
                                                        </div>
                                                        {/* <div className="text-sm text-blue-700">HR</div> */}
                                                        <div className="text-xs text-blue-600">
                                                            {selectedDepartment
                                                                ? (() => {
                                                                      const hrAssignments =
                                                                          hr_assignments?.filter(
                                                                              (assignment) => assignment.department === selectedDepartment,
                                                                          ) || [];
                                                                      if (hrAssignments.length === 0) {
                                                                          return 'No HR  Personnel';
                                                                      }
                                                                      //   else if (hrAssignments.length === 1) {
                                                                      //       return 'Auto-fetched from database HR assignment (hr_department_assignments table)';
                                                                      //   }
                                                                      else {
                                                                          return `HR Personnel`;
                                                                      }
                                                                  })()
                                                                : 'Will be populated when department is selected'}
                                                        </div>
                                                    </div>
                                                    {/* Approved by - Manager */}
                                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                        <div className="mb-2 text-sm font-medium text-green-700">Approved by:</div>
                                                        <div className="font-semibold text-green-800">
                                                            {selectedDepartment
                                                                ? getManagerForDepartment(selectedDepartment)
                                                                : 'Select Department First'}
                                                        </div>
                                                        <div className="text-xs text-green-600">
                                                            {selectedDepartment
                                                                ? (() => {
                                                                      const managerAssignments =
                                                                          manager_assignments?.filter(
                                                                              (assignment) => assignment.department === selectedDepartment,
                                                                          ) || [];
                                                                      if (managerAssignments.length === 0) {
                                                                          return 'No Manager assigned to this department';
                                                                      } else if (managerAssignments.length === 1) {
                                                                          return 'Manager';
                                                                      } else {
                                                                          return `Manager`;
                                                                      }
                                                                  })()
                                                                : 'Will be populated when department is selected'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Rating Legend */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Star className="h-5 w-5" />
                                                    Rating Legend
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="flex flex-wrap justify-center gap-6 text-lg font-medium">
                                                    <span className="text-red-600">1-4 = Fail</span>
                                                    <span className="text-yellow-600">5-7 = Satisfactory</span>
                                                    <span className="text-green-600">8-9 = Very Satisfactory</span>
                                                    <span className="text-blue-600">10 = Excellent</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Form Errors */}
                                        {Object.keys(errors).length > 0 && (
                                            <Card className="border-main dark:bg-backgrounds border-red-200 bg-background drop-shadow-lg">
                                                <CardContent className="p-4">
                                                    <div className="mb-2 font-medium text-red-600">Please fix the following errors:</div>
                                                    <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                                                        {Object.entries(errors).map(([field, error]) => (
                                                            <li key={field}>{error}</li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                            {!isFormReadOnly ? (
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                                                    disabled={processing || submitting}
                                                >
                                                    <FileText className={`${processing || submitting ? 'animate-spin' : ''} mr-2 h-5 w-5`} />
                                                    {processing || submitting ? 'Submitting...' : 'Submit Evaluation'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleReset}
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                                                >
                                                    <RotateCcw className="mr-2 h-5 w-5" />
                                                    Clear & Start New Evaluation
                                                </Button>
                                            )}

                                            {!isFormReadOnly && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleReset}
                                                    className="border-2 border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-gray-700 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
                                                >
                                                    <RotateCcw className="mr-2 h-5 w-5" />
                                                    Reset Form
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Instructions when no department/employee selected */}
                                {!selectedDepartment && (
                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                        <CardContent className="p-12 text-center">
                                            <div className="mb-4 text-6xl">⭐</div>
                                            <h3 className="mb-2 text-2xl font-semibold text-gray-700">Get Started with Evaluation</h3>
                                            <p className="text-gray-600">Select a department and employee above to begin the evaluation process</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </Main>
                        </>
                    )}
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}
