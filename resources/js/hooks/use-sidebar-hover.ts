import { useSidebar } from '@/components/ui/sidebar';
import { useCallback, useState } from 'react';

export function useSidebarHover() {
    const { state, setOpen } = useSidebar();
    const [isHovering, setIsHovering] = useState(false);

    // Show sidebar on hover when collapsed to icons
    const handleMouseEnter = useCallback(() => {
        if (state === 'collapsed') {
            setIsHovering(true);
            setOpen(true);
        }
    }, [state, setOpen]);

    // Keep sidebar open when mouse leaves - no auto-collapse
    const handleMouseLeave = useCallback(() => {
        // Do nothing - sidebar stays open
        // Only the SidebarTrigger should collapse it
    }, []);

    return { isHovering, handleMouseEnter, handleMouseLeave };
}
