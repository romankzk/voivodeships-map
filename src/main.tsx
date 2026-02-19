import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppRoot } from '@/AppRoot.tsx';
import { EditorPage } from '@/pages/EditorPage.tsx';
import '@/assets/style.css';

/**
 * Application entry point.
 * Uses HashRouter for compatibility with GitHub Pages base path.
 */
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<AppRoot />} />
                <Route path="/editor" element={<EditorPage />} />
            </Routes>
        </HashRouter>
    </StrictMode>
);
