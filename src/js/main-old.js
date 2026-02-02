import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { sources } from './js/enums';
import { highlightListener, resetListener, zoomToFeatureListener, sourcesToggle, setFeatureColor } from './js/listeners';
import { RegionsLayer } from './Layer';

// Create controls
let zoomCtrl = L.control.zoom({ position: 'bottomright' });
let titleCtrl = L.control({ position: 'topleft' });
let infoCtrl = L.control({ position: 'bottomleft' });
//let searchCtrl = new L.Control.Geocoder();

// Initialize title control
titleCtrl.onAdd = function (map) {
    this._div = L.DomUtil.get('title-control');
    return this._div;
};

// Initialize information control
infoCtrl.onAdd = function (map) {
    this._div = L.DomUtil.get('info-control');
    this.update();

    return this._div;
};

// Update information control when region selected
infoCtrl.update = function (props) {
    this._div.innerHTML = props ?
        `<h2>${props.name ?? "-"}</h2>
            <p class="subheading">${props.higherDivision ?? "-"}</p>
            <div class="grid-wrapper">
                <dt>Назва польською:</dt>
                <dd>${props.namePolish ?? "-"}</dd>
                <dt>Назва латиною:</dt>
                <dd>${props.nameLatin ?? "-"}</dd>
                <dt>Центр:</dt>
                <dd>${props.center ?? "-"}</dd>
                <dt>Роки існування:</dt>
                <dd>${props.years ?? "-"}</dd>
                <dt>Додаткова інформація:</dt>
                <dd>${props.description ?? "-"}</dd>
            </div>
        `
        : '<span>Наведіть курсор на карту, щоб переглянути детальну інформацію</span>';
};

// Create layer for regions
// const regionsLayer = L.geoJson(areasData, {
//     style: function (feature) {
//         return {
//             fillColor: setFeatureColor(feature.properties.higherDivision),
//             weight: 1.5,
//             opacity: 0.7,
//             color: '#000',
//             dashArray: '4, 4',
//             fillOpacity: 0.2
//         };
//     },
//     onEachFeature: function (feature, layer) {
//         layer.on({
//             mouseover: highlightListener,
//             mouseout: resetListener,
//             click: zoomToFeatureListener
//         });
//     }
// });

// Create layer for borders
const bordersLayer = L.geoJson(bordersData, {
    style: (feature) => {
        return {
            weight: 3,
            opacity: 0.7,
            color: '#000',
        };
    }
});

// Create layer for primary cities
const primaryCitiesLayer = L.geoJson(pointsData,  {
    filter: function (feature) {
        return feature.properties.type != "starostwo"
    },
    pointToLayer(feature, latlng) {
        let markerRadius = 0;
        let labelClass = "";
        let fillColor = "";

        if (feature.properties.type == "wojewodztwo") {
            markerRadius = 8;
            labelClass = "level1-city-label";
            fillColor = "#ff4f4f";
        }
        else if (feature.properties.type == "powiat") {
            markerRadius = 4;
            labelClass = "level2-city-label";
            fillColor = "#ff4f4f";
        }

        return L.circleMarker(latlng, {
            radius: markerRadius,
            fillColor: fillColor,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        }).bindTooltip(feature.properties.name, {
            permanent: true,
            className: labelClass
        });
    }
});

// Create layer for secondary cities
const secondaryCitiesLayer = L.geoJson(pointsData,  {
    filter: function (feature) {
        return feature.properties.type == "starostwo"
    },
    pointToLayer(feature, latlng) {
        let markerRadius = 3;
        let labelClass = "level3-city-label";
        let fillColor = "#fff64f";

        return L.circleMarker(latlng, {
            radius: markerRadius,
            fillColor: fillColor,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        }).bindTooltip(feature.properties.name, {
            permanent: true,
            className: labelClass
        });
    }
});

// Create basemap layers
const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Add layers to control
let layerCtrl = L.control.layers({
    "OpenStreetMap": osmLayer,
    
}, {
    "Центри воєводств і повітів": primaryCitiesLayer,
    "Центри староств": secondaryCitiesLayer
});

// Initialize map
let map = L.map('map', {
    center: [48.88, 30.81],
    zoom: 6,
    layers: [osmLayer, regionsLayer.instance, bordersLayer, primaryCitiesLayer, secondaryCitiesLayer],
    zoomControl: false
});

// Add all controls to the map
map.addControl(zoomCtrl)
    .addControl(titleCtrl)
    .addControl(infoCtrl)
    .addControl(searchCtrl)
    .addControl(layerCtrl);

// Show/hide level 3 cities labels on zoom
map.on("zoomend", function () {
    let currentZoom = map.getZoom();

    let zoomThreshold = 8;

    let tooltips = document.querySelectorAll('.level3-city-label');

    // Set the visibility based on the zoom level
    if (currentZoom < zoomThreshold) {
        tooltips.forEach(function (el) {
            el.style.opacity = 0;
        });
    } else {
        tooltips.forEach(function (el) {
            el.style.opacity = 1;
        });
    }

})

// Set default settings on window load
window.onload = function () {
    const sourcesEl = this.document.querySelector('#sources');

    sourcesEl.style.display = 'none';
    sources.map(source => {
        sourcesEl.innerHTML += `
            <li><a target="_blank" href="${source.link}">${source.title}</a></li>`
    });

    const tooltips = document.querySelectorAll('.level3-city-label');
    tooltips.forEach(function (el) {
        el.style.opacity = 0;
    });
}
