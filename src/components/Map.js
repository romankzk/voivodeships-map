import L from 'leaflet';

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
        this.instance.createPane('bordersPane');
        this.instance.getPane('bordersPane').style.zIndex = 450;
        this.instance.getPane('bordersPane').style.pointerEvents = 'none';

        this.instance.createPane('citiesPane');
        this.instance.getPane('citiesPane').style.zIndex = 600;
    }

    #setupGlobalListeners() {
        this.instance.on('zoomend', () => {
            const zoom = this.instance.getZoom();
            const opacity = zoom < 8 ? 0 : 1;

            // Targeted update for specific label classes
            document.querySelectorAll('.level3-city-label').forEach(el => {
                el.style.opacity = opacity;
            });
        });

        // Add standard zoom control to a specific corner
        L.control.zoom({ position: 'bottomright' }).addTo(this.instance);
    }

    getLeafletInstance() {
        return this.instance;
    }
}