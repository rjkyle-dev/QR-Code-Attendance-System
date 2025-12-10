import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;
    
    // Debug logging
    console.debug("AppShell: Rendering", {
        variant,
        isOpen,
        timestamp: new Date().toISOString(),
    });

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    console.debug("AppShell: Wrapping children with SidebarProvider", {
        defaultOpen: isOpen ?? true,
        timestamp: new Date().toISOString(),
    });

    return <SidebarProvider defaultOpen={isOpen ?? true}>{children}</SidebarProvider>;
}
