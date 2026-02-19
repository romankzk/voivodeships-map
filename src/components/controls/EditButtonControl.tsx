import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { useOverrideCount } from '@/hooks/useOverrides.ts';

/**
 * A small map control button that navigates to the editor page.
 * Shows a badge when there are active overrides.
 */
export function EditButtonControl() {
    const { map, currentPeriod } = useMapContext();
    const container = useLeafletControl(map, 'topright', 'edit-button-control');
    const overrideCount = useOverrideCount();
    const navigate = useNavigate();

    if (!container) return null;

    return createPortal(
        <button
            className="edit-map-btn"
            onClick={() => navigate(`/editor?period=${currentPeriod}&layer=areas`)}
            title="Редагувати властивості"
        >
            &#9998; Редагувати
            {overrideCount > 0 && (
                <span className="edit-badge">{overrideCount}</span>
            )}
        </button>,
        container,
    );
}
