import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useState } from 'react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { ViewAbsenceModal } from './components/view-absence-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absence Management',
        href: '/employee-view/absence',
    },
];

interface AbsenceRequest {
    id: string;
    absence_type: string;
    from_date: string;
    to_date: string;
    days: number;
    status: string;
    reason: string;
    submitted_at: string;
    approved_at: string | null;
    approval_comments: string | null;
    is_partial_day: boolean;
    created_at: string;
    employee_name: string;
    picture: string;
    department: string;
    employeeid: string;
    position: string;
    remaining_credits: number;
    used_credits: number;
    total_credits: number;
}

interface AbsenceStats {
    totalAbsences: number;
    pendingAbsences: number;
    approvedAbsences: number;
    rejectedAbsences: number;
}

interface PageProps {
    absenceRequests: AbsenceRequest[];
    absenceStats: AbsenceStats;
    employee: any;
}

export default function Index({ absenceRequests, absenceStats, employee }: PageProps) {
    const [loading, setLoading] = useState(true);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewAbsence, setViewAbsence] = useState<AbsenceRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedAbsence, setSelectedAbsence] = useState<AbsenceRequest | null>(null);

    // Mock functions for the columns
    const handleEdit = (absence: AbsenceRequest) => {
        console.log('Edit absence:', absence);
    };

    const handleDelete = (id: string, onSuccess: () => void) => {
        console.log('Delete absence:', id);
        onSuccess();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absence Requests" />
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                <div>
                    <div className="ms-2 flex items-center">
                        <Users className="size-11" />
                        <div className="ms-2">
                            <h2 className="flex text-2xl font-bold tracking-tight">Absence Requests</h2>
                            <p className="text-muted-foreground">Manage your absence request submissions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="m-3 no-scrollbar">
                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                    <CardHeader>
                        <CardTitle>My Absence Requests</CardTitle>
                        <CardDescription>View and track your absence request submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns(
                                setIsViewOpen,
                                setViewAbsence,
                                setIsModalOpen,
                                setEditModalOpen,
                                setSelectedAbsence,
                                handleEdit,
                                handleDelete,
                            )}
                            data={absenceRequests || []}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* View Absence Modal */}
            <ViewAbsenceModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} absence={viewAbsence} />
        </AppLayout>
    );
}
