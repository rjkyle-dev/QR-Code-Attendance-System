import { useEffect, useState } from 'react';
import { workStatus as fallbackWorkStatuses } from './data';

/**
 * Hook to fetch work statuses from API
 * Falls back to hardcoded work statuses if API fails
 */
export function useWorkStatuses() {
    const [workStatuses, setWorkStatuses] = useState<string[]>(fallbackWorkStatuses);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkStatuses = async () => {
            try {
                const response = await fetch('/api/work-statuses/all');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setWorkStatuses(data);
                    } else {
                        // If API returns empty array, use fallback
                        setWorkStatuses(fallbackWorkStatuses);
                    }
                } else {
                    // If API fails, use fallback
                    setWorkStatuses(fallbackWorkStatuses);
                }
            } catch (error) {
                console.error('Error fetching work statuses:', error);
                // Use fallback on error
                setWorkStatuses(fallbackWorkStatuses);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkStatuses();
    }, []);

    return { workStatuses, loading };
}

