import L from 'leaflet';
import { COUNTIES_NAME_MAP, KINGDOM_NAME_MAP, STYLES } from '@/utils/constants.js';

/**
 * Abstract base class for all GeoJSON overlay layers.
 * Provides a common lifecycle for creating Leaflet GeoJSON layers with
 * customizable styling, filtering, point rendering, and event handling.
 * Subclasses override hook methods to specialize behavior.
 */
class OverlayLayer {
    /**
     * @param {object} data - GeoJSON FeatureCollection
     * @param {object} [options={}] - Layer options
     * @param {Function} [options.onMouseOver] - Callback invoked with feature properties on hover
     * @param {Function} [options.onMouseOut] - Callback invoked when hover ends
     */
    constructor(data, options = {}) {
        /** @type {object} GeoJSON data for this layer */
        this.data = data;

        /** @type {Function|undefined} Mouse over callback */
        this.handleMouseOver = options.onMouseOver;

        /** @type {Function|undefined} Mouse out callback */
        this.handleMouseOut = options.onMouseOut;

        /** @type {L.GeoJSON|null} The Leaflet GeoJSON layer instance */
        this.instance = null;
    }

    /**
     * Creates the Leaflet GeoJSON layer, adds it to the map, and returns the instance.
     * @param {L.Map} mapInstance - The Leaflet map instance
     * @param {HTMLElement} pane - The custom pane to render into
     * @returns {L.GeoJSON} The created Leaflet GeoJSON layer
     */
    init(mapInstance, pane) {
        const options = {
            pane: pane,
            style: (f) => this.setStyle(f),
            filter: (f) => this.setFilter(f),
            onEachFeature: (f, l) => this._bindEvents(f, l),
            pointToLayer: (f, c) => this.setPointToLayer(f, c)
        };

        this.instance = L.geoJson(this.data, options);
        this.instance.addTo(mapInstance);
        return this.instance;
    }

    /**
     * Binds mouse and click events to each feature's layer.
     * @param {object} feature - The GeoJSON feature
     * @param {L.Layer} layer - The Leaflet layer for this feature
     */
    _bindEvents(feature, layer) {
        layer.on({
            mouseover: (e) => {
                this.onFeatureMouseOver(e);
                if (this.handleMouseOver) this.handleMouseOver(feature.properties);
            },
            mouseout: (e) => {
                this.onFeatureMouseOut(e);
                if (this.handleMouseOut) this.handleMouseOut();
            },
            click: (e) => this.onFeatureClick(e),
        })

        this.onEachFeature(feature, layer);
    }

    /**
     * Returns the style object for a feature. Override in subclasses.
     * @param {object} [feature] - The GeoJSON feature
     * @returns {object} Leaflet path style options
     */
    setStyle() { return {}; }

    /**
     * Determines whether a feature should be included. Override in subclasses.
     * @param {object} [feature] - The GeoJSON feature
     * @returns {boolean} True to include the feature
     */
    setFilter() { return true; }

    /**
     * Creates a Leaflet layer for a Point feature. Override in subclasses.
     * @param {object} feature - The GeoJSON feature
     * @param {L.LatLng} coords - The point coordinates
     * @returns {L.Layer} The layer to represent this point
     */
    setPointToLayer(feature, coords) { return L.marker(coords); }

    /**
     * Hook called for each feature after event binding. Override for custom per-feature logic.
     * @param {object} feature - The GeoJSON feature
     * @param {L.Layer} layer - The Leaflet layer
     */
    onEachFeature() { }

    /**
     * Hook called on feature mouse over. Override for hover effects.
     * @param {L.LeafletEvent} e - The Leaflet event
     */
    onFeatureMouseOver() { }

    /**
     * Hook called on feature mouse out. Override to reset hover effects.
     * @param {L.LeafletEvent} e - The Leaflet event
     */
    onFeatureMouseOut() { }

    /**
     * Default click handler that zooms the map to the feature's bounds.
     * @param {L.LeafletEvent} e - The Leaflet event
     */
    onFeatureClick(e) {
        const layer = e.target;
        layer._map.fitBounds(layer.getBounds());
    }
}

/**
 * Layer for rendering administrative region polygons with color-coded fills.
 * Provides hover highlighting and click-to-zoom behavior.
 * @extends OverlayLayer
 */
export class RegionsLayer extends OverlayLayer {
    /**
     * Returns the style for a region feature with its division-specific fill color.
     * @param {object} feature - The GeoJSON feature
     * @returns {object} Leaflet path style options
     */
    setStyle(feature) {
        return {
            ...STYLES.BaseFeatureStyle,
            fillColor: this.getFeatureColor(feature.properties.higherDivision),
        };
    }

