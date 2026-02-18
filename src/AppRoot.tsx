import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useMap } from '@/hooks/useMap.ts';
import { usePeriodData } from '@/hooks/usePeriodData.ts';
import { MapProvider } from '@/context/MapContext.tsx';
import { TIME_PERIODS } from '@/utils/constants.ts';
import type { AreaFeatureProperties, MapContextValue } from '@/types/index.ts';

import { RegionsLayer } from '@/components/layers/RegionsLayer.tsx';
import { BordersLayer } from '@/components/layers/BordersLayer.tsx';
import { CitiesLayer } from '@/components/layers/CitiesLayer.tsx';

import { InfoControl } from '@/components/controls/InfoControl.tsx';
import { TitleControl } from '@/components/controls/TitleControl.tsx';
import { TimelineControl } from '@/components/controls/TimelineControl.tsx';
import { SearchControl } from '@/components/controls/SearchControl.tsx';

const filterPrimary = (f: GeoJSON.Feature) => f.properties!.adminLevel !== 3;
const filterSecondary = (f: GeoJSON.Feature) => f.properties!.adminLevel === 3;

/**
 * Root React component.
 * Manages map state, data fetching, and renders all layers and controls.
 */
export function AppRoot() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);

    const [currentPeriod, setCurrentPeriod] = useState(TIME_PERIODS.PERIOD_1640.id);
    const { data, isLoading } = usePeriodData(currentPeriod);

    const [hoveredRegion, setHoveredRegion] = useState<AreaFeatureProperties | null>(null);

    const [searchLayer] = useState(() => L.layerGroup());
    const [dataGroup] = useState(() => L.layerGroup());

    // Add layer groups to map once
    useEffect(() => {
        if (!map) return;
        dataGroup.addTo(map);
        searchLayer.addTo(map);

        return () => {
            dataGroup.remove();
            searchLayer.remove();
        };
    }, [map, dataGroup, searchLayer]);

    // Clear data layers when new data arrives (period switch)
    useEffect(() => {
        dataGroup.clearLayers();
    }, [data, dataGroup]);

    const handleHover = useCallback((props: AreaFeatureProperties) => {
        setHoveredRegion(props);
    }, []);

    const handleHoverEnd = useCallback(() => {
        setHoveredRegion(null);
    }, []);

    const contextValue = useMemo<MapContextValue>(() => ({
        map,
        currentPeriod,
        setCurrentPeriod,
        isLoading,
        hoveredRegion,
        setHoveredRegion,
        searchLayer,
    }), [map, currentPeriod, isLoading, hoveredRegion, searchLayer]);

    return (
        <MapProvider value={contextValue}>
            <div id="map" ref={mapContainerRef} />
            <LoadingOverlay isLoading={isLoading} />

            {map && data && (
                <>
                    <RegionsLayer
                        map={map}
                        data={data.areas}
                        layerGroup={dataGroup}
                        onHover={handleHover}
                        onHoverEnd={handleHoverEnd}
                    />
                    <BordersLayer
                        map={map}
                        data={data.borders}
                        layerGroup={dataGroup}
                    />
                    <CitiesLayer
                        map={map}
                        data={data.points}
                        layerGroup={dataGroup}
                        filterFn={filterPrimary}
                    />
                    <CitiesLayer
                        map={map}
                        data={data.points}
                        layerGroup={dataGroup}
                        filterFn={filterSecondary}
                    />
                </>
            )}

            <TimelineControl />
            <TitleControl />
            <InfoControl />
            <SearchControl />
        </MapProvider>
    );
}

function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
    return (
        <div className={`map-loading-overlay ${isLoading ? 'visible' : ''}`}>
            <svg className="loading-spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round" />
            </svg>
        </div>
    );
}
