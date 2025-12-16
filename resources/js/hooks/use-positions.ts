import { useEffect, useState } from 'react';
import { positions as fallbackPositions } from './data';

/**
 * Hook to fetch positions from API for a specific department
 * Falls back to hardcoded positions if API fails
 */
export function usePositionsByDepartment(department: string | null | undefined) {
    const [positions, setPositions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPositions = async () => {
            if (!department) {
                setPositions([]);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/positions/by-department?department=${encodeURIComponent(department)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setPositions(data);
                    } else {
                        // If API returns empty array, try fallback
                        const fallback = getFallbackPositions(department);
                        setPositions(fallback);
                    }
                } else {
                    // If API fails, use fallback
                    const fallback = getFallbackPositions(department);
                    setPositions(fallback);
                }
            } catch (error) {
                console.error('Error fetching positions:', error);
                // Use fallback on error
                const fallback = getFallbackPositions(department);
                setPositions(fallback);
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, [department]);

    return { positions, loading };
}

/**
 * Get fallback positions for a department (from hardcoded data)
 */
function getFallbackPositions(department: string): string[] {
    // Import the helper function from data.ts
    const { getPositionsForDepartment } = require('./data');
    return getPositionsForDepartment(department) || [];
}

