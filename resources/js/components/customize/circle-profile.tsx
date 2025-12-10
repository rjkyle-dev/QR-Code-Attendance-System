import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

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

type UserData = User | Employee;

export function CircleProfile({ user, showEmail = false }: { user: UserData; showEmail?: boolean }) {
    const getInitials = useInitials();

    // Handle both user and employee data structures
    const isEmployee = 'employeeid' in user;

    // Create full name from firstname and lastname
    const fullName = user.firstname && user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.firstname || user.lastname || '';

    // Get profile image - employee uses 'picture', user uses 'profile_image'
    const profileImage = isEmployee ? user.picture : user.profile_image;

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage
                    src={profileImage || '/AGOC.png'}
                    alt={fullName}
                    onError={(e) => {
                        e.currentTarget.src = '/AGOC.png';
                    }}
                />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(fullName)}
                </AvatarFallback>
            </Avatar>
            {/* <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div> */}
        </>
    );
}
