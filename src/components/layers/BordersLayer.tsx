import { useEffect } from 'react';
import L from 'leaflet';
import { STYLES } from '@/utils/constants.ts';

interface BordersLayerProps {
    map: L.Map;
    data: GeoJSON.FeatureCollection;
    layerGroup: L.LayerGroup;
}

/**
 * Renderless component that manages border line layers on the map.
 */
export function BordersLayer({ map, data, layerGroup }: BordersLayerProps) {
    useEffect(() => {
        const geoJsonLayer = L.geoJson(data, {
            pane: 'bordersPane',
            style: () => STYLES.BaseBorderStyle,
        });

        layerGroup.addLayer(geoJsonLayer);

        return () => {
            layerGroup.removeLayer(geoJsonLayer);
        };
    }, [map, data, layerGroup]);

    return null;
}
