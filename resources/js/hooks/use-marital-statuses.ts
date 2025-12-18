import { useEffect, useState } from 'react';
import { maritalStatus as fallbackMaritalStatuses } from './data';

/**
 * Hook to fetch marital statuses from API
 * Falls back to hardcoded marital statuses if API fails
 */
export function useMaritalStatuses() {
    const [maritalStatuses, setMaritalStatuses] = useState<string[]>(fallbackMaritalStatuses);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaritalStatuses = async () => {
            try {
                const response = await fetch('/api/marital-statuses/all');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setMaritalStatuses(data);
                    } else {
                        // If API returns empty array, use fallback
                        setMaritalStatuses(fallbackMaritalStatuses);
                    }
                } else {
                    // If API fails, use fallback
                    setMaritalStatuses(fallbackMaritalStatuses);
                }
            } catch (error) {
                console.error('Error fetching marital statuses:', error);
                // Use fallback on error
                setMaritalStatuses(fallbackMaritalStatuses);
            } finally {
                setLoading(false);
            }
        };

        fetchMaritalStatuses();
    }, []);

    return { maritalStatuses, loading };
}

