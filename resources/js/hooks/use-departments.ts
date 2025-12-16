import { useEffect, useState } from 'react';
import { departments as fallbackDepartments } from './data';

/**
 * Hook to fetch departments from API
 * Falls back to hardcoded departments if API fails
 */
export function useDepartments() {
    const [departments, setDepartments] = useState<string[]>(fallbackDepartments);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('/api/departments/all');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setDepartments(data);
                    } else {
                        // If API returns empty array, use fallback
                        setDepartments(fallbackDepartments);
                    }
                } else {
                    // If API fails, use fallback
                    setDepartments(fallbackDepartments);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
                // Use fallback on error
                setDepartments(fallbackDepartments);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    return { departments, loading };
}

