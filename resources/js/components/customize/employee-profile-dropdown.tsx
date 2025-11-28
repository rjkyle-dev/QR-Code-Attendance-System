import { CircleProfile } from '@/components/customize/circle-profile';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserMenuContent } from './user-menu-content';

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface EmployeeProfileDropdownProps {
    user: Employee;
}

export function EmployeeProfileDropdown({ user }: EmployeeProfileDropdownProps) {
    const isMobile = useIsMobile();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg" className="group">
                    <CircleProfile user={user} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                side={isMobile ? 'bottom' : 'bottom'}
            >
                <UserMenuContent user={user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
