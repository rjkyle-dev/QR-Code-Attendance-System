'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type NavItemEmployee } from '@/types';
import { Link } from '@inertiajs/react';
import { CalendarPlus2, FileChartColumnIncreasing, Fingerprint, LayoutGrid, NotebookPen, User2 } from 'lucide-react';
import * as React from 'react';
import AppLogo from './customize/app-logo';

const mainNavItems: NavItemEmployee[] = [
    {
        title: 'Dashboard',
        href: '/employee-view',
        icon: LayoutGrid,
    },
    {
        title: 'My Profile',
        href: '/employee-view/profile',
        icon: User2,
    },
    {
        title: 'My Attendance',
        href: '/employee-view/attendance',
        icon: Fingerprint,
    },
    {
        title: 'My Evaluations',
        href: '/employee-view/evaluations',
        icon: NotebookPen,
    },
    {
        title: 'My Leave',
        href: '/employee-view/leave',
        icon: CalendarPlus2,
    },
    {
        title: 'My Reports',
        href: '/employee-view/reports',
        icon: FileChartColumnIncreasing,
    },
];

interface EmployeeSidebarProps {
    className?: string;
}

export function EmployeeSidebar({ className }: EmployeeSidebarProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>({});

    const toggleDropdown = (title: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <div className={cn('flex h-screen flex-col bg-cfar-400 text-white transition-all duration-200', isCollapsed ? 'w-16' : 'w-64', className)}>
            {/* Header */}
            <div className="border-cfar-400-border border-b p-4">
                <div className="flex items-center justify-center">
                    {!isCollapsed && <AppLogo />}
                    {isCollapsed && (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
                            <span className="text-sm font-bold text-cfar-400">C</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {mainNavItems.map((item) => (
                        <li key={item.title}>
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    'hover:bg-cfar-400-accent hover:text-cfar-400-accent-foreground',
                                    'focus:ring-cfar-400-ring focus:ring-2 focus:outline-none',
                                    isCollapsed && 'justify-center',
                                )}
                            >
                                {item.icon && <item.icon className="h-4 w-4" />}
                                {!isCollapsed && <span>{item.title}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="border-cfar-400-border border-t p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn('hover:bg-cfar-400-accent w-full text-white', isCollapsed && 'justify-center')}
                >
                    {isCollapsed ? '→' : '←'}
                    {!isCollapsed && <span className="ml-2">Collapse</span>}
                </Button>
            </div>
        </div>
    );
}
