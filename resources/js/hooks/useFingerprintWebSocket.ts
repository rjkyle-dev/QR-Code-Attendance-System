import { useEffect } from 'react';

export function useFingerprintWebSocket(onFingerprintData: (data: any) => void, onLaravelResponse?: (data: any) => void) {
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'laravel_response' && onLaravelResponse) {
                    onLaravelResponse(data.data);
                } else {
                    onFingerprintData(data);
                }
            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
        };

        return () => {
            ws.close();
        };
    }, [onFingerprintData, onLaravelResponse]);
}
