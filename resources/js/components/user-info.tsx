import { DefaultAvatar } from '@/components/default-avatar';
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

export function UserInfo({ user, showEmail = false, showRole = false }: { user: UserData; showEmail?: boolean; showRole?: boolean }) {
    // Handle both user and employee data structures
    const isEmployee = 'employeeid' in user;

    // Create full name from firstname and lastname
    const fullName = user.firstname && user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.firstname || user.lastname || '';

    // Get primary role (first role in the array) - only for regular users
    const primaryRole = !isEmployee && user.roles && user.roles.length > 0 ? user.roles[0] : null;

    // Get profile image - employee uses 'picture', user uses 'profile_image'
    const profileImage = isEmployee ? user.picture : user.profile_image;

    return (
        <>
            <DefaultAvatar
                src={profileImage || '/AGOC.png'}
                alt={fullName}
                fallbackText={fullName}
                size="sm"
                onError={(e) => {
                    e.currentTarget.src = '/AGOC.png';
                }}
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                {showRole && primaryRole && <span className="truncate text-xs text-muted-foreground">{primaryRole}</span>}
                {showEmail && !isEmployee && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
                {isEmployee && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.department} • {user.position}
                    </span>
                )}
            </div>
        </>
    );
}
