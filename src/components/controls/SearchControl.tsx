import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { useLeafletControl } from '@/hooks/useLeafletControl.ts';
import { useDebounce } from '@/hooks/useDebounce.ts';
import { useMapContext } from '@/context/MapContext.tsx';
import type { SearchResultFeature } from '@/types/index.ts';

/**
 * Provides a search input that queries OpenStreetMap Nominatim for locations within Ukraine.
 * Displays results in a dropdown and places a marker on the selected location.
 */
export function SearchControl() {
    const { map, searchLayer } = useMapContext();
    const container = useLeafletControl(map, 'topright', 'search-control');

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultFeature[]>([]);
    const [showResults, setShowResults] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        let cancelled = false;

        searchOSM(debouncedQuery).then(features => {
            if (cancelled) return;
            setResults(features);
            setShowResults(features.length > 0);
        });

        return () => { cancelled = true; };
    }, [debouncedQuery]);

    const handleSelection = useCallback((feature: SearchResultFeature) => {
        if (!map || !searchLayer) return;

        searchLayer.clearLayers();

        const [lng, lat] = feature.geometry.coordinates;

        const marker = L.marker([lat, lng], {
            icon: new L.Icon({
                iconUrl: './marker-icon.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -24],
            })
        }).bindPopup(`<span class="tooltip-text">${feature.properties.name}</span>`);

        searchLayer.addLayer(marker);
        marker.openPopup();
        map.flyTo([lat, lng], 14);

        setQuery('');
        setShowResults(false);
    }, [map, searchLayer]);

    if (!container) return null;

    return createPortal(
        <div className="search-wrapper">
            <input
                type="text"
                className="search-input"
                placeholder="Шукати на карті..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {showResults && (
                <ul className="search-results" style={{ display: 'block' }}>
                    {results.map((feature, i) => (
                        <li
                            key={i}
                            className="search-item"
                            onClick={() => handleSelection(feature)}
                        >
                            <span className="item-name">{feature.properties.name}</span>
                            <span className="item-meta">{feature.properties.higherDivision}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>,
        container
    );
}

async function searchOSM(query: string): Promise<SearchResultFeature[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ua`;

    try {
        const response = await fetch(url, {
            headers: { 'Accept-Language': 'uk, en' }
        });
        const data = await response.json();

        return data.map((item: { display_name: string; lon: string; lat: string }) => ({
            properties: {
                name: item.display_name.split(',')[0],
                higherDivision: item.display_name.split(',').slice(1, 3).join(','),
                isOSM: true,
            },
            geometry: {
                coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
            },
        }));
    } catch (error) {
        console.error('OSM Search failed:', error);
        return [];
    }
}
