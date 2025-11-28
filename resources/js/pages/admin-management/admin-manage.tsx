import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { departments as globalDepartments } from '@/hooks/data';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Plus, Settings, Star, Trash2, UserCheck, UserCog, Users, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EvaluationFrequencyManager } from './components/evaluation-frequency-manager';
import { EvaluationSettingsManager } from './components/evaluation-settings-manager';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Management',
        href: '/admin-management',
    },
];

interface Supervisor {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    department: string;
    supervised_departments: Array<{
        id: number;
        department: string;
        can_evaluate: boolean;
    }>;
}

interface Assignment {
    id: number;
    user_id: number;
    department: string;
    can_evaluate: boolean;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
}

interface HRAssignment {
    id: number;
    user_id: number;
    department: string;
    can_evaluate: boolean;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
}

interface ManagerAssignment {
    id: number;
    user_id: number;
    department: string;
    can_evaluate: boolean;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
}

interface AdminAssignment {
    id: number;
    user_id: number;
    department: string;
    can_evaluate: boolean;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
}

interface Props {
    supervisors: Supervisor[];
    hr_personnel: Array<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        roles: string[];
    }>;
    managers: Array<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        roles: string[];
    }>;
    departments: string[];
    assignments: Assignment[];
    hr_assignments?: HRAssignment[];
    manager_assignments?: ManagerAssignment[];
    admin_users?: Array<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        roles: string[];
    }>;
    admin_assignments?: AdminAssignment[];
    frequencies: Array<{
        department: string;
        evaluation_frequency: 'semi_annual' | 'annual';
        employee_count: number;
    }>;
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        can_evaluate: boolean;
    };
}

