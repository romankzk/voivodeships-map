import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { Moon, Sun } from 'lucide-react';

/**
 * A map control button that toggles between light and dark theme.
 * Persists the preference to localStorage.
 */
export function ThemeToggleControl() {
    const { map } = useMapContext();
    const container = useLeafletControl(map, 'topright');

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    if (!container) return null;

    return createPortal(
        <button
            className="flex items-center text-sm gap-2 p-3 border-none rounded-lg bg-white text-slate-900 cursor-pointer shadow-lg transition-colors duration-200 hover:bg-slate-900 hover:text-white dark:text-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Світла тема' : 'Темна тема'}
        >
            {darkMode ? 
            <Sun size={20}/>
            :
            <Moon size={20}/>}
        </button>,
        container,
    );
}
