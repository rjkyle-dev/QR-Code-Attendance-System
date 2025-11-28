'use client';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/user-permission';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Star } from 'lucide-react';
import { Evaluation } from '../types/evaluation';
import { DataTableColumnHeader } from './data-table-column-header';
import {} from './editemployeemodal';

const columns = (
    setIsModelOpen: (open: boolean) => void,
    setViewModalOpen: (open: boolean) => void,
    setEditModalOpen: (open: boolean) => void,
    setSelectedEvaluation: (evaluation: Evaluation | null) => void,
    user_permissions?: {
        can_evaluate: boolean;
        is_super_admin: boolean;
        is_supervisor: boolean;
        evaluable_departments: string[];
    },
): ColumnDef<Evaluation>[] => [
    {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => {
            // const src = row.getValue('picture') as string;
            const src = row.original.picture;
            const name = row.original.employee_name;
            const empid = row.original.employeeid;

            return (
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {src ? (
                            <img
                                src={src}
                                alt="Profile"
                                className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-xs text-gray-500">
                                <img
                                    src="Logo.png"
                                    className="animate-scale-in border-main dark:border-darksMain h-12 w-12 rounded-full border-2 object-cover"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">{empid}</div>
                    </div>
                </div>
            );
        },
    },

    {
        accessorKey: 'department',
        header: 'Departments',
        cell: ({ row }) => {
            const department: string = row.getValue('department');
            const position = row.original.position;

            return (
                <div>
                    <div className="text-sm font-medium text-gray-900">{department}</div>
                    <div className="text-xs text-gray-500">{position}</div>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const department = row.getValue(columnId);

            return filterValue.includes(department);
        },
    },
    {
        accessorKey: 'evaluation_frequency',
        header: 'Evaluation Frequency',
        cell: ({ row }) => {
            const frequency = row.original.evaluation_frequency;
            const department = row.original.department;

            // Enhanced debug logging
            console.log('Frequency data:', {
                department,
                frequency,
                frequencyType: typeof frequency,
                frequencyLength: frequency ? frequency.length : 'N/A',
                hasFrequency: !!frequency,
                rowDataKeys: Object.keys(row.original),
                rowData: row.original,
            });

            if (!frequency) {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Not Set</span>
                        <span className="text-xs text-gray-500">({department})</span>
                    </div>
                );
            }

            const isSemiAnnual = frequency === 'semi_annual';
            const colorClass = isSemiAnnual ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200';
            const displayText = isSemiAnnual ? 'Semi-Annual' : 'Annual';
            const icon = isSemiAnnual ? '🔄' : '📅';

            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span className={`rounded border px-2 py-1 text-xs font-medium ${colorClass}`}>{displayText}</span>
                </div>
            );
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const frequency = row.getValue(columnId);
            return filterValue.includes(frequency);
        },
    },
    {
        accessorKey: 'ratings',
        header: 'Ratings',
        cell: ({ row }) => {
            const ratings = row.original.ratings;
            let display = 'No Rating';
            let colorClass = 'bg-gray-100 text-gray-800';
            
            if (ratings !== null && ratings !== undefined && ratings !== '' && ratings !== '0' && ratings !== '0.0') {
                const ratingNum = parseFloat(ratings);
                if (!isNaN(ratingNum) && ratingNum > 0) {
                    display = ratings.toString();
                    if (ratingNum >= 8) {
                        colorClass = 'bg-green-100 text-green-800';
                    } else if (ratingNum >= 5) {
                        colorClass = 'bg-yellow-100 text-yellow-800';
                    } else {
                        colorClass = 'bg-red-100 text-red-800';
                    }
                }
            }
            
            return <span className={`rounded px-2 py-1 text-xs font-medium ${colorClass}`}>{display}</span>;
        },
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue || filterValue.length === 0) return true;

            const ratings = row.getValue(columnId);

            return filterValue.includes(ratings);
        },
    },
    {
        accessorKey: 'action',
        header: () => <div>Action</div>,
        id: 'actions',
        cell: ({ row }) => {
            const evaluation = row.original;
            const { can } = usePermission();

            // Check if user can evaluate this specific employee
            const canEvaluateThisEmployee =
                user_permissions?.can_evaluate &&
                (user_permissions.is_super_admin ||
                    (user_permissions.is_supervisor && user_permissions.evaluable_departments.includes(evaluation.department)));

            return (
                <>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 p-0 px-3 hover:bg-green-200"
                            onClick={() => {
                                setSelectedEvaluation(evaluation);
                                setViewModalOpen(true);
                            }}
                        >
                            <span className="sr-only">View</span>
                            <Eye className="h-4 w-4" />
                        </Button>
                        {/* {canEvaluateThisEmployee && can('Start Evaluation Rating') && (
                            <Button
                                variant="main"
                                size="icon"
                                className="h-8 w-8 p-0 px-3 hover:bg-blue-200"
                                onClick={() => {
                                    if (typeof setSelectedEvaluation === 'function') setSelectedEvaluation(evaluation);
                                    setIsModelOpen(true);
                                }}
                            >
                                <span className="sr-only">Add Rating</span>
                                <Star className="h-4 w-4" />
                            </Button>
                        )} */}
                    </div>
                </>
            );
        },
    },
];

export { columns, type Evaluation };