export default function SupervisorManagement({
    supervisors,
    hr_personnel = [],
    managers = [],
    departments,
    assignments,
    hr_assignments = [],
    manager_assignments = [],
    admin_users = [],
    admin_assignments = [],
    frequencies,
    user_permissions,
}: Props) {
    const [newAssignment, setNewAssignment] = useState({
        user_id: '',
        departments: [] as string[],
        can_evaluate: true,
        selectAll: false,
    });

    const [newHRAssignment, setNewHRAssignment] = useState({
        user_id: '',
        departments: [] as string[],
        can_evaluate: true,
        selectAll: false,
    });

    const [newManagerAssignment, setNewManagerAssignment] = useState({
        user_id: '',
        departments: [] as string[],
        can_evaluate: true,
        selectAll: false,
    });

    const [newAdminAssignment, setNewAdminAssignment] = useState({
        user_id: '',
        departments: [] as string[],
        can_evaluate: true,
        selectAll: false,
    });

    // Use global departments instead of prop departments
    const availableDepartments = globalDepartments;

    const isAdmin = user_permissions?.is_super_admin || false;
    const isSupervisor = user_permissions?.is_supervisor || false;

    // Helper function to process assignment queue (defined inside component to access state setters)
    const processAssignmentQueue = (index: number) => {
        const queueKey = 'assignment_queue';
        const processingKey = 'assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');

        // Check if already processing to prevent duplicate calls
        if (sessionStorage.getItem(processingKey) === 'true' && index > 0) {
            return;
        }

        if (queue.length === 0 || index >= queue.length) {
            // All done or no queue
            const successCount = parseInt(sessionStorage.getItem('assignment_queue_success') || '0');
            const errors = JSON.parse(sessionStorage.getItem('assignment_queue_errors') || '[]');

            // Only show toast if we actually processed a queue
            if (queue.length > 0 && successCount > 0) {
                // Clean up first
                sessionStorage.removeItem(queueKey);
                sessionStorage.removeItem('assignment_queue_index');
                sessionStorage.removeItem('assignment_queue_success');
                sessionStorage.removeItem('assignment_queue_errors');
                sessionStorage.removeItem(processingKey);

                // Show toast after a small delay to ensure DOM is ready
                setTimeout(() => {
                    if (errors.length === 0) {
                        toast.success(`Supervisor assignment created successfully for ${successCount} department(s)`);
                        setNewAssignment({ user_id: '', departments: [], can_evaluate: true, selectAll: false });
                    } else if (successCount > 0) {
                        toast.warning(`Created ${successCount} assignment(s), ${errors.length} failed`);
                    } else {
                        toast.error(`Failed to create assignments. ${errors[0] || 'Unknown error'}`);
                    }
                }, 100);
            }
            return;
        }

        // Mark as processing
        sessionStorage.setItem(processingKey, 'true');

        const assignment = queue[index];
        router.post(route('evaluation.supervisor-management.store'), assignment, {
            onSuccess: () => {
                const successCount = parseInt(sessionStorage.getItem('assignment_queue_success') || '0') + 1;
                sessionStorage.setItem('assignment_queue_success', successCount.toString());
                sessionStorage.setItem('assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Process next assignment after a short delay (Inertia will reload first)
                // The useEffect will pick up the queue and continue processing
            },
            onError: (error) => {
                const errors = JSON.parse(sessionStorage.getItem('assignment_queue_errors') || '[]');
                const errorMessage = Object.values(error)[0] as string;
                errors.push(errorMessage);
                sessionStorage.setItem('assignment_queue_errors', JSON.stringify(errors));
                sessionStorage.setItem('assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Continue with next assignment after Inertia reloads
                // The useEffect will pick up the queue and continue processing
            },
            preserveState: true,
            preserveScroll: true,
            only: ['assignments'],
        });
    };

    // Helper function to process HR assignment queue
    const processHRAssignmentQueue = (index: number) => {
        const queueKey = 'hr_assignment_queue';
        const processingKey = 'hr_assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');

        // Check if already processing to prevent duplicate calls
        if (sessionStorage.getItem(processingKey) === 'true' && index > 0) {
            return;
        }

        if (queue.length === 0 || index >= queue.length) {
            // All done or no queue
            const successCount = parseInt(sessionStorage.getItem('hr_assignment_queue_success') || '0');
            const errors = JSON.parse(sessionStorage.getItem('hr_assignment_queue_errors') || '[]');

            // Only show toast if we actually processed a queue
            if (queue.length > 0 && successCount > 0) {
                // Clean up first
                sessionStorage.removeItem(queueKey);
                sessionStorage.removeItem('hr_assignment_queue_index');
                sessionStorage.removeItem('hr_assignment_queue_success');
                sessionStorage.removeItem('hr_assignment_queue_errors');
                sessionStorage.removeItem(processingKey);

                // Show toast after a small delay to ensure DOM is ready
                setTimeout(() => {
                    if (errors.length === 0) {
                        toast.success(`HR Personnel assignment created successfully for ${successCount} department(s)`);
                        setNewHRAssignment({ user_id: '', departments: [], can_evaluate: true, selectAll: false });
                    } else if (successCount > 0) {
                        toast.warning(`Created ${successCount} assignment(s), ${errors.length} failed`);
                    } else {
                        toast.error(`Failed to create assignments. ${errors[0] || 'Unknown error'}`);
                    }
                }, 100);
            }
            return;
        }

        // Mark as processing
        sessionStorage.setItem(processingKey, 'true');

        const assignment = queue[index];
        router.post(route('evaluation.hr-management.store'), assignment, {
            onSuccess: () => {
                const successCount = parseInt(sessionStorage.getItem('hr_assignment_queue_success') || '0') + 1;
                sessionStorage.setItem('hr_assignment_queue_success', successCount.toString());
                sessionStorage.setItem('hr_assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Process next assignment after a short delay (Inertia will reload first)
                // The useEffect will pick up the queue and continue processing
            },
            onError: (error) => {
                const errors = JSON.parse(sessionStorage.getItem('hr_assignment_queue_errors') || '[]');
                const errorMessage = Object.values(error)[0] as string;
                errors.push(errorMessage);
                sessionStorage.setItem('hr_assignment_queue_errors', JSON.stringify(errors));
                sessionStorage.setItem('hr_assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Continue with next assignment after Inertia reloads
                // The useEffect will pick up the queue and continue processing
            },
            preserveState: true,
            preserveScroll: true,
            only: ['hr_assignments'],
        });
    };

    // Check for ongoing queue processing on mount and after assignments update
    useEffect(() => {
        const queueKey = 'assignment_queue';
        const processingKey = 'assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
        const currentIndex = parseInt(sessionStorage.getItem('assignment_queue_index') || '0');
        const isProcessing = sessionStorage.getItem(processingKey) === 'true';

        // Only continue if there's a queue, we haven't finished (or just finished), and we're not already processing
        // Use <= instead of < to allow one final call when currentIndex === queue.length to trigger completion
        if (queue.length > 0 && currentIndex <= queue.length && !isProcessing) {
            // Continue processing the queue after a short delay to ensure Inertia has finished updating
            const timeoutId = setTimeout(() => {
                processAssignmentQueue(currentIndex);
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [assignments]); // Re-run when assignments prop changes (after Inertia reload)

    // Helper function to process Manager assignment queue
    const processManagerAssignmentQueue = (index: number) => {
        const queueKey = 'manager_assignment_queue';
        const processingKey = 'manager_assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');

        // Check if already processing to prevent duplicate calls
        if (sessionStorage.getItem(processingKey) === 'true' && index > 0) {
            return;
        }

        if (queue.length === 0 || index >= queue.length) {
            // All done or no queue
            const successCount = parseInt(sessionStorage.getItem('manager_assignment_queue_success') || '0');
            const errors = JSON.parse(sessionStorage.getItem('manager_assignment_queue_errors') || '[]');

            // Only show toast if we actually processed a queue
            if (queue.length > 0 && successCount > 0) {
                // Clean up first
                sessionStorage.removeItem(queueKey);
                sessionStorage.removeItem('manager_assignment_queue_index');
                sessionStorage.removeItem('manager_assignment_queue_success');
                sessionStorage.removeItem('manager_assignment_queue_errors');
                sessionStorage.removeItem(processingKey);

                // Show toast after a small delay to ensure DOM is ready
                setTimeout(() => {
                    if (errors.length === 0) {
                        toast.success(`Manager assignment created successfully for ${successCount} department(s)`);
                        setNewManagerAssignment({ user_id: '', departments: [], can_evaluate: true, selectAll: false });
                    } else if (successCount > 0) {
                        toast.warning(`Created ${successCount} assignment(s), ${errors.length} failed`);
                    } else {
                        toast.error(`Failed to create assignments. ${errors[0] || 'Unknown error'}`);
                    }
                }, 100);
            }
            return;
        }

        // Mark as processing
        sessionStorage.setItem(processingKey, 'true');

        const assignment = queue[index];
        router.post(route('evaluation.manager-management.store'), assignment, {
            onSuccess: () => {
                const successCount = parseInt(sessionStorage.getItem('manager_assignment_queue_success') || '0') + 1;
                sessionStorage.setItem('manager_assignment_queue_success', successCount.toString());
                sessionStorage.setItem('manager_assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Process next assignment after a short delay (Inertia will reload first)
                // The useEffect will pick up the queue and continue processing
            },
            onError: (error) => {
                const errors = JSON.parse(sessionStorage.getItem('manager_assignment_queue_errors') || '[]');
                const errorMessage = Object.values(error)[0] as string;
                errors.push(errorMessage);
                sessionStorage.setItem('manager_assignment_queue_errors', JSON.stringify(errors));
                sessionStorage.setItem('manager_assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Continue with next assignment after Inertia reloads
                // The useEffect will pick up the queue and continue processing
            },
            preserveState: true,
            preserveScroll: true,
            only: ['manager_assignments'],
        });
    };

    // Check for ongoing HR queue processing on mount and after hr_assignments update
    useEffect(() => {
        const queueKey = 'hr_assignment_queue';
        const processingKey = 'hr_assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
        const currentIndex = parseInt(sessionStorage.getItem('hr_assignment_queue_index') || '0');
        const isProcessing = sessionStorage.getItem(processingKey) === 'true';

        // Only continue if there's a queue, we haven't finished (or just finished), and we're not already processing
        // Use <= instead of < to allow one final call when currentIndex === queue.length to trigger completion
        if (queue.length > 0 && currentIndex <= queue.length && !isProcessing) {
            // Continue processing the queue after a short delay to ensure Inertia has finished updating
            const timeoutId = setTimeout(() => {
                processHRAssignmentQueue(currentIndex);
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [hr_assignments]); // Re-run when hr_assignments prop changes (after Inertia reload)

    // Check for ongoing Manager queue processing on mount and after manager_assignments update
    useEffect(() => {
        const queueKey = 'manager_assignment_queue';
        const processingKey = 'manager_assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
        const currentIndex = parseInt(sessionStorage.getItem('manager_assignment_queue_index') || '0');
        const isProcessing = sessionStorage.getItem(processingKey) === 'true';

        // Only continue if there's a queue, we haven't finished (or just finished), and we're not already processing
        // Use <= instead of < to allow one final call when currentIndex === queue.length to trigger completion
        if (queue.length > 0 && currentIndex <= queue.length && !isProcessing) {
            // Continue processing the queue after a short delay to ensure Inertia has finished updating
            const timeoutId = setTimeout(() => {
                processManagerAssignmentQueue(currentIndex);
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [manager_assignments]); // Re-run when manager_assignments prop changes (after Inertia reload)

    // Helper function to process Admin assignment queue
    const processAdminAssignmentQueue = (index: number) => {
        const queueKey = 'admin_assignment_queue';
        const processingKey = 'admin_assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');

        // Check if already processing to prevent duplicate calls
        if (sessionStorage.getItem(processingKey) === 'true' && index > 0) {
            return;
        }

        if (queue.length === 0 || index >= queue.length) {
            // All done or no queue
            const successCount = parseInt(sessionStorage.getItem('admin_assignment_queue_success') || '0');
            const errors = JSON.parse(sessionStorage.getItem('admin_assignment_queue_errors') || '[]');

            // Only show toast if we actually processed a queue
            if (queue.length > 0 && successCount > 0) {
                // Clean up first
                sessionStorage.removeItem(queueKey);
                sessionStorage.removeItem('admin_assignment_queue_index');
                sessionStorage.removeItem('admin_assignment_queue_success');
                sessionStorage.removeItem('admin_assignment_queue_errors');
                sessionStorage.removeItem(processingKey);

                // Show toast after a small delay to ensure DOM is ready
                setTimeout(() => {
                    if (errors.length === 0) {
                        toast.success(`Admin assignment created successfully for ${successCount} department(s)`);
                        setNewAdminAssignment({ user_id: '', departments: [], can_evaluate: true, selectAll: false });
                    } else if (successCount > 0) {
                        toast.warning(`Created ${successCount} assignment(s), ${errors.length} failed`);
                    } else {
                        toast.error(`Failed to create assignments. ${errors[0] || 'Unknown error'}`);
                    }
                }, 100);
            }
            return;
        }

        // Mark as processing
        sessionStorage.setItem(processingKey, 'true');

        const assignment = queue[index];
        router.post(route('evaluation.admin-management.store'), assignment, {
            onSuccess: () => {
                const successCount = parseInt(sessionStorage.getItem('admin_assignment_queue_success') || '0') + 1;
                sessionStorage.setItem('admin_assignment_queue_success', successCount.toString());
                sessionStorage.setItem('admin_assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Process next assignment after a short delay (Inertia will reload first)
                // The useEffect will pick up the queue and continue processing
            },
            onError: (error) => {
                const errors = JSON.parse(sessionStorage.getItem('admin_assignment_queue_errors') || '[]');
                const errorMessage = Object.values(error)[0] as string;
                errors.push(errorMessage);
                sessionStorage.setItem('admin_assignment_queue_errors', JSON.stringify(errors));
                sessionStorage.setItem('admin_assignment_queue_index', (index + 1).toString());
                // Clear processing flag - next assignment will set it again
                sessionStorage.removeItem(processingKey);
                // Continue with next assignment after Inertia reloads
                // The useEffect will pick up the queue and continue processing
            },
            preserveState: true,
            preserveScroll: true,
            only: ['admin_assignments'],
        });
    };

    // Check for ongoing Admin queue processing on mount and after admin_assignments update
    useEffect(() => {
        const queueKey = 'admin_assignment_queue';
        const processingKey = 'admin_assignment_queue_processing';
        const queue = JSON.parse(sessionStorage.getItem(queueKey) || '[]');
        const currentIndex = parseInt(sessionStorage.getItem('admin_assignment_queue_index') || '0');
        const isProcessing = sessionStorage.getItem(processingKey) === 'true';

        // Only continue if there's a queue, we haven't finished (or just finished), and we're not already processing
        // Use <= instead of < to allow one final call when currentIndex === queue.length to trigger completion
        if (queue.length > 0 && currentIndex <= queue.length && !isProcessing) {
            // Continue processing the queue after a short delay to ensure Inertia has finished updating
            const timeoutId = setTimeout(() => {
                processAdminAssignmentQueue(currentIndex);
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [admin_assignments]); // Re-run when admin_assignments prop changes (after Inertia reload)

    // Helper functions for department selection
    const handleSelectAllDepartments = (type: 'supervisor' | 'hr' | 'manager' | 'admin') => {
        if (type === 'supervisor') {
            const allSelected = newAssignment.selectAll;
            setNewAssignment({
                ...newAssignment,
                departments: allSelected ? [] : [...availableDepartments],
                selectAll: !allSelected,
            });
        } else if (type === 'hr') {
            const allSelected = newHRAssignment.selectAll;
            setNewHRAssignment({
                ...newHRAssignment,
                departments: allSelected ? [] : [...availableDepartments],
                selectAll: !allSelected,
            });
        } else if (type === 'manager') {
            const allSelected = newManagerAssignment.selectAll;
            setNewManagerAssignment({
                ...newManagerAssignment,
                departments: allSelected ? [] : [...availableDepartments],
                selectAll: !allSelected,
            });
        } else if (type === 'admin') {
            const allSelected = newAdminAssignment.selectAll;
            setNewAdminAssignment({
                ...newAdminAssignment,
                departments: allSelected ? [] : [...availableDepartments],
                selectAll: !allSelected,
            });
        }
    };

    const handleDepartmentToggle = (department: string, type: 'supervisor' | 'hr' | 'manager' | 'admin') => {
        if (type === 'supervisor') {
            const isSelected = newAssignment.departments.includes(department);
            const newDepartments = isSelected
                ? newAssignment.departments.filter((d) => d !== department)
                : [...newAssignment.departments, department];
            setNewAssignment({
                ...newAssignment,
                departments: newDepartments,
                selectAll: newDepartments.length === availableDepartments.length,
            });
        } else if (type === 'hr') {
            const isSelected = newHRAssignment.departments.includes(department);
            const newDepartments = isSelected
                ? newHRAssignment.departments.filter((d) => d !== department)
                : [...newHRAssignment.departments, department];
            setNewHRAssignment({
                ...newHRAssignment,
                departments: newDepartments,
                selectAll: newDepartments.length === availableDepartments.length,
            });
        } else if (type === 'manager') {
            const isSelected = newManagerAssignment.departments.includes(department);
            const newDepartments = isSelected
                ? newManagerAssignment.departments.filter((d) => d !== department)
                : [...newManagerAssignment.departments, department];
            setNewManagerAssignment({
                ...newManagerAssignment,
                departments: newDepartments,
                selectAll: newDepartments.length === availableDepartments.length,
            });
        } else if (type === 'admin') {
            const isSelected = newAdminAssignment.departments.includes(department);
            const newDepartments = isSelected
                ? newAdminAssignment.departments.filter((d) => d !== department)
                : [...newAdminAssignment.departments, department];
            setNewAdminAssignment({
                ...newAdminAssignment,
                departments: newDepartments,
                selectAll: newDepartments.length === availableDepartments.length,
            });
        }
    };

    const handleCreateAssignment = () => {
        if (!newAssignment.user_id) {
            toast.error('Please select a supervisor');
            return;
        }
        if (newAssignment.departments.length === 0) {
            toast.error('Please select at least one department');
            return;
        }

        // Check if this supervisor is already assigned to any of the selected departments
        const existingAssignments = newAssignment.departments.filter((dept) =>
            assignments.some((assignment) => assignment.user_id === parseInt(newAssignment.user_id) && assignment.department === dept),
        );

        if (existingAssignments.length > 0) {
            toast.error(`This supervisor is already assigned to: ${existingAssignments.join(', ')}`);
            return;
        }

        // Check if any selected department already has a different supervisor assigned
        const departmentsWithOtherSupervisors = newAssignment.departments
            .map((dept) => {
                const existingAssignment = assignments.find((assignment) => assignment.department === dept);
                if (existingAssignment && existingAssignment.user_id !== parseInt(newAssignment.user_id)) {
                    const supervisor = supervisors.find((s) => s.id === existingAssignment.user_id);
                    return {
                        department: dept,
                        supervisorName: supervisor ? `${supervisor.firstname} ${supervisor.lastname}` : 'Another supervisor',
                    };
                }
                return null;
            })
            .filter((item) => item !== null);

        if (departmentsWithOtherSupervisors.length > 0) {
            const departmentList = departmentsWithOtherSupervisors
                .map((item) => `${item.department} (currently assigned to ${item.supervisorName})`)
                .join(', ');
            toast.error(
                `The following department(s) already have a supervisor assigned: ${departmentList}. Only one supervisor per department is allowed.`,
            );
            return;
        }

        // Send each department as a separate assignment
        const assignmentsToCreate = newAssignment.departments.map((department) => ({
            user_id: newAssignment.user_id,
            department: department,
            can_evaluate: newAssignment.can_evaluate,
        }));

        // Store the queue in sessionStorage to persist across page reloads
        const queueKey = 'assignment_queue';
        sessionStorage.setItem(queueKey, JSON.stringify(assignmentsToCreate));
        sessionStorage.setItem('assignment_queue_index', '0');
        sessionStorage.setItem('assignment_queue_success', '0');
        sessionStorage.setItem('assignment_queue_errors', JSON.stringify([]));

        // Start processing from index 0
        processAssignmentQueue(0);
    };

    const handleUpdateAssignment = (assignmentId: number, canEvaluate: boolean) => {
        router.put(
            route('evaluation.supervisor-management.update', assignmentId),
            {
                can_evaluate: canEvaluate,
            },
            {
                onSuccess: () => {
                    toast.success('Assignment updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleDeleteAssignment = (assignmentId: number) => {
        router.delete(route('evaluation.supervisor-management.destroy', assignmentId), {
            onSuccess: () => {
                toast.success('Assignment removed successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleCreateHRAssignment = () => {
        if (!newHRAssignment.user_id) {
            toast.error('Please select HR Personnel');
            return;
        }
        if (newHRAssignment.departments.length === 0) {
            toast.error('Please select at least one department');
            return;
        }

        // Check for existing assignments
        const existingAssignments = newHRAssignment.departments.filter((dept) =>
            hr_assignments?.some((assignment) => assignment.user_id === parseInt(newHRAssignment.user_id) && assignment.department === dept),
        );

        if (existingAssignments.length > 0) {
            toast.error(`This HR Personnel is already assigned to: ${existingAssignments.join(', ')}`);
            return;
        }

        // Send each department as a separate assignment
        const assignmentsToCreate = newHRAssignment.departments.map((department) => ({
            user_id: newHRAssignment.user_id,
            department: department,
            can_evaluate: newHRAssignment.can_evaluate,
        }));

        // Store the queue in sessionStorage to persist across page reloads
        const queueKey = 'hr_assignment_queue';
        sessionStorage.setItem(queueKey, JSON.stringify(assignmentsToCreate));
        sessionStorage.setItem('hr_assignment_queue_index', '0');
        sessionStorage.setItem('hr_assignment_queue_success', '0');
        sessionStorage.setItem('hr_assignment_queue_errors', JSON.stringify([]));

        // Start processing from index 0
        processHRAssignmentQueue(0);
    };

    const handleUpdateHRAssignment = (assignmentId: number, canEvaluate: boolean) => {
        router.put(
            route('evaluation.hr-management.update', assignmentId),
            {
                can_evaluate: canEvaluate,
            },
            {
                onSuccess: () => {
                    toast.success('HR Personnel assignment updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleDeleteHRAssignment = (assignmentId: number) => {
        router.delete(route('evaluation.hr-management.destroy', assignmentId), {
            onSuccess: () => {
                toast.success('HR Personnel assignment removed successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleCreateManagerAssignment = () => {
        if (!newManagerAssignment.user_id) {
            toast.error('Please select Manager');
            return;
        }
        if (newManagerAssignment.departments.length === 0) {
            toast.error('Please select at least one department');
            return;
        }

        // Check for existing assignments
        const existingAssignments = newManagerAssignment.departments.filter((dept) =>
            manager_assignments?.some(
                (assignment) => assignment.user_id === parseInt(newManagerAssignment.user_id) && assignment.department === dept,
            ),
        );

        if (existingAssignments.length > 0) {
            toast.error(`This Manager is already assigned to: ${existingAssignments.join(', ')}`);
            return;
        }

        // Send each department as a separate assignment
        const assignmentsToCreate = newManagerAssignment.departments.map((department) => ({
            user_id: newManagerAssignment.user_id,
            department: department,
            can_evaluate: newManagerAssignment.can_evaluate,
        }));

        // Store the queue in sessionStorage to persist across page reloads
        const queueKey = 'manager_assignment_queue';
        sessionStorage.setItem(queueKey, JSON.stringify(assignmentsToCreate));
        sessionStorage.setItem('manager_assignment_queue_index', '0');
        sessionStorage.setItem('manager_assignment_queue_success', '0');
        sessionStorage.setItem('manager_assignment_queue_errors', JSON.stringify([]));

        // Start processing from index 0
        processManagerAssignmentQueue(0);
    };

    const handleUpdateManagerAssignment = (assignmentId: number, canEvaluate: boolean) => {
        router.put(
            route('evaluation.manager-management.update', assignmentId),
            {
                can_evaluate: canEvaluate,
            },
            {
                onSuccess: () => {
                    toast.success('Manager assignment updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleDeleteManagerAssignment = (assignmentId: number) => {
        router.delete(route('evaluation.manager-management.destroy', assignmentId), {
            onSuccess: () => {
                toast.success('Manager assignment removed successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const handleCreateAdminAssignment = () => {
        if (!newAdminAssignment.user_id) {
            toast.error('Please select a user');
            return;
        }
        if (newAdminAssignment.departments.length === 0) {
            toast.error('Please select at least one department');
            return;
        }

        // Check for existing assignments
        const existingAssignments = newAdminAssignment.departments.filter((dept) =>
            admin_assignments?.some((assignment) => assignment.user_id === parseInt(newAdminAssignment.user_id) && assignment.department === dept),
        );

        if (existingAssignments.length > 0) {
            toast.error(`This user is already assigned to: ${existingAssignments.join(', ')}`);
            return;
        }

        // Send each department as a separate assignment
        const assignmentsToCreate = newAdminAssignment.departments.map((department) => ({
            user_id: newAdminAssignment.user_id,
            department: department,
            can_evaluate: newAdminAssignment.can_evaluate,
        }));

        // Store the queue in sessionStorage to persist across page reloads
        const queueKey = 'admin_assignment_queue';
        sessionStorage.setItem(queueKey, JSON.stringify(assignmentsToCreate));
        sessionStorage.setItem('admin_assignment_queue_index', '0');
        sessionStorage.setItem('admin_assignment_queue_success', '0');
        sessionStorage.setItem('admin_assignment_queue_errors', JSON.stringify([]));

        // Start processing from index 0
        processAdminAssignmentQueue(0);
    };

    const handleUpdateAdminAssignment = (assignmentId: number, canEvaluate: boolean) => {
        router.put(
            route('evaluation.admin-management.update', assignmentId),
            {
                can_evaluate: canEvaluate,
            },
            {
                onSuccess: () => {
                    toast.success('Admin assignment updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            },
        );
    };

    const handleDeleteAdminAssignment = (assignmentId: number) => {
        router.delete(route('evaluation.admin-management.destroy', assignmentId), {
            onSuccess: () => {
                toast.success('Admin assignment removed successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    return (
        <SidebarProvider>
            <Head title="Admin Management" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Users className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Admin Management</h2>
                                        <p className="text-muted-foreground">Manage your organization's workforce</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Tabs defaultValue="supervisors" className="space-y-4">
                            <TabsList className={isAdmin ? 'grid w-full grid-cols-5' : 'grid w-full grid-cols-4'}>
                                <TabsTrigger value="supervisors" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Supervisors
                                </TabsTrigger>
                                {isAdmin && (
                                    <>
                                        <TabsTrigger value="hr-personnel" className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4" />
                                            HR Personnel
                                        </TabsTrigger>
                                        <TabsTrigger value="managers" className="flex items-center gap-2">
                                            <UserCog className="h-4 w-4" />
                                            Managers
                                        </TabsTrigger>
                                        <TabsTrigger value="admin" className="flex items-center gap-2">
                                            <UserX className="h-4 w-4" />
                                            Admin
                                        </TabsTrigger>
                                        <TabsTrigger value="frequencies" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Evaluation Frequencies
                                        </TabsTrigger>
                                    </>
                                )}
                            </TabsList>

                            {/* Supervisors Tab */}
                            <TabsContent value="supervisors" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Create New Assignment */}
                                    <Card className="transition-shadow hover:shadow-lg">
                                        <CardHeader>
                                            <CardTitle>Create New Assignment</CardTitle>
                                            <CardDescription>Assign a supervisor to a department</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label htmlFor="supervisor">Supervisor</Label>
                                                    <Select
                                                        value={newAssignment.user_id}
                                                        onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, user_id: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select supervisor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {supervisors.map((supervisor) => (
                                                                <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                                                    {supervisor.firstname} {supervisor.lastname} ({supervisor.email})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="department">Departments</Label>
                                                    <div className="mt-2 max-h-60 space-y-3 overflow-y-auto rounded-lg border p-4">
                                                        <div className="flex items-center space-x-2 border-b pb-2">
                                                            <Checkbox
                                                                id="select-all-supervisor"
                                                                checked={newAssignment.selectAll}
                                                                onCheckedChange={() => handleSelectAllDepartments('supervisor')}
                                                            />
                                                            <Label htmlFor="select-all-supervisor" className="cursor-pointer font-medium">
                                                                Select All
                                                            </Label>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {availableDepartments.map((department) => (
                                                                <div key={department} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`dept-${department}-supervisor`}
                                                                        checked={newAssignment.departments.includes(department)}
                                                                        onCheckedChange={() => handleDepartmentToggle(department, 'supervisor')}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`dept-${department}-supervisor`}
                                                                        className="cursor-pointer text-sm"
                                                                    >
                                                                        {department}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {newAssignment.departments.length > 0 && (
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            Selected: {newAssignment.departments.length} department(s)
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Switch
                                                        id="can_evaluate"
                                                        checked={newAssignment.can_evaluate}
                                                        onCheckedChange={(checked) =>
                                                            setNewAssignment((prev) => ({ ...prev, can_evaluate: checked }))
                                                        }
                                                    />
                                                    <Label htmlFor="can_evaluate">Can Supervise</Label>
                                                </div>
                                            </div>
                                            <Button onClick={handleCreateAssignment} className="mt-4">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Assignment
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Current Assignments */}
                                    <Card className="transition-shadow hover:shadow-lg">
                                        <CardHeader>
                                            <CardTitle>Current Assignments</CardTitle>
                                            <CardDescription>Manage existing supervisor-department assignments</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                                                {assignments.map((assignment) => (
                                                    <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                                                        <div>
                                                            <div className="font-medium">
                                                                {assignment.user.firstname} {assignment.user.lastname}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{assignment.user.email}</div>
                                                            <div className="text-sm text-gray-500">Department: {assignment.department}</div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center space-x-2">
                                                                <Switch
                                                                    checked={assignment.can_evaluate}
                                                                    onCheckedChange={(checked) => handleUpdateAssignment(assignment.id, checked)}
                                                                />
                                                                <span className="text-sm">Can Evaluate</span>
                                                            </div>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently remove the supervisor
                                                                            assignment for {assignment.user.firstname} {assignment.user.lastname} from
                                                                            the {assignment.department} department.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteAssignment(assignment.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete Assignment
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                ))}
                                                {assignments.length === 0 && (
                                                    <div className="py-8 text-center text-gray-500">No assignments found</div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* HR Personnel Tab */}
                            {isAdmin && (
                                <TabsContent value="hr-personnel" className="space-y-6">
                                    {/* Validation Warning */}
                                    {(() => {
                                        const departmentsWithoutHR = availableDepartments.filter(
                                            (dept) => !hr_assignments?.some((assignment) => assignment.department === dept),
                                        );

                                        // if (departmentsWithoutHR.length > 0) {
                                        //     return (
                                        //         <Card className="border-orange-200 bg-orange-50">
                                        //             <CardContent className="p-4">
                                        //                 <div className="flex items-center gap-2">
                                        //                     <div className="text-orange-600">⚠️</div>
                                        //                     <div>
                                        //                         <div className="font-medium text-orange-800">Missing HR Personnel Assignments</div>
                                        //                         <div className="text-sm text-orange-700">
                                        //                             The following departments need HR Personnel assigned:{' '}
                                        //                             {departmentsWithoutHR.join(', ')}
                                        //                         </div>
                                        //                     </div>
                                        //                 </div>
                                        //             </CardContent>
                                        //         </Card>
                                        //     );
                                        // }
                                        return null;
                                    })()}

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Create New HR Assignment */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Create New HR Assignment</CardTitle>
                                                <CardDescription>Assign HR Personnel to a department</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <Label htmlFor="hr-personnel">HR Personnel</Label>
                                                        <Select
                                                            value={newHRAssignment.user_id}
                                                            onValueChange={(value) => setNewHRAssignment((prev) => ({ ...prev, user_id: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select HR Personnel" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {hr_personnel.map((hr) => (
                                                                    <SelectItem key={hr.id} value={hr.id.toString()}>
                                                                        {hr.firstname} {hr.lastname} ({hr.email})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="hr-department">Departments</Label>
                                                        <div className="mt-2 max-h-60 space-y-3 overflow-y-auto rounded-lg border p-4">
                                                            <div className="flex items-center space-x-2 border-b pb-2">
                                                                <Checkbox
                                                                    id="select-all-hr"
                                                                    checked={newHRAssignment.selectAll}
                                                                    onCheckedChange={() => handleSelectAllDepartments('hr')}
                                                                />
                                                                <Label htmlFor="select-all-hr" className="cursor-pointer font-medium">
                                                                    Select All
                                                                </Label>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {availableDepartments.map((department) => (
                                                                    <div key={department} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`dept-${department}-hr`}
                                                                            checked={newHRAssignment.departments.includes(department)}
                                                                            onCheckedChange={() => handleDepartmentToggle(department, 'hr')}
                                                                        />
                                                                        <Label htmlFor={`dept-${department}-hr`} className="cursor-pointer text-sm">
                                                                            {department}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {newHRAssignment.departments.length > 0 && (
                                                            <div className="mt-2 text-sm text-muted-foreground">
                                                                Selected: {newHRAssignment.departments.length} department(s)
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="can_evaluate_hr"
                                                            checked={newHRAssignment.can_evaluate}
                                                            onCheckedChange={(checked) =>
                                                                setNewHRAssignment((prev) => ({ ...prev, can_evaluate: checked }))
                                                            }
                                                        />
                                                        <Label htmlFor="can_evaluate_hr">Can Evaluate</Label>
                                                    </div>
                                                </div>
                                                <Button onClick={handleCreateHRAssignment} className="mt-4">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create HR Assignment
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Current HR Assignments */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Current HR Assignments</CardTitle>
                                                <CardDescription>Manage existing HR Personnel-department assignments</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                                                    {hr_assignments?.map((assignment) => (
                                                        <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                                                            <div>
                                                                <div className="font-medium">
                                                                    {assignment.user.firstname} {assignment.user.lastname}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{assignment.user.email}</div>
                                                                <div className="text-sm text-gray-500">Department: {assignment.department}</div>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        checked={assignment.can_evaluate ?? true}
                                                                        onCheckedChange={(checked) =>
                                                                            handleUpdateHRAssignment(assignment.id, checked)
                                                                        }
                                                                    />
                                                                    <span className="text-sm">Can Evaluate</span>
                                                                </div>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="destructive" size="sm">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently remove the HR
                                                                                Personnel assignment for {assignment.user.firstname}{' '}
                                                                                {assignment.user.lastname} from the {assignment.department}{' '}
                                                                                department.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteHRAssignment(assignment.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete Assignment
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!hr_assignments || hr_assignments.length === 0) && (
                                                        <div className="py-8 text-center text-gray-500">No HR assignments found</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            )}

                            {/* Managers Tab */}
                            {isAdmin && (
                                <TabsContent value="managers" className="space-y-6">
                                    {/* Validation Warning */}
                                    {(() => {
                                        const departmentsWithoutManager = availableDepartments.filter(
                                            (dept) => !manager_assignments?.some((assignment) => assignment.department === dept),
                                        );

                                        // if (departmentsWithoutManager.length > 0) {
                                        //     return (
                                        //         <Card className="border-orange-200 bg-orange-50">
                                        //             <CardContent className="p-4">
                                        //                 <div className="flex items-center gap-2">
                                        //                     <div className="text-orange-600">⚠️</div>
                                        //                     <div>
                                        //                         <div className="font-medium text-orange-800">Missing Manager Assignments</div>
                                        //                         <div className="text-sm text-orange-700">
                                        //                             The following departments need Manager assigned:{' '}
                                        //                             {departmentsWithoutManager.join(', ')}
                                        //                         </div>
                                        //                     </div>
                                        //                 </div>
                                        //             </CardContent>
                                        //         </Card>
                                        //     );
                                        // }
                                        return null;
                                    })()}

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Create New Manager Assignment */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Create New Manager Assignment</CardTitle>
                                                <CardDescription>Assign Manager to a department</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <Label htmlFor="manager">Manager</Label>
                                                        <Select
                                                            value={newManagerAssignment.user_id}
                                                            onValueChange={(value) =>
                                                                setNewManagerAssignment((prev) => ({ ...prev, user_id: value }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Manager" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {managers.map((manager) => (
                                                                    <SelectItem key={manager.id} value={manager.id.toString()}>
                                                                        {manager.firstname} {manager.lastname} ({manager.email})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="manager-department">Departments</Label>
                                                        <div className="mt-2 max-h-60 space-y-3 overflow-y-auto rounded-lg border p-4">
                                                            <div className="flex items-center space-x-2 border-b pb-2">
                                                                <Checkbox
                                                                    id="select-all-manager"
                                                                    checked={newManagerAssignment.selectAll}
                                                                    onCheckedChange={() => handleSelectAllDepartments('manager')}
                                                                />
                                                                <Label htmlFor="select-all-manager" className="cursor-pointer font-medium">
                                                                    Select All
                                                                </Label>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {availableDepartments.map((department) => (
                                                                    <div key={department} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`dept-${department}-manager`}
                                                                            checked={newManagerAssignment.departments.includes(department)}
                                                                            onCheckedChange={() => handleDepartmentToggle(department, 'manager')}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`dept-${department}-manager`}
                                                                            className="cursor-pointer text-sm"
                                                                        >
                                                                            {department}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {newManagerAssignment.departments.length > 0 && (
                                                            <div className="mt-2 text-sm text-muted-foreground">
                                                                Selected: {newManagerAssignment.departments.length} department(s)
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="can_evaluate_manager"
                                                            checked={newManagerAssignment.can_evaluate}
                                                            onCheckedChange={(checked) =>
                                                                setNewManagerAssignment((prev) => ({ ...prev, can_evaluate: checked }))
                                                            }
                                                        />
                                                        <Label htmlFor="can_evaluate_manager">Can Evaluate</Label>
                                                    </div>
                                                </div>
                                                <Button onClick={handleCreateManagerAssignment} className="mt-4">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Manager Assignment
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Current Manager Assignments */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Current Manager Assignments</CardTitle>
                                                <CardDescription>Manage existing Manager-department assignments</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                                                    {manager_assignments?.map((assignment) => (
                                                        <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                                                            <div>
                                                                <div className="font-medium">
                                                                    {assignment.user.firstname} {assignment.user.lastname}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{assignment.user.email}</div>
                                                                <div className="text-sm text-gray-500">Department: {assignment.department}</div>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        checked={assignment.can_evaluate ?? true}
                                                                        onCheckedChange={(checked) =>
                                                                            handleUpdateManagerAssignment(assignment.id, checked)
                                                                        }
                                                                    />
                                                                    <span className="text-sm">Can Evaluate</span>
                                                                </div>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="destructive" size="sm">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently remove the Manager
                                                                                assignment for {assignment.user.firstname} {assignment.user.lastname}{' '}
                                                                                from the {assignment.department} department.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteManagerAssignment(assignment.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete Assignment
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!manager_assignments || manager_assignments.length === 0) && (
                                                        <div className="py-8 text-center text-gray-500">No Manager assignments found</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            )}

                            {/* Admin Tab */}
                            {isAdmin && (
                                <TabsContent value="admin" className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Create New Admin Assignment */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Create New Admin Assignment</CardTitle>
                                                <CardDescription>Assign any user to a department (regardless of role)</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <Label htmlFor="admin-user">User</Label>
                                                        <Select
                                                            value={newAdminAssignment.user_id}
                                                            onValueChange={(value) => setNewAdminAssignment((prev) => ({ ...prev, user_id: value }))}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select user" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {admin_users.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                                        {user.firstname} {user.lastname} ({user.email})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="admin-department">Departments</Label>
                                                        <div className="mt-2 max-h-60 space-y-3 overflow-y-auto rounded-lg border p-4">
                                                            <div className="flex items-center space-x-2 border-b pb-2">
                                                                <Checkbox
                                                                    id="select-all-admin"
                                                                    checked={newAdminAssignment.selectAll}
                                                                    onCheckedChange={() => handleSelectAllDepartments('admin')}
                                                                />
                                                                <Label htmlFor="select-all-admin" className="cursor-pointer font-medium">
                                                                    Select All
                                                                </Label>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {availableDepartments.map((department) => (
                                                                    <div key={department} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`dept-${department}-admin`}
                                                                            checked={newAdminAssignment.departments.includes(department)}
                                                                            onCheckedChange={() => handleDepartmentToggle(department, 'admin')}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`dept-${department}-admin`}
                                                                            className="cursor-pointer text-sm"
                                                                        >
                                                                            {department}
                                                                        </Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {newAdminAssignment.departments.length > 0 && (
                                                            <div className="mt-2 text-sm text-muted-foreground">
                                                                Selected: {newAdminAssignment.departments.length} department(s)
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            id="can_evaluate_admin"
                                                            checked={newAdminAssignment.can_evaluate}
                                                            onCheckedChange={(checked) =>
                                                                setNewAdminAssignment((prev) => ({ ...prev, can_evaluate: checked }))
                                                            }
                                                        />
                                                        <Label htmlFor="can_evaluate_admin">Can Evaluate</Label>
                                                    </div>
                                                </div>
                                                <Button onClick={handleCreateAdminAssignment} className="mt-4">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Admin Assignment
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        {/* Current Admin Assignments */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Current Admin Assignments</CardTitle>
                                                <CardDescription>Manage existing user-department assignments</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                                                    {admin_assignments?.map((assignment) => (
                                                        <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-4">
                                                            <div>
                                                                <div className="font-medium">
                                                                    {assignment.user.firstname} {assignment.user.lastname}
                                                                </div>
                                                                <div className="text-sm text-gray-500">{assignment.user.email}</div>
                                                                <div className="text-sm text-gray-500">Department: {assignment.department}</div>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Switch
                                                                        checked={assignment.can_evaluate ?? true}
                                                                        onCheckedChange={(checked) =>
                                                                            handleUpdateAdminAssignment(assignment.id, checked)
                                                                        }
                                                                    />
                                                                    <span className="text-sm">Can Evaluate</span>
                                                                </div>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="destructive" size="sm">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently remove the Admin
                                                                                assignment for {assignment.user.firstname} {assignment.user.lastname}{' '}
                                                                                from the {assignment.department} department.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteAdminAssignment(assignment.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete Assignment
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(!admin_assignments || admin_assignments.length === 0) && (
                                                        <div className="py-8 text-center text-gray-500">No Admin assignments found</div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            )}

                            {/* Frequencies Tab */}
                            {isAdmin && (
                                <TabsContent value="frequencies" className="space-y-6">
                                    <EvaluationFrequencyManager isAdmin={isAdmin} frequencies={frequencies} />
                                </TabsContent>
                            )}

                            {/* Evaluation Settings Tab */}
                            {isAdmin && (
                                <TabsContent value="settings" className="space-y-6">
                                    <EvaluationSettingsManager isAdmin={isAdmin} />
                                </TabsContent>
                            )}

                            {/* Evaluations Tab */}
                            <TabsContent value="evaluations" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {/* Supervisor Evaluation Status */}
                                    {isSupervisor && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Star className="h-5 w-5 text-yellow-600" />
                                                    Your Evaluation Status
                                                </CardTitle>
                                                <CardDescription>Track your evaluation progress for supervised employees</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                                                        <div>
                                                            <div className="font-medium text-blue-900">Pending Evaluations</div>
                                                            <div className="text-sm text-blue-700">Employees awaiting evaluation</div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                            0
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                                        <div>
                                                            <div className="font-medium text-green-900">Completed This Period</div>
                                                            <div className="text-sm text-green-700">Evaluations finished</div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                                            0
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button className="mt-4 w-full" variant="outline">
                                                    View All Evaluations
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Evaluation Guidelines */}
                                    {/* <Card>
                                        <CardHeader>
                                            <CardTitle>Evaluation Guidelines</CardTitle>
                                            <CardDescription>Understanding evaluation frequencies and periods</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 text-sm">
                                                <div className="rounded-lg bg-blue-50 p-3">
                                                    <div className="font-medium text-blue-900">Semi-Annual Evaluations</div>
                                                    <div className="text-blue-700">
                                                        • Period 1: January-June (Jan-Jun)
                                                        <br />
                                                        • Period 2: July-December (Jul-Dec)
                                                        <br />• Every 6 months
                                                    </div>
                                                </div>
                                                <div className="rounded-lg bg-green-50 p-3">
                                                    <div className="font-medium text-green-900">Annual Evaluations</div>
                                                    <div className="text-green-700">
                                                        • Period: January-December (Jan-Dec)
                                                        <br />• Once per year
                                                    </div>
                                                </div>
                                    </div>
                                </CardContent>
                            </Card> */}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Main>
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
