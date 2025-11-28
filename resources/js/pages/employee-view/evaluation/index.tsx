import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/employee-layout/app-layout';
import { getCriteriaLabel, getDepartmentSettings } from '@/pages/evaluation/types/evaluation-settings';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import EmployeeEvaluationSummary from './components/evaluation-summary';
import { SectionCards } from './components/section-cards';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
];

interface EmployeeProps {
    employee: {
        id: number;
        employeeid: string;
        employee_name: string;
        firstname: string;
        lastname: string;
        department: string;
        position: string;
        picture?: string;
    };
    evaluation: null | {
        id: number;
        ratings: any;
        rating_date: string | null;
        work_quality: number | string | null;
        safety_compliance: number | string | null;
        punctuality: number | string | null;
        teamwork: number | string | null;
        organization: number | string | null;
        equipment_handling: number | string | null;
        comment?: string | null;
    };
}

export default function Index({ employee, evaluation }: EmployeeProps) {
    const [loading, setLoading] = useState(true);

    const parsed = useMemo(() => {
        const toNum = (v: any) => (v == null ? 0 : typeof v === 'number' ? v : Number(v) || 0);

        // Some evaluations store details inside a ratings JSON column
        let ratings: any = {};
        if (evaluation?.ratings) {
            ratings =
                typeof evaluation.ratings === 'string'
                    ? (() => {
                          try {
                              return JSON.parse(evaluation.ratings as any);
                          } catch {
                              return {};
                          }
                      })()
                    : evaluation.ratings;
        }

        // Support both legacy flat fields and new nested structure
        // 0-10 scale values
        // Work Function: average across provided work functions (quality/efficiency)
        let workFunction = 0;
        if (Array.isArray((evaluation as any)?.workFunctions) && (evaluation as any)?.workFunctions.length > 0) {
            const scores: number[] = ((evaluation as any).workFunctions as any[]).flatMap((wf: any) => [
                toNum(wf?.work_quality),
                toNum(wf?.work_efficiency),
            ]);
            const filtered = scores.filter((n) => n > 0);
            workFunction = filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
        } else {
            workFunction = toNum((evaluation as any)?.work_quality ?? ratings?.work_quality);
        }

        // Work Attitude: average of attitude metrics if present
        let workAttitude = 0;
        const wa: any = (evaluation as any)?.workAttitude;
        if (wa) {
            const waScores = [
                toNum(wa?.responsible),
                toNum(wa?.jobKnowledge ?? wa?.job_knowledge),
                toNum(wa?.cooperation),
                toNum(wa?.initiative),
                toNum(wa?.dependability),
            ];
            const filtered = waScores.filter((n) => n > 0);
            workAttitude = filtered.length ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
        } else {
            workAttitude = toNum((evaluation as any)?.teamwork ?? ratings?.teamwork);
        }

        // Attendance from nested attendance.rating, fallback to punctuality
        const attendance = toNum((evaluation as any)?.attendance?.rating ?? (evaluation as any)?.punctuality ?? ratings?.punctuality);

        // Replace organization/safety/equipment with attitudes (supervisor/coworker)
        const attitudeSupervisor = toNum((evaluation as any)?.attitudes?.supervisor_rating ?? ratings?.attitudes?.supervisor_rating);
        const attitudeCoworker = toNum((evaluation as any)?.attitudes?.coworker_rating ?? ratings?.attitudes?.coworker_rating);

        const department = employee?.department ?? '';
        const settings = getDepartmentSettings(department);

        // Some departments (e.g., Coop Area) do not include coworker attitude
        const includeCoworker = settings?.showAttitudeTowardsCoworker !== false;

        const categories = includeCoworker
            ? [workFunction, workAttitude, attendance, attitudeSupervisor, attitudeCoworker]
            : [workFunction, workAttitude, attendance, attitudeSupervisor];
        const avg10 = categories.length ? categories.reduce((a, b) => a + b, 0) / categories.length : 0;

        // Overall: prefer explicit total_rating (0-10). Otherwise use computed average
        const overall10 = toNum((evaluation as any)?.total_rating) || avg10;
        const overall5 = overall10 / 2; // convert 10-scale to 5-star scale

        const metrics = [
            { name: getCriteriaLabel(department, 'workOperations') || 'Work Function', score: Math.round(workFunction * 10) },
            { name: getCriteriaLabel(department, 'workAttitude') || 'Work Attitude', score: Math.round(workAttitude * 10) },
            { name: getCriteriaLabel(department, 'attendance') || 'Attendance', score: Math.round(attendance * 10) },
            {
                name: getCriteriaLabel(department, 'attitudeTowardsSupervisor') || 'Attitude Towards Supervisor',
                score: Math.round(attitudeSupervisor * 10),
            },
        ] as { name: string; score: number }[];
        if (includeCoworker) {
            metrics.push({
                name: getCriteriaLabel(department, 'attitudeTowardsCoworker') || 'Attitude Towards Co-Worker',
                score: Math.round(attitudeCoworker * 10),
            });
        }

        return {
            metrics,
            overall5,
            lastEvaluatedAt: evaluation?.rating_date ? new Date(evaluation.rating_date).toLocaleDateString() : undefined,
        };
    }, [evaluation, employee]);
    // Temporary no-op handlers to satisfy columns signature
    const setIsViewOpen = (_open: boolean) => {};
    const setViewEmployee = (_employee: any) => {};
    const setIsModalOpen = (_open: boolean) => {};
    const setEditModalOpen = (_open: boolean) => {};
    const setSelectedEmployee = (_employee: any) => {};
    const handleEdit = (_employee: any) => {};
    const handleDelete = (_id: string, _onSuccess: () => void) => {};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluation" />
            <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                <div>
                    <div className="ms-2 flex items-center">
                        <Users className="size-11" />
                        <div className="ms-2">
                            <h2 className="flex text-2xl font-bold tracking-tight">Evaluation</h2>
                            <p className="text-muted-foreground">Manage your organization's workforce</p>
                        </div>
                    </div>
                </div>
            </div>
            <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
                <TabsContent value="overview" className="space-y-4">
                    <div className="flex flex-1 flex-col">
                        <div className="relative flex flex-1 flex-col">
                            <div className="@container/main flex flex-1 flex-col gap-2">
                                {/* <div className="flex flex-col">
                                    <SectionCards />
                                </div> */}
                                <div className="flex flex-col px-4 lg:px-3">
                                    <EmployeeEvaluationSummary
                                        employeeName={employee?.employee_name || `${employee?.firstname ?? ''} ${employee?.lastname ?? ''}`.trim()}
                                        employeeId={employee?.employeeid || ''}
                                        overallRating={parsed.overall5}
                                        lastEvaluatedAt={parsed.lastEvaluatedAt}
                                        metrics={parsed.metrics}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <Separator className="shadow-sm" />
            </Tabs>
            {/* <div className="m-3 no-scrollbar">
                <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                    <CardHeader>
                        <CardTitle>Evaluation List</CardTitle>
                        <CardDescription>List of Evaluation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns(
                                setIsViewOpen,
                                setViewEmployee,
                                setIsModalOpen,
                                setEditModalOpen,
                                setSelectedEmployee,
                                handleEdit,
                                handleDelete,
                            )}
                            data={[]}
                        />
                    </CardContent>
                </Card>
            </div> */}
        </AppLayout>
    );
}
