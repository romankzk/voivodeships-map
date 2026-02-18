import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { STYLES, DIVISION_COLOR_MAP } from '@/utils/constants.ts';
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
 */
export function RegionsLayer({ map, data, layerGroup, onHover, onHoverEnd }: RegionsLayerProps) {
    const layerRef = useRef<L.GeoJSON | null>(null);

    useEffect(() => {
        const geoJsonLayer = L.geoJson(data, {
            pane: 'regionsPane',
            style: (feature) => ({
                ...STYLES.BaseFeatureStyle,
                fillColor: DIVISION_COLOR_MAP[feature!.properties.higherDivision] ?? STYLES.FeatureFillColors.Default,
            }),
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => {
                        const target = e.target as L.Path;
                        target.setStyle(STYLES.HoverFeatureStyle);
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
        };
    }, [map, data, layerGroup, onHover, onHoverEnd]);

    return null;
}
