import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GradientBackground } from '@/components/ui/gradient-background';
import AppLogoIcon from '@/components/customize/app-logo-icon';
import { useInitials } from '@/hooks/use-initials';
import { useState, useEffect } from 'react';

interface WelcomeBannerProps {
    user: {
        firstname: string;
        lastname?: string;
        id?: number;
        email?: string;
        profile_image?: string;
    };
    userRole: string;
    supervisedDepartments?: string[];
}

export function WelcomeBanner({ user, userRole, supervisedDepartments = [] }: WelcomeBannerProps) {
    const getInitials = useInitials();
    const [imageError, setImageError] = useState(false);
    const currentTime = new Date();
    const hour = currentTime.getHours();
    let greeting = 'Good morning';
    
    if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
    } else if (hour >= 17) {
        greeting = 'Good evening';
    }

    const dateStr = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Get role badges - show userRole and up to 2 departments
    const roleBadges = [userRole];
    if (supervisedDepartments && supervisedDepartments.length > 0) {
        // Add first department as a badge
        roleBadges.push(supervisedDepartments[0]);
    }

    // Get full name for initials fallback
    const fullName = user.firstname && user.lastname 
        ? `${user.firstname} ${user.lastname}`.trim() 
        : user.firstname || 'User';

    // Determine if we should show profile image or logo
    const hasProfileImage = user.profile_image && user.profile_image.trim() !== '' && !imageError;

    // Reset image error when profile image changes
    useEffect(() => {
        setImageError(false);
    }, [user.profile_image]);

    return (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <GradientBackground className="absolute inset-0" />
            <div className="relative z-10 h-full w-full p-6">
                <div className="flex h-full items-center justify-between text-white">
                    {/* Left side - Profile Image/Logo and Welcome Message */}
                    <div className="flex items-center space-x-4">
                        {/* Profile Image or Logo */}
                        <div className="flex flex-col items-center">
                            {hasProfileImage ? (
                                <Avatar className="h-20 w-20 border-2 border-white/30">
                                    <AvatarImage
                                        src={user.profile_image}
                                        alt={fullName}
                                        onError={() => {
                                            // If image fails to load, show logo instead
                                            setImageError(true);
                                        }}
                                    />
                                    <AvatarFallback className="bg-white/20 text-white">
                                        {getInitials(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="flex aspect-square size-20 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-20 fill-current text-white" />
                                </div>
                            )}
                            {/* <div className="mt-2 text-center">
                                <p className="text-sm font-semibold text-white">AMALGATED</p>
                                <p className="text-xs text-white/80">GROUP OF COMPANIES</p>
                            </div> */}
                        </div>

                        {/* Welcome Message */}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">
                                {greeting}, {user.firstname}!
                            </h1>
                            <p className="text-sm text-white/80">Welcome back to your dashboard</p>
                            <div className="mt-2 flex items-center space-x-3">
                                {roleBadges.map((badge, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="bg-white/20 text-white hover:bg-white/30"
                                    >
                                        {badge}
                                    </Badge>
                                ))}
                                {user.id && (
                                    <span className="text-sm text-white/60">ID: {user.id}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right side - Date */}
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-white/80">Today</p>
                            <p className="text-lg font-semibold">{dateStr}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

