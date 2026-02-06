import L from 'leaflet';

/**
 * Class for map initialization
 */
export class Map {
    constructor(containerId) {
        this.instance = L.map(containerId, {
            center: [48.88, 30.81],
            zoom: 6,
            zoomControl: false
        });

        this.#initBaseLayers();
        this.#initPanes();
        this.#setupGlobalListeners();
    }

    #initBaseLayers() {
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        osm.addTo(this.instance);
    }

    #initPanes() {
        this.instance.createPane('regionsPane');
        this.instance.getPane('regionsPane').style.zIndex = 450;
        this.instance.getPane('regionsPane').style.pointerEvents = 'none';

        this.instance.createPane('bordersPane');
        this.instance.getPane('bordersPane').style.zIndex = 550;
        this.instance.getPane('bordersPane').style.pointerEvents = 'none';

        this.instance.createPane('citiesPane');
        this.instance.getPane('citiesPane').style.zIndex = 620;
        this.instance.getPane('citiesPane').style.pointerEvents = 'none';
    }

    #setupGlobalListeners() {
        this.instance.on('zoomend', () => {
            const zoom = this.instance.getZoom();
            const level2Zoom = 7;
            const level3Zoom = 8;

            const level2Opacity = zoom < level2Zoom ? 0 : 1;
            const level3Opacity = zoom < level3Zoom ? 0 : 1;

            // Targeted update for specific label classes
            document.querySelectorAll('.level2-city-label').forEach(el => {
                el.style.opacity = level2Opacity;
            });

            // Targeted update for specific label classes
            document.querySelectorAll('.level3-city-label').forEach(el => {
                el.style.opacity = level3Opacity;
            });
        });

        // Add standard zoom control to a specific corner
        L.control.zoom({ position: 'bottomright' }).addTo(this.instance);
    }

    getPane(paneId) {
        return this.instance.getPane(paneId);
    }

    getLeafletInstance() {
        return this.instance;
    }
}