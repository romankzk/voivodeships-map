import L from 'leaflet';

/**
 * Wrapper around the Leaflet map instance.
 * Handles map initialization, base tile layers, custom panes, and zoom-based label visibility.
 */
export class MapView {
    /**
     * Creates a new map centered on Ukrainian lands.
     * @param {string} containerId - The DOM element ID to render the map into
     */
    constructor(containerId) {
        /** @type {L.Map} The underlying Leaflet map instance */
        this.instance = L.map(containerId, {
            center: [48.88, 30.81],
            zoom: 6,
            zoomControl: false
        });

        this.#initBaseLayers();
        this.#initPanes();
        this.#setupGlobalListeners();
    }

    /**
     * Adds the OpenStreetMap base tile layer to the map.
     */
    #initBaseLayers() {
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        osm.addTo(this.instance);
    }

    /**
     * Creates custom rendering panes with specific z-index ordering.
     * Panes ensure regions render below borders, and borders below city markers.
     */
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

    /**
     * Sets up zoom-dependent label visibility and repositions the zoom control.
     * Level 2 city labels appear at zoom >= 7, level 3 at zoom >= 8.
     */
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

    /**
     * Returns a custom pane by its ID.
     * @param {string} paneId - The pane identifier (e.g. 'regionsPane', 'bordersPane', 'citiesPane')
     * @returns {HTMLElement} The pane DOM element
     */
    getPane(paneId) {
        return this.instance.getPane(paneId);
    }

    /**
     * Returns the underlying Leaflet map instance.
     * @returns {L.Map}
     */
    getLeafletInstance() {
        return this.instance;
    }
}
