import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Map } from './components/Map.js';
import { RegionsLayer, BordersLayer, CitiesLayer } from './components/LayerFactory.js';
import { InfoControl, TitleControl, TimelineControl, SearchControl } from './components/ControlFactory.js';
import { TIME_PERIODS } from './utils/constants.js';

export class App {
    constructor() {
        this.map = new Map('map');
        this.dataGroup = L.layerGroup().addTo(this.map.instance);
        this.searchLayer = L.layerGroup().addTo(this.map.instance);

        this.titleControl = new TitleControl();
        this.infoControl = new InfoControl();
        this.searchControl = new SearchControl({
            onLocationSelect: (feature) => this.handleSearchResult(feature)
        });
        this.init();
    }

    async init() {
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

    async switchPeriod(periodId) {
        // 1. Clean up existing layers
        this.dataGroup.clearLayers();

        this.infoControl.update(null);

        // 2. Fetch new data based on period
        const periodConfig = Object.values(TIME_PERIODS).find(p => p.id === periodId);
        const areasData = await (await fetch(`./data/${periodConfig.areasFile}.geojson`)).json();
        const bordersData = await (await fetch(`./data/${periodConfig.bordersFile}.geojson`)).json();
        const pointsData = await (await fetch(`./data/${periodConfig.pointsFile}.geojson`)).json();

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
        const bordersLayerInstance = bordersLayer.init(this.map.instance, this.map.getPane('regionsPane'));
        const primaryCitiesLayerInstance = primaryCitiesLayer.init(this.map.instance, this.map.getPane('citiesPane'));
        const secondaryCitiesLayerInstance = secondaryCitiesLayer.init(this.map.instance, this.map.getPane('citiesPane'));

        this.dataGroup.addLayer(regionsLayerInstance);
        this.dataGroup.addLayer(bordersLayerInstance);
        this.dataGroup.addLayer(primaryCitiesLayerInstance);
        this.dataGroup.addLayer(secondaryCitiesLayerInstance);
    }

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