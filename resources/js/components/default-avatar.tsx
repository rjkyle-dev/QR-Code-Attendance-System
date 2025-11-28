import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

interface DefaultAvatarProps {
    src?: string;
    alt?: string;
    fallbackText?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function DefaultAvatar({ src, alt = '', fallbackText = '', className = '', size = 'md', onError }: DefaultAvatarProps) {
    const getInitials = useInitials();

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    return (
        <Avatar className={`overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}>
            <AvatarImage src={src} alt={alt} onError={onError} />
            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                {getInitials(fallbackText)}
            </AvatarFallback>
        </Avatar>
    );
}
