import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, CalendarSync, ClipboardList, Clock, FileText, LayoutGrid } from 'lucide-react';
import * as React from 'react';

import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { router } from '@inertiajs/react';
import AppLogo from './app-logo';
import { EmployeeUser } from './employee-user';

interface Employee {
    id: number;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface EmployeeNavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    items?: {
        title: string;
        href: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}

const employeeNavItems: EmployeeNavItem[] = [
    {
        title: 'Dashboard',
        href: '/employee-view',
        icon: LayoutGrid,
    },
    // {
    //     title: 'My Profile',
    //     href: '/employee-view/profile',
    //     icon: User,
    // },
    {
        title: 'Evaluations',
        href: '/employee-view/evaluations',
        icon: FileText,
    },
    {
        title: 'Requests Forms',
        href: '/employee-view/requests',
        icon: ClipboardList,
        items: [
            {
                title: 'Leave Request',
                href: '/employee-view/leave',
                icon: CalendarDays,
            },
            {
                title: 'Absence Request',
                href: '/employee-view/absence',
                icon: Clock,
            },
            // {
            //     title: 'Return to Work',
            //     href: '/employee-view/return-work/request',
            //     icon: CalendarSync,
            // },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const page = usePage<{ employee?: Employee }>();
    const employee = page.props.employee;
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const { handleMouseEnter } = useSidebarHover();

    const handleLogout = () => {
        router.post(route('employee.logout'));
    };

    return (
        <>
            <SidebarHoverZone show={!isMobile && state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <Sidebar collapsible="icon" variant="inset" onMouseEnter={handleMouseEnter} {...props}>
                <SidebarHeader className="bg-cfar-400">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="h-auto flex-col items-center justify-center gap-1 data-[slot=sidebar-menu-button]:!p-3"
                            >
                                <Link href="/employee-view">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="bg-cfar-400">
                    <div className="px-2 py-8">
                        <SidebarMenu>
                            {employeeNavItems.map((item) => {
                                const isParentActive = item.href === page.url || item.items?.some((s) => s.href === page.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        {item.items ? (
                                            isCollapsed ? (
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={!!isParentActive}
                                                    className="mt-2 text-white hover:bg-cfar-450"
                                                    tooltip={{ children: item.title }}
                                                >
                                                    <Link href={item.href}>
                                                        <item.icon className="h-4 w-4" />
                                                    </Link>
                                                </SidebarMenuButton>
                                            ) : (
                                                <Accordion
                                                    type="single"
                                                    collapsible
                                                    defaultValue={
                                                        ['/employee-view/leave', '/employee-view/absence', '/employee-view/return-work'].includes(
                                                            page.url,
                                                        )
                                                            ? 'requests-forms'
                                                            : undefined
                                                    }
                                                    className="w-full"
                                                >
                                                    <AccordionItem value="requests-forms" className="border-none">
                                                        <AccordionTrigger className="mt-2 rounded-lg px-3 text-left text-white hover:bg-cfar-450">
                                                            <div className="flex items-center gap-2">
                                                                <item.icon className="h-4 w-4" />
                                                                {!isCollapsed && <span className="font-semibold">{item.title}</span>}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pt-1">
                                                            <SidebarMenu className="pl-5">
                                                                {item.items.map((sub) => (
                                                                    <SidebarMenuItem key={sub.title}>
                                                                        <SidebarMenuButton
                                                                            asChild
                                                                            isActive={sub.href === page.url}
                                                                            className="mt-1 text-white hover:bg-cfar-450"
                                                                            tooltip={{ children: sub.title }}
                                                                        >
                                                                            <Link className="font-medium" href={sub.href}>
                                                                                <sub.icon className="h-4 w-4" />
                                                                                {!isCollapsed && <span>{sub.title}</span>}
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuItem>
                                                                ))}
                                                            </SidebarMenu>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            )
                                        ) : (
                                            <SidebarMenuButton
                                                asChild
                                                isActive={item.href === page.url}
                                                className="mt-2 text-white hover:bg-cfar-450"
                                                tooltip={{ children: item.title }}
                                            >
                                                <Link className="font-semibold" href={item.href}>
                                                    <item.icon className="h-4 w-4" />
                                                    {!isCollapsed && <span>{item.title}</span>}
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </div>
                </SidebarContent>

                <SidebarFooter className="bg-cfar-400 p-4">{employee && <EmployeeUser employee={employee} />}</SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </>
    );
}
