import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import '../css/app.css';
import './bootstrap'; // Import bootstrap.ts - initializes Echo with Reverb
import './echo'; // Import echo.js for module exports
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'CFARBEMCO';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-center" richColors swipeDirections={['right']} />
            </>,
        );
    },
    progress: {
        color: '#F8FFE5',
    },
});

// This will set light / dark mode on load...
initializeTheme();
