import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { useOverrideCount } from '@/hooks/useOverrides.ts';
import { Pencil } from 'lucide-react';

/**
 * A small map control button that navigates to the editor page.
 * Shows a badge when there are active overrides.
 */
export function EditButtonControl() {
    const { map, currentPeriod } = useMapContext();
    const container = useLeafletControl(map, 'topright');
    const overrideCount = useOverrideCount();
    const navigate = useNavigate();

    if (!container) return null;

    return createPortal(
        <button
            className="flex items-center text-sm gap-2 p-3 border-none rounded-lg bg-white text-slate-900 cursor-pointer shadow-lg transition-colors duration-200 hover:bg-slate-900 hover:text-white dark:text-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
            onClick={() => navigate(`/editor?period=${currentPeriod}&layer=areas`)}
            title="Редагувати метадані"
        >
            <Pencil size={16} /> Редагувати
            {overrideCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-px rounded-full min-w-4 text-center">{overrideCount}</span>
            )}
        </button>,
        container,
    );
}
