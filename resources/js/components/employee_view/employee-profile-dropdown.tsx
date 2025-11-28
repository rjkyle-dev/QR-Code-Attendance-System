import { CircleProfile } from '@/components/customize/circle-profile';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { router } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';

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

interface EmployeeProfileDropdownProps {
    employee: Employee;
}

export function EmployeeProfileDropdown({ employee }: EmployeeProfileDropdownProps) {
    const isMobile = useIsMobile();

    const handleLogout = () => {
        router.post(route('employee.logout'));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg" className="group">
                    <CircleProfile user={employee} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                side={isMobile ? 'bottom' : 'bottom'}
            >
                <div className="p-4">
                    <div className="flex items-center space-x-3">
                        <CircleProfile user={employee} />
                        <div>
                            <p className="font-medium">{employee.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="text-sm">
                            <span className="text-muted-foreground">ID:</span> {employee.employeeid}
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Department:</span> {employee.department}
                        </div>
                    </div>
                </div>
                <div className="border-t p-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.visit('/employee-view/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                    </Button>
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
    );
}
