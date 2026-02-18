import { createPortal } from 'react-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { TIME_PERIODS } from '@/utils/constants.ts';

/**
 * Provides buttons for switching between historical time periods.
 * Disables buttons during data loading.
 */
export function TimelineControl() {
    const { map, currentPeriod, setCurrentPeriod, isLoading } = useMapContext();
    const container = useLeafletControl(map, 'topright', 'timeline-control');

    if (!container) return null;

    return createPortal(
        <>
            {Object.values(TIME_PERIODS).map(period => (
                <button
                    key={period.id}
                    className={`period-btn ${period.id === currentPeriod ? 'active' : ''}`}
                    disabled={isLoading}
                    onClick={() => setCurrentPeriod(period.id)}
                >
                    {period.label}
                </button>
            ))}
        </>,
        container
    );
}
