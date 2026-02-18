import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { MapView } from './components/MapView.js';
import { RegionsLayer, BordersLayer, CitiesLayer } from './components/LayerFactory.js';
import { InfoControl, TitleControl, TimelineControl, SearchControl } from './components/ControlFactory.js';
import { TIME_PERIODS } from './utils/constants.js';

/**
 * Main application orchestrator.
 * Manages the map instance, UI controls, data layers, and user interactions.
 */
export class App {
    constructor() {
        /** @type {MapView} */
        this.map = new MapView('map');

        /** @type {L.LayerGroup} Layer group for period-specific data (regions, borders, cities) */
        this.dataGroup = L.layerGroup().addTo(this.map.instance);

        /** @type {L.LayerGroup} Layer group for search result markers */
        this.searchLayer = L.layerGroup().addTo(this.map.instance);

        /** @type {HTMLElement} Loading overlay element */
        this.spinner = this.#createSpinner();

        this.titleControl = new TitleControl();
        this.infoControl = new InfoControl();
        this.searchControl = new SearchControl({
            onLocationSelect: (feature) => this.handleSearchResult(feature)
        });
        this.init();
    }

    /**
     * Creates an SVG loading spinner overlay and appends it to the map container.
     * @returns {HTMLElement} The spinner overlay element
     */
    #createSpinner() {
        const overlay = document.createElement('div');
        overlay.className = 'map-loading-overlay';
        overlay.innerHTML = `
            <svg class="loading-spinner" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round" />
            </svg>`;
        document.getElementById('map').appendChild(overlay);
        return overlay;
    }

    /**
     * Toggles the loading state across the spinner overlay and timeline buttons.
     * @param {boolean} isLoading - Whether the app is currently loading data
     */
    #setLoading(isLoading) {
        this.spinner.classList.toggle('visible', isLoading);
        this.timelineControl.setLoading(isLoading);
    }

    /**
     * Initializes all UI controls and loads the default time period.
     */
    init() {
        this.timelineControl = new TimelineControl({
            onPeriodChange: (periodId) => this.switchPeriod(periodId)
        });
        this.timelineControl.addTo(this.map.instance);

        // Initialize UI
        this.titleControl.addTo(this.map.instance);
        this.infoControl.addTo(this.map.instance);
        this.searchControl.addTo(this.map.instance);

        // Set period by default
        this.switchPeriod(TIME_PERIODS.PERIOD_1640.id);
    }

    /**
     * Switches the displayed time period by fetching new GeoJSON data and recreating all map layers.
     * @param {string} periodId - The ID of the period to switch to (e.g. "1640", "1760")
     */
    async switchPeriod(periodId) {
        // 1. Clean up existing layers
        this.dataGroup.clearLayers();
        this.infoControl.update(null);
        this.timelineControl.currentPeriod = periodId;
        this.#setLoading(true);

        // 2. Fetch new data based on period
        const periodConfig = Object.values(TIME_PERIODS).find(p => p.id === periodId);
        let areasData, bordersData, pointsData;

        try {
            [areasData, bordersData, pointsData] = await Promise.all([
                fetch(`./data/${periodConfig.areasFile}.geojson`).then(r => r.json()),
                fetch(`./data/${periodConfig.bordersFile}.geojson`).then(r => r.json()),
                fetch(`./data/${periodConfig.pointsFile}.geojson`).then(r => r.json()),
            ]);
        } catch (error) {
            console.error("Failed to load geojson files:", error);
            this.#setLoading(false);
            return;
        }

        // Create layers
        const regionsLayer = new RegionsLayer(areasData, {
            onMouseOver: (props) => this.infoControl.update(props),
            onMouseOut: () => this.infoControl.update()
        });

        const bordersLayer = new BordersLayer(bordersData);

        const primaryCitiesLayer = new CitiesLayer(pointsData);
        primaryCitiesLayer.setFilter = (f) => f.properties.adminLevel != 3;

        const secondaryCitiesLayer = new CitiesLayer(pointsData);
        secondaryCitiesLayer.setFilter = (f) => f.properties.adminLevel == 3;

        // Initialize layers
        const regionsLayerInstance = regionsLayer.init(this.map.instance, this.map.getPane('regionsPane'));
        const bordersLayerInstance = bordersLayer.init(this.map.instance, this.map.getPane('bordersPane'));
        const primaryCitiesLayerInstance = primaryCitiesLayer.init(this.map.instance, this.map.getPane('citiesPane'));
        const secondaryCitiesLayerInstance = secondaryCitiesLayer.init(this.map.instance, this.map.getPane('citiesPane'));

        this.dataGroup.addLayer(regionsLayerInstance);
        this.dataGroup.addLayer(bordersLayerInstance);
        this.dataGroup.addLayer(primaryCitiesLayerInstance);
        this.dataGroup.addLayer(secondaryCitiesLayerInstance);

        this.#setLoading(false);
    }

    /**
     * Handles a search result selection by placing a marker on the map and flying to its location.
     * @param {object} feature - GeoJSON-like feature with geometry.coordinates and properties.name
     */
    handleSearchResult(feature) {
        this.searchLayer.clearLayers();

        const [lng, lat] = feature.geometry.coordinates;

        const marker = L.marker([lat, lng],
            {
                icon: new L.Icon({
                    iconUrl: './marker-icon.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -24],
                })
            }
        )
            .bindPopup(`<span class="tooltip-text">${feature.properties.name}</span>`);

        this.searchLayer.addLayer(marker);
        marker.openPopup();

        this.map.instance.flyTo([lat, lng], 14);
    }
}
