// Set sources list on window load
window.onload = function () {
    const sourcesEl = this.document.querySelector('#sources');

    sourcesEl.style.display = 'none';
    sources.map(source => {
        sourcesEl.innerHTML += `
            <li><a target="_blank" href="${source.link}">${source.title}</a></li>`
    });
}

// Create controls
let zoomCtrl = L.control.zoom({ position: 'bottomright' });
let titleCtrl = L.control({ position: 'topleft' });
let infoCtrl = L.control({ position: 'bottomleft' });
let searchCtrl = new L.Control.Geocoder();

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
const regionsLayer = L.geoJson(areasData, {
    style: function (feature) {
        return {
            fillColor: setFeatureColor(feature.properties.higherDivision),
            weight: 1.5,
            opacity: 0.7,
            color: '#000',
            dashArray: '4, 4',
            fillOpacity: 0.2
        };
    },
    onEachFeature: function (feature, layer) {
        layer.on({
            mouseover: highlightListener,
            mouseout: resetListener,
            click: zoomToFeatureListener
        });
    }
});

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

// Create layer for cities
const citiesLayer = L.geoJson(pointsData, {
    pointToLayer(feature, latlng) {
        let markerRadius = 0;
        let labelClass = "";

        if (feature.properties.type == "wojewodztwo") {
            markerRadius = 8;
            labelClass = "wojewodztwo-city-label";
        }
        else {
            markerRadius = 4;
            labelClass = "powiat-city-label";
        }

        return L.circleMarker(latlng, {
            radius: markerRadius,
            fillColor: '#ff4f4f',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 1
        }).bindTooltip(feature.properties.name, {
            permanent: true,
            className: labelClass
        });
    }
})

// Create basemap layers
const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const esriImageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const esriGeoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    maxZoom: 16
});

// Add layers to control
let layerCtrl = L.control.layers({
    "Esri Imagery": esriImageryLayer,
    "Esri GeoWorldMap": esriGeoMap,
    "OpenStreetMap": osmLayer,
}, {
    "Міста": citiesLayer
});

// Initialize map
let map = L.map('map', {
    center: [48.88, 30.81],
    zoom: 6,
    layers: [esriImageryLayer, esriGeoMap, osmLayer, regionsLayer, bordersLayer, citiesLayer],
    zoomControl: false
});

// Add all controls to the map
map.addControl(zoomCtrl)
    .addControl(titleCtrl)
    .addControl(infoCtrl)
    .addControl(searchCtrl)
    .addControl(layerCtrl);