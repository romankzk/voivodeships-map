import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from '@/AppRoot.tsx';
import '@/assets/style.css';

/**
 * Application entry point.
 * Mounts the React root and renders the app.
 */
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRoot />
    </StrictMode>
);
