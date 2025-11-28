import { Link } from '@inertiajs/react';
import * as LucidIcons from 'lucide-react';
import { Button } from './ui/button';

interface TableColumn {
    label: string;
    key: string;
    isImage?: boolean;
    isAction?: boolean;
    className?: string;
}

interface ActionConfig {
    label: string;
    icon: keyof typeof LucidIcons;
    route: string;
    className: string;
}

interface TableRow {
    [key: string]: any;
}

interface CustomTableProps {
    columns: TableColumn[];
    actions: ActionConfig[];
    data: TableRow[];
    from: number;
    onDelete: (route: string) => void;
    onView: (row: TableRow) => void;
    onEdit: (row: TableRow) => void;
    isModal?: boolean;
}

export const CustomTable = ({ columns, actions, data, from, onDelete, onView, onEdit, isModal }: CustomTableProps) => {
    console.log(actions);

    const renderActionButtons = (row: TableRow) => {
        return (
            <div className="flex">
                {actions.map((action, index) => {
                    const IconComponent = LucidIcons[action.icon] as React.ElementType;

                    // View Functionality
                    if (isModal) {
                        if (action.label === 'View') {
                            return (
                                <Button key={index} className={action.className} onClick={() => onView?.(row)}>
                                    <IconComponent size={18} />
                                </Button>
                            );
                        }

                        // Edit Functionality
                        if (action.label === 'Edit') {
                            return (
                                <Button key={index} className={action.className} onClick={() => onEdit?.(row)}>
                                    <IconComponent size={18} />
                                </Button>
                            );
                        }
                    }

                    // Delete Functionality
                    if (action.label === 'Delete') {
                        return (
                            <Button key={index} className={action.className} onClick={() => onDelete(route(action.route, row.id))}>
                                <IconComponent size={18} />
                            </Button>
                        );
                    }

                    return (
                        <Link key={index} as="button" href={route(action.route, row.id)} className={action.className}>
                            <IconComponent size={18} />
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-gray-700 text-white">
                        <th className="border p-4">#</th>

                        {columns.map((column, index) => (
                            <th key={column.key} className={column.className}>
                                {column.label}{' '}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2 text-center">{from + index}</td>

                                {columns.map((col) => (
                                    <td key={col.key} className="border px-4 py-2 text-center">
                                        {col.isImage ? (
                                            <div>
                                                <img src={row[col.key]} alt={row.name || 'Image'} className="h-16 w-20 rounded-lg object-cover" />
                                            </div>
                                        ) : col.isAction ? (
                                            renderActionButtons(row)
                                        ) : (
                                            row[col.key]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-md py-4 text-center font-bold text-red-600">
                                No Leave Found!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
