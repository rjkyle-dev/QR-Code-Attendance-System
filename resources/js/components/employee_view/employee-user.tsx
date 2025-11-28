import { CircleProfile } from '@/components/customize/circle-profile';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { router } from '@inertiajs/react';
import { ChevronsUpDown, LogOut, Settings, User } from 'lucide-react';

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

interface EmployeeUserProps {
    employee: Employee;
}

export function EmployeeUser({ employee }: EmployeeUserProps) {
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    const handleLogout = () => {
        router.post(route('employee.logout'));
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="group w-full text-white hover:bg-cfar-450">
                            <div className="flex w-full items-center space-x-3">
                                <CircleProfile user={employee} />
                                <div className="flex-1 text-left">
                                    <p className="truncate font-semibold text-white">{employee.employee_name}</p>
                                    <p className="text-xs text-white/80">ID: {employee.employeeid}</p>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4 flex-shrink-0 text-white" />
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <div className="p-4">
                            <div className="flex items-center space-x-3">
                                <CircleProfile user={employee} />
                                <div>
                                    <p className="font-medium">{employee.employee_name}</p>
                                    {/* <p className="text-sm text-muted-foreground">{employee.position}</p> */}
                                    <p className="text-xs text-muted-foreground">ID: {employee.employeeid}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1 border-t p-2">
                            {/* <Button variant="ghost" className="w-full justify-start" onClick={() => router.visit('/employee-view/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                My Profile
                            </Button> */}
                            <Button variant="ghost" className="w-full justify-start" onClick={() => router.visit('/employee-view/profile-settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                Profile Settings
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
