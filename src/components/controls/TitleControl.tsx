import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import { SOURCES } from '@/utils/constants.ts';

/**
 * Displays the map title, disclaimer, legend, and a collapsible list of academic sources.
 */
export function TitleControl() {
    const { map } = useMapContext();
    const container = useLeafletControl(map, 'topleft', 'title-control');
    const [sourcesHidden, setSourcesHidden] = useState(true);
    const [bodyExpanded, setBodyExpanded] = useState(false);

    if (!container) return null;

    return createPortal(
        <>
            <h1>
                <img src="map-logo.svg" alt="Map logo" width="24" height="24" />
                <span>Українські землі у XVII-XVIII ст.</span>
            </h1>
            <button
                className="title-toggle-btn"
                onClick={() => setBodyExpanded(!bodyExpanded)}
            >
                {bodyExpanded ? 'згорнути' : 'детальніше...'}
            </button>
            <div className={`title-body ${bodyExpanded ? 'expanded' : ''}`}>
                <p>
                    Дана карта є лише гіпотетичною реконструкцією на основі аналізу доступних архівних джерел.
                    <br />
                    Якщо помітили помилку або маєте що додати, повідомте про це автора.
                </p>
                <h2>Умовні позначення</h2>
                <div className="legend-item">
                    <span className="legend-circle level-1-circle"></span>
                    <span className="legend-text">Центри воєводств, комітатів, цинутів</span>
                </div>
                <div className="legend-item">
                    <span className="legend-circle level-2-circle"></span>
                    <span className="legend-text">Центри повітів, полків</span>
                </div>
                <div className="legend-item">
                    <span className="legend-circle level-3-circle"></span>
                    <span className="legend-text">Центри староств</span>
                </div>
                <h2>Джерела</h2>
                <p>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setSourcesHidden(!sourcesHidden);
                        }}
                    >
                        {sourcesHidden ? 'показати' : 'сховати'}
                    </a>
                </p>
                <ol className={sourcesHidden ? 'hidden' : ''} id="sources">
                    {SOURCES.map((source, i) => (
                        <li key={i}>
                            <a target="_blank" rel="noopener noreferrer" href={source.link}>
                                {source.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
        </>,
        container
    );
}
