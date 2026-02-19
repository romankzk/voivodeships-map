import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { STYLES, DIVISION_COLOR_MAP } from '@/utils/constants.ts';
import { useDarkMode } from '@/hooks/useDarkMode.ts';
import type { AreaFeatureProperties } from '@/types/index.ts';

interface RegionsLayerProps {
    map: L.Map;
    data: GeoJSON.FeatureCollection;
    layerGroup: L.LayerGroup;
    onHover: (props: AreaFeatureProperties) => void;
    onHoverEnd: () => void;
}

/**
 * Renderless component that manages region polygon layers on the map.
 * Applies color-coded fills by division, hover highlighting, and click-to-zoom.
 * Reactively updates stroke/fill styles when dark mode toggles.
 */
export function RegionsLayer({ map, data, layerGroup, onHover, onHoverEnd }: RegionsLayerProps) {
    const layerRef = useRef<L.GeoJSON | null>(null);
    const isDark = useDarkMode();
    const isDarkRef = useRef(isDark);
    isDarkRef.current = isDark;

    useEffect(() => {
        const geoJsonLayer = L.geoJson(data, {
            pane: 'regionsPane',
            style: (feature) => ({
                ...(isDarkRef.current ? STYLES.DarkFeatureStyle : STYLES.BaseFeatureStyle),
                fillColor: DIVISION_COLOR_MAP[feature?.properties?.higherDivision] ?? STYLES.FeatureFillColors.Default,
            }),
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => {
                        const target = e.target as L.Path;
                        target.setStyle(isDarkRef.current ? STYLES.DarkHoverFeatureStyle : STYLES.HoverFeatureStyle);
                        target.bringToFront();
                        onHover(feature.properties as AreaFeatureProperties);
                    },
                    mouseout: (e) => {
                        geoJsonLayer.resetStyle(e.target as L.Path);
                        onHoverEnd();
                    },
                    click: (e) => {
                        const target = e.target as L.Polygon;
                        map.fitBounds(target.getBounds());
                    },
                });
            },
        });

        layerRef.current = geoJsonLayer;
        layerGroup.addLayer(geoJsonLayer);

        return () => {
            layerGroup.removeLayer(geoJsonLayer);
            layerRef.current = null;
        };
    }, [map, data, layerGroup, onHover, onHoverEnd]);

    // Restyle when theme changes (without recreating the layer)
    useEffect(() => {
        if (!layerRef.current) return;
        layerRef.current.setStyle((feature) => ({
            ...(isDark ? STYLES.DarkFeatureStyle : STYLES.BaseFeatureStyle),
            fillColor: DIVISION_COLOR_MAP[feature?.properties?.higherDivision] ?? STYLES.FeatureFillColors.Default,
        }));
    }, [isDark]);

    return null;
}
