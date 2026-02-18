import { useEffect, useRef, type RefObject } from 'react';
import L from 'leaflet';

const LEVEL2_ZOOM = 7;
const LEVEL3_ZOOM = 8;

/**
 * Initializes a Leaflet map on the given container ref.
 * Sets up tile layer, custom panes, zoom-based label visibility, and zoom control.
 */
export function useMap(containerRef: RefObject<HTMLDivElement | null>): L.Map | null {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [48.88, 30.81],
            zoom: 6,
            zoomControl: false
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Custom panes with z-index ordering: regions < borders < cities
        const panes: Array<[string, number]> = [
            ['regionsPane', 450],
            ['bordersPane', 550],
            ['citiesPane', 620],
        ];

        for (const [name, zIndex] of panes) {
            map.createPane(name);
            const pane = map.getPane(name)!;
            pane.style.zIndex = String(zIndex);
            pane.style.pointerEvents = 'none';
        }

        // Zoom-dependent label visibility
        map.on('zoomend', () => {
            const zoom = map.getZoom();

            document.querySelectorAll<HTMLElement>('.level2-city-label').forEach(el => {
                el.style.opacity = zoom < LEVEL2_ZOOM ? '0' : '1';
            });

            document.querySelectorAll<HTMLElement>('.level3-city-label').forEach(el => {
                el.style.opacity = zoom < LEVEL3_ZOOM ? '0' : '1';
            });
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [containerRef]);

    return mapRef.current;
}