    /**
     * Maps an administrative division name to its display color.
     * @param {string} division - The higher division name (Ukrainian)
     * @returns {string} CSS color string
     */
    getFeatureColor(division) {
        const mapping = {
            [COUNTIES_NAME_MAP.Kyiv]: STYLES.FeatureFillColors.Cyan,
            [COUNTIES_NAME_MAP.Rus]: STYLES.FeatureFillColors.Blue,
            [COUNTIES_NAME_MAP.Volyn]: STYLES.FeatureFillColors.Purple,
            [COUNTIES_NAME_MAP.Chernihiv]: STYLES.FeatureFillColors.DarkPurple,
            [COUNTIES_NAME_MAP.Belz]: STYLES.FeatureFillColors.Crimson,
            [COUNTIES_NAME_MAP.Podil]: STYLES.FeatureFillColors.Olive,
            [COUNTIES_NAME_MAP.Bratslav]: STYLES.FeatureFillColors.Pink,
            [COUNTIES_NAME_MAP.Brest]: STYLES.FeatureFillColors.Gold,
            [KINGDOM_NAME_MAP.Moldavia]: STYLES.FeatureFillColors.OrangeRed,
            [KINGDOM_NAME_MAP.Hungary]: STYLES.FeatureFillColors.Green,
            [KINGDOM_NAME_MAP.Transylvania]: STYLES.FeatureFillColors.Gold,
            [KINGDOM_NAME_MAP.Turkey]: STYLES.FeatureFillColors.DarkPurple,
            [COUNTIES_NAME_MAP.Hetmanate]: STYLES.FeatureFillColors.DarkPurple,
            [COUNTIES_NAME_MAP.Zaporizhzhia]: STYLES.FeatureFillColors.Gold,
            [COUNTIES_NAME_MAP.Slobozhanshchyna]: STYLES.FeatureFillColors.Blue,
        };

        return mapping[division] || STYLES.FeatureFillColors.Default;
    }

    /**
     * Applies the hover style and brings the region to front.
     * @param {L.LeafletEvent} e - The Leaflet mouse event
     */
    onFeatureMouseOver(e) {
        const layer = e.target;

        layer.setStyle(STYLES.HoverFeatureStyle);
        layer.bringToFront();
    }

    /**
     * Resets the region to its default style after hover ends.
     * @param {L.LeafletEvent} e - The Leaflet mouse event
     */
    onFeatureMouseOut(e) {
        this.instance.resetStyle(e.target);
    }
}

/**
 * Layer for rendering kingdom/empire border lines.
 * @extends OverlayLayer
 */
export class BordersLayer extends OverlayLayer {
    /**
     * Returns the base border line style.
     * @param {object} feature - The GeoJSON feature
     * @returns {object} Leaflet path style options
     */
    setStyle(feature) {
        return STYLES.BaseBorderStyle;
    }
}

/**
 * Layer for rendering city point markers with permanent name labels.
 * Marker size and label styling vary by administrative level (1, 2, or 3).
 * Level 2 and 3 labels are initially hidden and revealed at higher zoom levels.
 * @extends OverlayLayer
 */
export class CitiesLayer extends OverlayLayer {
    /**
     * Creates a circle marker with a permanent tooltip label styled by admin level.
     * @param {object} feature - The GeoJSON feature with properties.adminLevel
     * @param {L.LatLng} coords - The point coordinates
     * @returns {L.CircleMarker} The styled circle marker with bound tooltip
     */
    setPointToLayer(feature, coords) {
        let markerStyle = STYLES.BaseMarkerStyle;
        let labelClass = "";

        if (feature.properties.adminLevel == 1) {
            labelClass = "level1-city-label";
            markerStyle.radius = 8;
            markerStyle.fillColor = STYLES.MarkerFillColors.LEVEL1;
        }
        else if (feature.properties.adminLevel == 2) {
            labelClass = "level2-city-label";
            markerStyle.radius = 4;
            markerStyle.fillColor = STYLES.MarkerFillColors.LEVEL2;
        }
        else if (feature.properties.adminLevel == 3) {
            labelClass = "level3-city-label";
            markerStyle.radius = 3;
            markerStyle.fillColor = STYLES.MarkerFillColors.LEVEL3;
        }

        return L.circleMarker(coords, {
            ...markerStyle,
            pane: 'citiesPane'
        })
            .bindTooltip(feature.properties.name, {
                permanent: true,
                className: labelClass,
            });
    }

    /**
     * Initializes the layer and hides level 2 and 3 city labels (shown on zoom).
     * @param {L.Map} mapInstance - The Leaflet map instance
     * @param {HTMLElement} pane - The custom pane to render into
     * @returns {L.GeoJSON} The created Leaflet GeoJSON layer
     */
    init(mapInstance, pane) {
        const instance = super.init(mapInstance, pane);

        // Hide secondary cities labels
        document.querySelectorAll('.level3-city-label').forEach(el => {
            el.style.opacity = 0;
        });

        // Hide secondary cities labels
        document.querySelectorAll('.level2-city-label').forEach(el => {
            el.style.opacity = 0;
        });

        return instance;
    }
}
