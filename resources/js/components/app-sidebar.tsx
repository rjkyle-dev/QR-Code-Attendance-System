import { Link } from '@inertiajs/react';
import { Activity, CalendarPlus2, FileText, Fingerprint, LayoutGrid, NotebookPen, ShieldCheck, User2 } from 'lucide-react';
import * as React from 'react';

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
import { type NavItem } from '@/types';
import AppLogo from './customize/app-logo';
import { NavSidebar } from './nav-sidebar';
import SidebarHoverZone from './sidebar-hover-zone';
import { User } from './user';

// This is sample data.

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: 'View Dashboard',
    },
    {
        title: 'Employee',
        href: '/employee',
        icon: User2,
        permission: 'View Employee',
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: Fingerprint,
        permission: 'View Attendance',
    },
    {
        title: 'Evaluation',
        href: '/evaluation',
        icon: NotebookPen,
        permission: 'View Evaluation',
        items: [
            {
                title: 'Evaluation List',
                href: '/evaluation',
                permission: 'View Evaluation',
            },
            {
                title: 'Department Evaluation',
                href: '/evaluation/department-evaluation',
                permission: 'View Evaluation By Department',
            },
            // {
            //     title: 'Supervisor Management',
            //     href: '/evaluation/supervisor-management',
            //     permission: 'View Supervisor Management',
            // },
        ],
    },
    {
        title: 'Leave',
        href: '/leave',
        icon: CalendarPlus2,
        permission: 'View Leave',
        items: [
            {
                title: 'Leave List',
                href: '/leave',
                permission: 'View Leave',
            },
            {
                title: 'Leave Credit Summary',
                href: '/leave/credit-summary',
                permission: 'View Leave Credit Summary',
            },
        ],
    },
    {
        title: 'Absence',
        href: '/absence',
        icon: CalendarPlus2,
        permission: 'View Absence',
        items: [
            {
                title: 'Absence List',
                href: '/absence',
                permission: 'View Absence',
            },
            {
                title: 'Absence Credit Summary',
                href: '/absence/credit-summary',
                permission: 'View Absence Credit Summary',
            },
        ],
    },
    {
        title: 'Resume to Work',
        href: '/resume-to-work',
        icon: CalendarPlus2,
        permission: 'View Resume to Work',
    },
    {
        title: 'Admin Management',
        href: '/admin-management',
        icon: User2,
        permission: 'View Admin Management',
    },
    {
        title: 'Service-Tenure',
        // href: '/service-tenure/index',
        href: '/service-tenure/employee',
        icon: Activity,
        permission: 'View Service Tenure Management',
        // items: [
        //     {
        //         title: 'Service Tenure',
        //         href: '/service-tenure/employee',
        //         permission: 'View Service Tenure Employee',
        //     },

        //     {
        //         title: 'Pay Advancement',
        //         href: '/service-tenure/pay-advancement',
        //         permission: 'View Service Tenure Pay Advancement',
        //     },
        // ],
    },

    {
        title: 'Access Management',
        href: '/permission/access/index',
        icon: ShieldCheck,
        permission: 'View Access',
        items: [
            {
                title: 'Admin Management',
                href: '/permission/user/index',
                permission: 'View Admin',
            },
            {
                title: 'Role Management',
                href: '/permission/role/index',
                permission: 'View Role',
            },
            {
                title: 'Permission Control',
                href: '/permission/access/index',
                permission: 'View Permission',
            },
        ],
    },
    {
        title: 'Reports',
        href: '/report',
        icon: FileText,
        permission: 'View Report',
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { state, isMobile } = useSidebar();
    const { handleMouseEnter } = useSidebarHover();

    return (
        <>
            <SidebarHoverZone show={!isMobile && state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <Sidebar collapsible="icon" variant="inset" onMouseEnter={handleMouseEnter} {...props}>
                <SidebarHeader className="bg-cfar-400">
                    {/* <TeamSwitcher teams={data.teams} /> */}

                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="h-auto flex-col items-center justify-center gap-1 data-[slot=sidebar-menu-button]:!p-3"
                            >
                                <Link href="/dashboard">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent className="bg-cfar-400">
                    <NavSidebar items={mainNavItems} />

                    {/* <NavMain navItem={data.navItem} /> */}
                    {/* <NavProjects projects={data.projects} /> */}
                </SidebarContent>
                <SidebarFooter className="bg-cfar-400">
                    {/* <NavUser user={data.user} /> */}
                    <User />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </>
    );
}
