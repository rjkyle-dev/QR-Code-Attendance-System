import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Check, Clock, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absence Approvals',
        href: '/absence/absence-approve',
    },
];

export type AbsenceType = 'Annual Leave' | 'Sick Leave' | 'Emergency Leave' | 'Maternity/Paternity' | 'Personal Leave' | 'Other';

export type AbsenceStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'Pending Supervisor Approval'
    | 'Pending HR Approval'
    | 'Rejected by Supervisor'
    | 'Rejected by HR';

interface AbsenceRequestItem {
    id: string;
    full_name: string;
    employee_id_number: string;
    department: string;
    position: string;
    absence_type: AbsenceType;
    from_date: string;
    to_date: string;
    submitted_at: string;
    days: number;
    reason: string;
    is_partial_day: boolean;
    status: AbsenceStatus;
    picture?: string;
    employee_name?: string;
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
}

const absenceTypesForFilter: Array<AbsenceType | 'All'> = [
    'All',
    'Annual Leave',
    'Sick Leave',
    'Emergency Leave',
    'Maternity/Paternity',
    'Personal Leave',
    'Other',
];

interface Props {
    initialRequests: AbsenceRequestItem[];
    user_permissions?: {
        is_supervisor: boolean;
        is_super_admin: boolean;
        is_hr?: boolean;
        supervised_departments: string[];
    };
}

