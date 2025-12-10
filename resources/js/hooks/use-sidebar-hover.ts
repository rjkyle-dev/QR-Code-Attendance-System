import { useSidebar } from '@/components/ui/sidebar';
import { useCallback, useState } from 'react';

export function useSidebarHover() {
    // Debug logging
    console.debug("useSidebarHover: Hook called", {
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
    });
    
    let sidebarContext;
    try {
        sidebarContext = useSidebar();
    } catch (error) {
        console.error("useSidebarHover: Error calling useSidebar", {
            error,
            timestamp: new Date().toISOString(),
            stack: new Error().stack,
        });
        throw error;
    }
    
    const { state, setOpen } = sidebarContext;
    const [isHovering, setIsHovering] = useState(false);
    
    console.debug("useSidebarHover: Successfully obtained sidebar context", {
        state,
        timestamp: new Date().toISOString(),
    });

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
