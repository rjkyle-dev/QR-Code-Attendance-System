import { useEffect, useState } from 'react';

export function useCountUp(target: number, duration = 1000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const start = 0;
        const startTime = performance.now();

        function animate(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * (target - start) + start);
            setCount(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        }

        requestAnimationFrame(animate);

        // Reset on target change
        return () => setCount(0);
    }, [target, duration]);

    return count;
} 