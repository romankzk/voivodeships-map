import L from 'leaflet';
import { STYLES } from '../utils/constants';

/**
 * Base class for all layers
 * @class
 */
class OverlayLayer {
    constructor(data, options = {}) {
        this.data = data;
        this.handleMouseOver = options.onMouseOver;
        this.handleMouseOut = options.onMouseOut;
        this.instance = null;
    }

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

    setStyle() { return {}; }
    setFilter() { return true; }
    setPointToLayer(feature, coords) { return L.marker(coords); }
    onEachFeature() { }
    onFeatureMouseOver() { }
    onFeatureMouseOut() { }
    onFeatureClick(e) {
        const layer = e.target;
        layer._map.fitBounds(layer.getBounds());
    }
}

/**
 * Class for regions layers
 * @extends OverlayLayer
 */
export class RegionsLayer extends OverlayLayer {
    setStyle(feature) {
        return {
            ...STYLES.BaseFeatureStyle,
            fillColor: this.getFeatureColor(feature.properties.higherDivision),
        };
    }

    getFeatureColor(division) {
        const mapping = {
            "Київське воєводство": STYLES.FeatureFillColors.KIJOWSKIE,
            "Київське воєводство (до 1667)": STYLES.FeatureFillColors.KIJOWSKIE_1667,
            "Руське воєводство": STYLES.FeatureFillColors.RUSKIE,
            "Волинське воєводство": STYLES.FeatureFillColors.WOLYNSKIE,
            "Чернігівське воєводство": STYLES.FeatureFillColors.CZERNIHOWSKIE,
            "Белзьке воєводство": STYLES.FeatureFillColors.BELZKIE,
            "Подільське воєводство": STYLES.FeatureFillColors.PODOLSKIE,
            "Брацлавське воєводство": STYLES.FeatureFillColors.BRACLAWSKIE,
            "Берестейське воєводство": STYLES.FeatureFillColors.BRZESKOLITEWSKIE
        };

        return mapping[division] || STYLES.FeatureFillColors.DEFAULT;
    }

    onFeatureMouseOver(e) {
        const layer = e.target;

        layer.setStyle(STYLES.HoverFeatureStyle);
        layer.bringToFront();
    }

    onFeatureMouseOut(e) {
        this.instance.resetStyle(e.target);
    }
}

/**
 * Class for borders layers
 * @extends OverlayLayer
 */
export class BordersLayer extends OverlayLayer {
    setStyle(feature) {
        return STYLES.BaseBorderStyle;
    }
}

/**
 * Class for cities layers
 * @extends OverlayLayer
 */
export class CitiesLayer extends OverlayLayer {
    setPointToLayer(feature, coords) {
        let markerStyle = STYLES.BaseMarkerStyle;
        let labelClass = "";

        if (feature.properties.type == "wojewodztwo") {
            labelClass = "level1-city-label";
            markerStyle.radius = 8;
            markerStyle.fillColor = STYLES.MarkerFillColors.LEVEL1;
        }
        else if (feature.properties.type == "powiat") {
            labelClass = "level2-city-label";
            markerStyle.radius = 4;
            markerStyle.fillColor = STYLES.MarkerFillColors.LEVEL2;
        }
        else if (feature.properties.type == "starostwo") {
            labelClass = "level3-city-label";
            markerStyle.radius = 3;
            markerStyle.fillColor = STYLES.MarkerFillColors.LEVEL3;
        }

        return L.circleMarker(coords, markerStyle)
            .bindTooltip(feature.properties.name, {
                permanent: true,
                className: labelClass
            });
    }

    init(mapInstance) {
        super.init(mapInstance);

        // Hide secondary cities labels
        document.querySelectorAll('.level3-city-label').forEach(el => {
            el.style.opacity = 0;
        });

        // Hide secondary cities labels
        document.querySelectorAll('.level2-city-label').forEach(el => {
            el.style.opacity = 0;
        });
    }
}