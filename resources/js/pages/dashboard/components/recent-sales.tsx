import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Employee {
    id: number;
    name: string;
    department: string;
    position: string;
    picture?: string;
    employeeid: string;
    initials: string;
}

interface Props {
    supervisorEmployees?: Employee[];
    isSupervisor?: boolean;
}

export function RecentSales({ supervisorEmployees, isSupervisor = false }: Props) {
    // If supervisor and has employees, show them
    if (isSupervisor && supervisorEmployees && supervisorEmployees.length > 0) {
        return (
            <div className="space-y-8">
                {supervisorEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                            {employee.picture ? (
                                <AvatarImage src={employee.picture} alt={employee.name} />
                            ) : (
                                <AvatarFallback>{employee.initials}</AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex flex-1 flex-wrap items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm leading-none font-medium">{employee.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {employee.position} • {employee.department}
                                </p>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">{employee.employeeid}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default hardcoded data for non-supervisors or when no employees
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                    {/* <AvatarImage src='/avatars/01.png' alt='Avatar' /> */}
                    <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-wrap items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-medium">Olivia Martin</p>
                        <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                    </div>
                    <div className="font-medium">+$1,999.00</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                    {/* <AvatarImage src='/avatars/02.png' alt='Avatar' /> */}
                    <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-wrap items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-medium">Jackson Lee</p>
                        <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                    </div>
                    <div className="font-medium">+$39.00</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                    {/* <AvatarImage src='/avatars/03.png' alt='Avatar' /> */}
                    <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-wrap items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-medium">Isabella Nguyen</p>
                        <p className="text-sm text-muted-foreground">isabella.nguyen@email.com</p>
                    </div>
                    <div className="font-medium">+$299.00</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                    {/* <AvatarImage src='/avatars/04.png' alt='Avatar' /> */}
                    <AvatarFallback>WK</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-wrap items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-medium">William Kim</p>
                        <p className="text-sm text-muted-foreground">will@email.com</p>
                    </div>
                    <div className="font-medium">+$99.00</div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                    {/* <AvatarImage src='/avatars/05.png' alt='Avatar' /> */}
                    <AvatarFallback>SD</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-wrap items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm leading-none font-medium">Sofia Davis</p>
                        <p className="text-sm text-muted-foreground">sofia.davis@email.com</p>
                    </div>
                    <div className="font-medium">+$39.00</div>
                </div>
            </div>
        </div>
    );
}
