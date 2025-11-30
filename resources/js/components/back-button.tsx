import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ComponentProps } from 'react';

interface BackButtonProps extends Omit<ComponentProps<typeof Button>, 'asChild'> {
    href?: string;
    label?: string;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export function BackButton({ href, label = 'Back', onClick, variant = 'outline', className, children, ...props }: BackButtonProps) {
    const buttonContent = (
        <>
            <ArrowLeft className="h-4 w-4" />
            {children || label}
        </>
    );

    if (href) {
        return (
            <Button variant={variant} className={cn('gap-2', className)} asChild {...props}>
                <Link href={href}>{buttonContent}</Link>
            </Button>
        );
    }

    if (onClick) {
        return (
            <Button variant={variant} onClick={onClick} className={cn('gap-2', className)} {...props}>
                {buttonContent}
            </Button>
        );
    }

    // Default: go back in browser history
    return (
        <Button variant={variant} onClick={() => window.history.back()} className={cn('gap-2', className)} {...props}>
            {buttonContent}
        </Button>
    );
}
