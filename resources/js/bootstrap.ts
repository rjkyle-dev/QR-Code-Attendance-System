/**
 * Bootstrap file - Initializes Echo with Laravel Reverb
 * This file sets up the Echo instance for real-time broadcasting
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Add type declaration for global Pusher and Echo
declare global {
    interface Window {
        Echo: any;
        Pusher: typeof Pusher;
    }
}

// Make Pusher available globally (required for Echo to work with Reverb)
// Reverb uses the Pusher protocol, so we need pusher-js library
window.Pusher = Pusher;

// Get CSRF token for authentication
const getCSRFToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.warn('[Echo Config] CSRF token not found, broadcasting authentication may fail');
    }
    return token || '';
};

// Determine host configuration
const configuredHost = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const reverbPort = import.meta.env.VITE_REVERB_PORT || 8080;
const isLocalhost =
    configuredHost === 'localhost' || configuredHost === '127.0.0.1' || configuredHost.startsWith('192.168.') || configuredHost.startsWith('10.0.');

const reverbHost = isLocalhost ? '127.0.0.1' : configuredHost;

// Configure Echo with Laravel Reverb (NOT Pusher service)
// Initialize Echo with Reverb configuration
window.Echo = new Echo({
    broadcaster: 'reverb', // Using Reverb, not Pusher service
    key: import.meta.env.VITE_REVERB_APP_KEY || 'your-reverb-key',
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: !isLocalhost,
    enabledTransports: isLocalhost ? ['ws'] : ['ws', 'wss'],
    disableStats: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
        },
    },
});