export default function AbsenceApprove({ initialRequests = [], user_permissions }: Props) {
    const [requests, setRequests] = useState<AbsenceRequestItem[]>(initialRequests);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<AbsenceType | 'All'>('All');
    const { props } = usePage<{ initialRequests?: AbsenceRequestItem[]; auth?: any }>();
    const currentUser = props.auth?.user;

    // Update local state when server data changes
    useEffect(() => {
        if (props.initialRequests && Array.isArray(props.initialRequests)) {
            setRequests(props.initialRequests);
        }
    }, [props.initialRequests]);

    // Realtime updates via Echo (admin view)
    useEffect(() => {
        const echo: any = (window as any).Echo;
        if (!echo) {
            console.warn('Echo not available for real-time updates');
            return;
        }

        console.log('Setting up real-time listeners for absence requests');
        console.log('Echo instance:', echo);
        console.log('Echo config:', {
            broadcaster: echo.options.broadcaster,
            key: echo.options.key,
            wsHost: echo.options.wsHost,
            wsPort: echo.options.wsPort,
        });

        // Test Echo connection (works for both Pusher and Reverb)
        const connector = echo.connector;
        if (connector) {
            // For Reverb, check if there's a connection object
            if (connector.pusher && connector.pusher.connection) {
                connector.pusher.connection.bind('connected', () => {
                    console.log('Echo connected successfully');
                });

                connector.pusher.connection.bind('disconnected', () => {
                    console.log('Echo disconnected');
                });

                connector.pusher.connection.bind('error', (error: any) => {
                    console.error('Echo connection error:', error);
                });

                // Check current connection state
                const state = connector.pusher.connection.state;
                console.log('Current Echo connection state:', state);
            } else {
                console.warn('Echo connector structure not recognized. Reverb server may not be running.');
            }
        }

        // Listen on notifications channel for general absence requests
        const notificationsChannel = echo.channel('notifications');
        console.log('Subscribing to notifications channel');

        // Add subscription callbacks
        notificationsChannel.subscribed(() => {
            console.log('Successfully subscribed to notifications channel');
        });

        notificationsChannel.error((error: any) => {
            console.error('Error subscribing to notifications channel:', error);
        });

        notificationsChannel
            .listen('.AbsenceRequested', (e: any) => {
                console.log('Received AbsenceRequested event on notifications channel:', e);
                // Only process if user is SuperAdmin (supervisors get it via their private channel)
                if (!user_permissions?.is_super_admin && user_permissions?.is_supervisor) {
                    return; // Supervisors should only receive via their private channel
                }

                // Handle both flat structure and nested structure
                const absenceData = e.absence || e;
                if (absenceData && (absenceData.id || absenceData.absence_id)) {
                    const absenceId = absenceData.id || absenceData.absence_id;
                    const newAbsence: AbsenceRequestItem = {
                        id: String(absenceId),
                        full_name: absenceData.full_name || absenceData.employee_name || 'Employee',
                        employee_id_number: absenceData.employee_id_number || '',
                        department: absenceData.department || '',
                        position: absenceData.position || '',
                        absence_type: absenceData.absence_type,
                        from_date: absenceData.from_date,
                        to_date: absenceData.to_date,
                        submitted_at: absenceData.submitted_at || new Date().toISOString(),
                        days: absenceData.days || 1,
                        reason: absenceData.reason || '',
                        is_partial_day: !!absenceData.is_partial_day,
                        status: absenceData.status || 'Pending Supervisor Approval',
                        picture: absenceData.picture || '',
                        employee_name: absenceData.employee_name || '',
                        supervisor_status: absenceData.supervisor_status || 'pending',
                        supervisor_approved_by: absenceData.supervisor_approved_by || null,
                        supervisor_approved_at: absenceData.supervisor_approved_at || null,
                        supervisor_comments: absenceData.supervisor_comments || null,
                        supervisor_approver: absenceData.supervisor_approver || null,
                        hr_status: absenceData.hr_status || null,
                        hr_approved_by: absenceData.hr_approved_by || null,
                        hr_approved_at: absenceData.hr_approved_at || null,
                        hr_comments: absenceData.hr_comments || null,
                        hr_approver: absenceData.hr_approver || null,
                    };

                    // Check if this absence already exists to avoid duplicates
                    setRequests((prev) => {
                        const exists = prev.some((r) => r.id === newAbsence.id);
                        if (exists) {
                            console.log('Absence already exists, not adding duplicate');
                            return prev;
                        }
                        console.log('Adding new absence request to list');
                        toast.success(`New absence request from ${newAbsence.full_name}`);
                        return [newAbsence, ...prev];
                    });
                }
            })
            .listen('.RequestStatusUpdated', (e: any) => {
                console.log('Received RequestStatusUpdated event:', e);
                if (String(e.type || '') !== 'absence_status') return;
                setRequests((prev) => prev.map((r) => (String(r.id) === String(e.request_id) ? { ...r, status: e.status } : r)));
            })
            .listen('.AbsenceSupervisorApproved', (e: any) => {
                console.log('Received AbsenceSupervisorApproved event:', e);
                const absenceData = e;
                if (absenceData && absenceData.absence_id) {
                    setRequests((prev) =>
                        prev.map((r) => {
                            if (String(r.id) === String(absenceData.absence_id)) {
                                toast.success(`Supervisor approved absence request from ${absenceData.full_name}`);
                                return {
                                    ...r,
                                    supervisor_status: absenceData.supervisor_status,
                                    supervisor_approved_by: absenceData.supervisor_approved_by,
                                    supervisor_approved_at: absenceData.supervisor_approved_at,
                                    supervisor_comments: absenceData.supervisor_comments,
                                    supervisor_approver: absenceData.supervisor_approver,
                                    status: absenceData.status,
                                    hr_status: absenceData.hr_status,
                                };
                            }
                            return r;
                        }),
                    );
                }
            })
            .listen('.AbsenceHRApproved', (e: any) => {
                console.log('Received AbsenceHRApproved event:', e);
                const absenceData = e;
                if (absenceData && absenceData.absence_id) {
                    setRequests((prev) =>
                        prev.map((r) => {
                            if (String(r.id) === String(absenceData.absence_id)) {
                                toast.success(
                                    `HR ${absenceData.hr_status === 'approved' ? 'approved' : 'rejected'} absence request from ${absenceData.full_name}`,
                                );
                                return {
                                    ...r,
                                    hr_status: absenceData.hr_status,
                                    hr_approved_by: absenceData.hr_approved_by,
                                    hr_approved_at: absenceData.hr_approved_at,
                                    hr_comments: absenceData.hr_comments,
                                    hr_approver: absenceData.hr_approver,
                                    status: absenceData.status,
                                    supervisor_status: absenceData.supervisor_status,
                                    supervisor_approved_by: absenceData.supervisor_approved_by,
                                    supervisor_approved_at: absenceData.supervisor_approved_at,
                                    supervisor_comments: absenceData.supervisor_comments,
                                    supervisor_approver: absenceData.supervisor_approver,
                                };
                            }
                            return r;
                        }),
                    );
                }
            });

        // Also listen on private supervisor channel if user is supervisor
        if (user_permissions && user_permissions.is_supervisor && currentUser?.id) {
            const currentUserId = currentUser.id;
            console.log('Setting up supervisor channel for user:', currentUserId);
            const supervisorChannel = echo.private(`supervisor.${currentUserId}`);

            supervisorChannel.subscribed(() => {
                console.log('Successfully subscribed to supervisor channel');
            });

            supervisorChannel.error((error: any) => {
                console.error('Error subscribing to supervisor channel:', error);
            });

            supervisorChannel.listen('.AbsenceRequested', (e: any) => {
                console.log('Received AbsenceRequested on supervisor channel:', e);
                // Handle both flat structure and nested structure
                const absenceData = e.absence || e;
                if (absenceData && (absenceData.id || absenceData.absence_id)) {
                    const absenceId = absenceData.id || absenceData.absence_id;
                    const newAbsence: AbsenceRequestItem = {
                        id: String(absenceId),
                        full_name: absenceData.full_name || absenceData.employee_name || 'Employee',
                        employee_id_number: absenceData.employee_id_number || '',
                        department: absenceData.department || '',
                        position: absenceData.position || '',
                        absence_type: absenceData.absence_type,
                        from_date: absenceData.from_date,
                        to_date: absenceData.to_date,
                        submitted_at: absenceData.submitted_at || new Date().toISOString(),
                        days: absenceData.days || 1,
                        reason: absenceData.reason || '',
                        is_partial_day: !!absenceData.is_partial_day,
                        status: absenceData.status || 'Pending Supervisor Approval',
                        picture: absenceData.picture || '',
                        employee_name: absenceData.employee_name || '',
                        supervisor_status: absenceData.supervisor_status || 'pending',
                        supervisor_approved_by: absenceData.supervisor_approved_by || null,
                        supervisor_approved_at: absenceData.supervisor_approved_at || null,
                        supervisor_comments: absenceData.supervisor_comments || null,
                        supervisor_approver: absenceData.supervisor_approver || null,
                        hr_status: absenceData.hr_status || null,
                        hr_approved_by: absenceData.hr_approved_by || null,
                        hr_approved_at: absenceData.hr_approved_at || null,
                        hr_comments: absenceData.hr_comments || null,
                        hr_approver: absenceData.hr_approver || null,
                    };

                    setRequests((prev) => {
                        const exists = prev.some((r) => r.id === newAbsence.id);
                        if (exists) {
                            console.log('Absence already exists, not adding duplicate');
                            return prev;
                        }
                        console.log('Adding new absence request to supervisor list');
                        toast.success(`New absence request from ${newAbsence.full_name}`);
                        return [newAbsence, ...prev];
                    });
                }
            });

            // Listen for HR approval updates on supervisor channel
            supervisorChannel.listen('.AbsenceHRApproved', (e: any) => {
                console.log('Received AbsenceHRApproved on supervisor channel:', e);
                const absenceData = e;
                if (absenceData && absenceData.absence_id) {
                    setRequests((prev) =>
                        prev.map((r) => {
                            if (String(r.id) === String(absenceData.absence_id)) {
                                toast.info(
                                    `HR ${absenceData.hr_status === 'approved' ? 'approved' : 'rejected'} absence request from ${absenceData.full_name}`,
                                );
                                return {
                                    ...r,
                                    hr_status: absenceData.hr_status,
                                    hr_approved_by: absenceData.hr_approved_by,
                                    hr_approved_at: absenceData.hr_approved_at,
                                    hr_comments: absenceData.hr_comments,
                                    hr_approver: absenceData.hr_approver,
                                    status: absenceData.status,
                                };
                            }
                            return r;
                        }),
                    );
                }
            });
        }

        // Listen on private HR channel if user is HR
        if (user_permissions && user_permissions.is_hr && currentUser?.id) {
            const currentUserId = currentUser.id;
            console.log('Setting up HR channel for user:', currentUserId);
            const hrChannel = echo.private(`hr.${currentUserId}`);

            hrChannel.subscribed(() => {
                console.log('Successfully subscribed to HR channel');
            });

            hrChannel.error((error: any) => {
                console.error('Error subscribing to HR channel:', error);
            });

            // Listen for supervisor approval updates on HR channel
            hrChannel.listen('.AbsenceSupervisorApproved', (e: any) => {
                console.log('Received AbsenceSupervisorApproved on HR channel:', e);
                const absenceData = e;
                if (absenceData && absenceData.absence_id) {
                    const isSuperAdmin = user_permissions?.is_super_admin || false;
                    const isRejected = absenceData.supervisor_status === 'rejected' || absenceData.status === 'Rejected by Supervisor';

                    setRequests((prev) => {
                        const exists = prev.some((r) => r.id === String(absenceData.absence_id));
                        if (exists) {
                            // Update existing absence
                            return prev.map((r) => {
                                if (String(r.id) === String(absenceData.absence_id)) {
                                    // Only show notification if approved, or if rejected and user is Super Admin
                                    if (!isRejected) {
                                        toast.info(`Supervisor approved absence request from ${absenceData.full_name} - Ready for HR review`);
                                    } else if (isSuperAdmin) {
                                        toast.warning(`Supervisor rejected absence request from ${absenceData.full_name} - Available for override`);
                                    }
                                    return {
                                        ...r,
                                        supervisor_status: absenceData.supervisor_status,
                                        supervisor_approved_by: absenceData.supervisor_approved_by,
                                        supervisor_approved_at: absenceData.supervisor_approved_at,
                                        supervisor_comments: absenceData.supervisor_comments,
                                        supervisor_approver: absenceData.supervisor_approver,
                                        status: absenceData.status,
                                        hr_status: absenceData.hr_status,
                                    };
                                }
                                return r;
                            });
                        } else {
                            // Add new absence if it doesn't exist (only if approved, or rejected and Super Admin)
                            if (!isRejected || isSuperAdmin) {
                                const newAbsence: AbsenceRequestItem = {
                                    id: String(absenceData.absence_id),
                                    full_name: absenceData.full_name,
                                    employee_id_number: absenceData.employee_id_number || '',
                                    department: absenceData.department || '',
                                    position: absenceData.position || '',
                                    absence_type: absenceData.absence_type,
                                    from_date: absenceData.from_date,
                                    to_date: absenceData.to_date,
                                    submitted_at: absenceData.submitted_at || new Date().toISOString(),
                                    days: absenceData.days || 1,
                                    reason: absenceData.reason || '',
                                    is_partial_day: !!absenceData.is_partial_day,
                                    status: absenceData.status,
                                    picture: absenceData.picture || '',
                                    employee_name: absenceData.employee_name || '',
                                    supervisor_status: absenceData.supervisor_status,
                                    supervisor_approved_by: absenceData.supervisor_approved_by,
                                    supervisor_approved_at: absenceData.supervisor_approved_at,
                                    supervisor_comments: absenceData.supervisor_comments,
                                    supervisor_approver: absenceData.supervisor_approver,
                                    hr_status: absenceData.hr_status,
                                };
                                if (!isRejected) {
                                    toast.success(`New absence request from ${newAbsence.full_name} - Ready for HR review`);
                                } else {
                                    toast.warning(`Supervisor rejected absence request from ${newAbsence.full_name} - Available for override`);
                                }
                                return [newAbsence, ...prev];
                            }
                            return prev;
                        }
                    });
                }
            });
        }

        return () => {
            console.log('Cleaning up Echo listeners');
            notificationsChannel.stopListening('.AbsenceRequested');
            notificationsChannel.stopListening('.RequestStatusUpdated');
            notificationsChannel.stopListening('.AbsenceSupervisorApproved');
            notificationsChannel.stopListening('.AbsenceHRApproved');
            if (user_permissions && user_permissions.is_supervisor && currentUser?.id) {
                const supervisorChannel = echo.private(`supervisor.${currentUser.id}`);
                supervisorChannel.stopListening('.AbsenceRequested');
                supervisorChannel.stopListening('.AbsenceHRApproved');
                echo.leave(`supervisor.${currentUser.id}`);
            }
            if (user_permissions && user_permissions.is_hr && currentUser?.id) {
                const hrChannel = echo.private(`hr.${currentUser.id}`);
                hrChannel.stopListening('.AbsenceSupervisorApproved');
                echo.leave(`hr.${currentUser.id}`);
            }
            echo.leave('notifications');
        };
    }, [user_permissions, currentUser?.id]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return requests.filter((r) => {
            const matchQ = !q || `${r.full_name} ${r.department}`.toLowerCase().includes(q);
            const matchType = typeFilter === 'All' || r.absence_type === typeFilter;
            return matchQ && matchType;
        });
    }, [requests, search, typeFilter]);

    const grouped = useMemo(() => {
        const isSuperAdmin = user_permissions?.is_super_admin || false;

        return {
            pending: filtered.filter(
                (r) =>
                    r.status === 'pending' || r.status === 'Pending Supervisor Approval' || r.supervisor_status === 'pending' || !r.supervisor_status,
            ),
            pendingHR: filtered.filter((r) => {
                // If supervisor rejected, only show to Super Admin
                if (r.supervisor_status === 'rejected' || r.status === 'Rejected by Supervisor') {
                    return isSuperAdmin && (r.hr_status === 'pending' || !r.hr_status);
                }
                // Normal flow: show if supervisor approved and waiting for HR
                return r.status === 'Pending HR Approval' || (r.supervisor_status === 'approved' && (r.hr_status === 'pending' || !r.hr_status));
            }),
            approved: filtered.filter((r) => r.status === 'approved' || r.hr_status === 'approved'),
            rejected: filtered.filter(
                (r) =>
                    r.status === 'rejected' ||
                    r.status === 'Rejected by Supervisor' ||
                    r.status === 'Rejected by HR' ||
                    r.supervisor_status === 'rejected' ||
                    r.hr_status === 'rejected',
            ),
        };
    }, [filtered, user_permissions?.is_super_admin]);

    const onDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        // Add visual feedback
        (e.currentTarget as HTMLElement).style.opacity = '0.5';
    };

    const onDragOverColumn = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDropToColumn = (e: React.DragEvent, newStatus: AbsenceStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;

        // Reset opacity for all dragged elements
        const draggedElements = document.querySelectorAll('[draggable="true"]');
        draggedElements.forEach((el) => {
            (el as HTMLElement).style.opacity = '1';
        });

        // Determine stage based on status
        const request = requests.find((r) => r.id === id);
        if (request) {
            const stage = request.supervisor_status === 'pending' || !request.supervisor_status ? 'supervisor' : 'hr';
            const status = newStatus === 'approved' || newStatus === 'Pending HR Approval' ? 'approved' : 'rejected';
            updateAbsenceStatus(id, status as 'approved' | 'rejected', stage);
        }
    };

    const onDragEnd = (e: React.DragEvent) => {
        // Reset opacity when drag ends
        (e.currentTarget as HTMLElement).style.opacity = '1';
    };

    const updateAbsenceStatus = useCallback(
        (id: string, status: 'approved' | 'rejected', stage: 'supervisor' | 'hr', comments?: string) => {
            const request = requests.find((r) => r.id === id);
            if (!request) return;

            // Store the original status in case we need to revert
            const originalSupervisorStatus = request.supervisor_status;
            const originalHrStatus = request.hr_status;

            // Determine which approval stage based on user role and current status
            const isSupervisor = user_permissions?.is_supervisor || false;
            const isHR = user_permissions?.is_hr || false;
            const isSuperAdmin = user_permissions?.is_super_admin || false;

            // Client-side validation: Check if HR is trying to act on supervisor-rejected request
            if (stage === 'hr' && !isSuperAdmin) {
                if (request.supervisor_status === 'rejected' || request.status === 'Rejected by Supervisor') {
                    toast.error('This absence request was rejected by the supervisor. HR cannot perform any actions on rejected requests.');
                    return;
                }
                if (request.supervisor_status !== 'approved' && request.supervisor_status !== 'pending' && request.supervisor_status !== null) {
                    toast.error('Supervisor must approve this absence request before HR can make a decision.');
                    return;
                }
            }

            // Prepare request data based on stage
            const requestData: any = {};
            if (stage === 'supervisor' && (isSupervisor || isSuperAdmin)) {
                requestData.supervisor_status = status;
                if (comments) requestData.supervisor_comments = comments;
            } else if (stage === 'hr' && (isHR || isSuperAdmin)) {
                requestData.hr_status = status;
                if (comments) requestData.hr_comments = comments;
            } else {
                toast.error('You do not have permission to perform this action.');
                return;
            }

            // Update local state immediately for UI responsiveness (optimistic update)
            setRequests((prev) =>
                prev.map((r) => {
                    if (r.id === id) {
                        if (stage === 'supervisor') {
                            return {
                                ...r,
                                supervisor_status: status,
                                supervisor_comments: comments || r.supervisor_comments,
                                status: (status === 'approved' ? 'Pending HR Approval' : 'Rejected by Supervisor') as AbsenceStatus,
                            };
                        } else {
                            return {
                                ...r,
                                hr_status: status,
                                hr_comments: comments || r.hr_comments,
                                status: (status === 'approved' ? 'Approved' : 'Rejected by HR') as AbsenceStatus,
                            };
                        }
                    }
                    return r;
                }),
            );

            // Make API call using Inertia router
            router.patch(route('absence.updateStatus', { absence: id }), requestData, {
                onSuccess: (page) => {
                    const message = stage === 'supervisor' ? `Supervisor ${status} successfully!` : `HR ${status} successfully!`;
                    toast.success(message);
                },
                onError: (errors: any) => {
                    // Revert local state on error
                    setRequests((prev) =>
                        prev.map((r) => {
                            if (r.id === id) {
                                return {
                                    ...r,
                                    supervisor_status: originalSupervisorStatus,
                                    hr_status: originalHrStatus,
                                };
                            }
                            return r;
                        }),
                    );

                    // Extract error message from response
                    let errorMessage = 'Failed to update absence status. Please try again.';

                    // Check if error is in the page props (Inertia error handling)
                    if (errors && typeof errors === 'object') {
                        // Check for message field first (from backend JSON response)
                        if (errors.message) {
                            errorMessage = Array.isArray(errors.message) ? errors.message[0] : errors.message;
                        }
                        // Check for error field (from Inertia withErrors)
                        else if (errors.error) {
                            errorMessage = Array.isArray(errors.error) ? errors.error[0] : errors.error;
                        }
                        // Check for general error messages
                        else if (Array.isArray(errors)) {
                            errorMessage = errors[0] || errorMessage;
                        }
                        // Check for nested error structure
                        else if (errors.hr_status || errors.supervisor_status) {
                            const fieldError = errors.hr_status || errors.supervisor_status;
                            errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;
                        }
                        // Check for other common error formats
                        else {
                            const firstKey = Object.keys(errors)[0];
                            if (firstKey) {
                                const firstError = errors[firstKey];
                                errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                            }
                        }
                    }

                    toast.error(errorMessage);
                },
                preserveScroll: true,
            });
        },
        [requests, user_permissions],
    );

    const approve = (id: string, stage: 'supervisor' | 'hr' = 'supervisor', comments?: string) => {
        const request = requests.find((r) => r.id === id);
        if (!request) return;

        // Determine stage based on current status
        const actualStage = request.supervisor_status === 'pending' || !request.supervisor_status ? 'supervisor' : 'hr';

        updateAbsenceStatus(id, 'approved', actualStage, comments);
    };

    const reject = (id: string, stage: 'supervisor' | 'hr' = 'supervisor', comments?: string) => {
        const request = requests.find((r) => r.id === id);
        if (!request) return;

        // Determine stage based on current status
        const actualStage = request.supervisor_status === 'pending' || !request.supervisor_status ? 'supervisor' : 'hr';

        updateAbsenceStatus(id, 'rejected', actualStage, comments);
    };

    return (
        <SidebarProvider>
            <Head title="Absence Approvals" />
            <Toaster position="top-center" richColors />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="flex items-center gap-3 p-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Search by employee name or department..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AbsenceType | 'All')}>
                                <SelectTrigger className="h-10 w-40">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    {absenceTypesForFilter.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
                            <BoardColumn
                                title="Pending Supervisor"
                                count={grouped.pending.length}
                                tone="blue"
                                onDrop={(e) => onDropToColumn(e, 'pending')}
                                onDragOver={onDragOverColumn}
                            >
                                {grouped.pending.map((item) => (
                                    <AbsenceCard
                                        key={`${item.id}-${item.status}`}
                                        item={item}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onApprove={approve}
                                        onReject={reject}
                                        userPermissions={user_permissions}
                                    />
                                ))}
                            </BoardColumn>

                            <BoardColumn
                                title="Pending HR"
                                count={grouped.pendingHR.length}
                                tone="yellow"
                                onDrop={(e) => onDropToColumn(e, 'pending')}
                                onDragOver={onDragOverColumn}
                            >
                                {grouped.pendingHR.map((item) => (
                                    <AbsenceCard
                                        key={`${item.id}-${item.status}`}
                                        item={item}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        onApprove={approve}
                                        onReject={reject}
                                        userPermissions={user_permissions}
                                    />
                                ))}
                            </BoardColumn>

                            <BoardColumn
                                title="Approved"
                                count={grouped.approved.length}
                                tone="green"
                                onDrop={(e) => onDropToColumn(e, 'approved')}
                                onDragOver={onDragOverColumn}
                            >
                                {grouped.approved.map((item) => (
                                    <AbsenceCard
                                        key={`${item.id}-${item.status}`}
                                        item={item}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        userPermissions={user_permissions}
                                    />
                                ))}
                            </BoardColumn>

                            <BoardColumn
                                title="Rejected"
                                count={grouped.rejected.length}
                                tone="red"
                                onDrop={(e) => onDropToColumn(e, 'rejected')}
                                onDragOver={onDragOverColumn}
                            >
                                {grouped.rejected.map((item) => (
                                    <AbsenceCard
                                        key={`${item.id}-${item.status}`}
                                        item={item}
                                        onDragStart={onDragStart}
                                        onDragEnd={onDragEnd}
                                        userPermissions={user_permissions}
                                    />
                                ))}
                            </BoardColumn>
                        </div>
                        <CardFooter className="flex justify-start p-4">
                            <Link href={route('absence.index')}>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                        </CardFooter>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

function BoardColumn({
    title,
    count,
    tone,
    children,
    onDragOver,
    onDrop,
}: {
    title: string;
    count: number;
    tone: 'blue' | 'green' | 'red' | 'yellow';
    children: React.ReactNode;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}) {
    const toneClasses =
        tone === 'blue'
            ? 'bg-blue-50 border-blue-200'
            : tone === 'green'
              ? 'bg-green-50 border-green-200'
              : tone === 'yellow'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200';

    return (
        <div className={`min-h-[400px] rounded-lg border p-3 ${toneClasses}`} onDragOver={onDragOver} onDrop={onDrop}>
            <div className="mb-3 flex items-center gap-2">
                <h3 className="text-base font-semibold">{title}</h3>
                <Badge variant="outline">{count}</Badge>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function AbsenceCard({
    item,
    onDragStart,
    onDragEnd,
    onApprove,
    onReject,
    userPermissions,
}: {
    item: AbsenceRequestItem;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onApprove?: (id: string, stage?: 'supervisor' | 'hr', comments?: string) => void;
    onReject?: (id: string, stage?: 'supervisor' | 'hr', comments?: string) => void;
    userPermissions?: {
        is_supervisor?: boolean;
        is_super_admin?: boolean;
        is_hr?: boolean;
    };
}) {
    const {
        id,
        full_name,
        employee_id_number,
        department,
        position,
        absence_type,
        from_date,
        to_date,
        submitted_at,
        days,
        reason,
        is_partial_day,
        status,
        picture,
        supervisor_status,
        hr_status,
        supervisor_comments,
        hr_comments,
    } = item;

    const isSupervisor = userPermissions?.is_supervisor || false;
    const isHR = userPermissions?.is_hr || false;
    const isSuperAdmin = userPermissions?.is_super_admin || false;

    // Determine if user can approve at supervisor stage
    const canApproveSupervisor = (isSupervisor || isSuperAdmin) && (supervisor_status === 'pending' || !supervisor_status);

    // Determine if user can approve at HR stage
    // HR cannot act if supervisor rejected (unless Super Admin)
    // Only Super Admin can override a supervisor rejection
    const canApproveHR = isSuperAdmin
        ? (supervisor_status === 'approved' || (supervisor_status === 'rejected' && isSuperAdmin)) && (hr_status === 'pending' || !hr_status)
        : isHR && supervisor_status === 'approved' && (hr_status === 'pending' || !hr_status);

    // Show action buttons if user can approve at current stage
    const showActionButtons = canApproveSupervisor || canApproveHR;

    const typeTone =
        absence_type === 'Sick Leave'
            ? 'bg-yellow-100 text-yellow-800'
            : absence_type === 'Personal Leave'
              ? 'bg-blue-100 text-blue-800'
              : absence_type === 'Annual Leave'
                ? 'bg-purple-100 text-purple-800'
                : absence_type === 'Emergency Leave'
                  ? 'bg-red-100 text-red-800'
                  : absence_type === 'Maternity/Paternity'
                    ? 'bg-pink-100 text-pink-800'
                    : 'bg-gray-100 text-gray-800';

    const employeeName = full_name || item.employee_name || 'Unknown Employee';

    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, id)}
            onDragEnd={onDragEnd}
            className="border-main/40 cursor-grab shadow-sm transition hover:shadow-md"
        >
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <img src={picture || '/AGOC.png'} alt={employeeName} className="h-10 w-10 rounded-full border object-cover" />
                    <div className="flex-1">
                        <CardTitle className="text-base">{employeeName}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-xs">
                            <UserRound className="h-3.5 w-3.5" /> {department} • {position}
                        </CardDescription>
                        <CardDescription className="text-xs text-gray-500">ID: {employee_id_number}</CardDescription>
                    </div>
                    <Badge className={`${typeTone}`}>{absence_type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" /> {from_date} - {to_date}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {days} {days === 1 ? 'day' : 'days'}
                        {is_partial_day && (
                            <Badge variant="outline" className="text-xs">
                                Partial
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">Submitted {format(new Date(submitted_at), 'MMM dd, yyyy')}</div>
                <div className="rounded-md bg-muted/40 p-2 text-sm">
                    <span className="font-semibold">Reason: </span>
                    {reason}
                </div>

                {/* Two-Stage Approval Workflow Display */}
                <div className="space-y-2 rounded-lg border border-muted p-2 text-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {supervisor_status === 'approved' ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : supervisor_status === 'rejected' ? (
                                <X className="h-3.5 w-3.5 text-red-600" />
                            ) : (
                                <Clock className="h-3.5 w-3.5 text-yellow-600" />
                            )}
                            <span className="font-medium">Supervisor:</span>
                            <span
                                className={
                                    supervisor_status === 'approved'
                                        ? 'text-green-600'
                                        : supervisor_status === 'rejected'
                                          ? 'text-red-600'
                                          : 'text-yellow-600'
                                }
                            >
                                {supervisor_status === 'approved' ? 'Approved' : supervisor_status === 'rejected' ? 'Rejected' : 'Pending'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {hr_status === 'approved' ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : hr_status === 'rejected' ? (
                                <X className="h-3.5 w-3.5 text-red-600" />
                            ) : supervisor_status === 'approved' ? (
                                <Clock className="h-3.5 w-3.5 text-yellow-600" />
                            ) : (
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                            )}
                            <span className="font-medium">HR:</span>
                            <span
                                className={
                                    hr_status === 'approved'
                                        ? 'text-green-600'
                                        : hr_status === 'rejected'
                                          ? 'text-red-600'
                                          : supervisor_status === 'approved'
                                            ? 'text-yellow-600'
                                            : 'text-gray-400'
                                }
                            >
                                {hr_status === 'approved'
                                    ? 'Approved'
                                    : hr_status === 'rejected'
                                      ? 'Rejected'
                                      : supervisor_status === 'approved'
                                        ? 'Pending'
                                        : 'Waiting'}
                            </span>
                        </div>
                    </div>
                    {supervisor_comments && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Supervisor:</span> {supervisor_comments}
                        </div>
                    )}
                    {hr_comments && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">HR:</span> {hr_comments}
                        </div>
                    )}
                </div>

                {/* Action Buttons - Show based on user role and current stage */}
                {showActionButtons && (
                    <div className="flex gap-2 pt-1">
                        <Button
                            variant="outline"
                            className="flex-1 border-green-400 text-green-700 hover:bg-green-50"
                            onClick={() => {
                                const stage = canApproveSupervisor ? 'supervisor' : 'hr';
                                onApprove?.(id, stage);
                            }}
                        >
                            <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => {
                                const stage = canApproveSupervisor ? 'supervisor' : 'hr';
                                onReject?.(id, stage);
                            }}
                        >
                            <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
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
