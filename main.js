const colors = {
    BRACLAWSKIE: "#770c94",
    RUSKIE: "#2563EB",
    KIJOWSKIE: "#2c781d",
    PODOLSKIE: "#ca7900",
    WOLYNSKIE: "#eb2581",
    DEFAULT: "gray"
};

// Initialize controls
let zoomCtrl = L.control.zoom({ position: 'bottomright'});
let titleCtrl = L.control({ position: 'topleft' });
let infoCtrl = L.control({ position: 'bottomleft' });
let searchCtrl = new L.Control.Geocoder();

titleCtrl.onAdd = function(map) {
    this._div = L.DomUtil.get('title-control');
    return this._div;
};

infoCtrl.onAdd = function(map) {
    this._div = L.DomUtil.get('info-control');
    this.update();

    return this._div;
};

infoCtrl.update = function(props) {
    this._div.innerHTML = props ? 
        `<h2>${props.name}</h2>
            <p class="subheading">${props.higherDivision}</p>
            <div class="grid-wrapper">
                <dt>Назва польською:</dt>
                <dd>${props.namePolish}</dd>
                <dt>Назва латиною:</dt>
                <dd>${props.nameLatin}</dd>
                <dt>Центр:</dt>
                <dd>${props.center}</dd>
                <dt>Роки існування:</dt>
                <dd>${props.years}</dd>

            </div>
            <p class="description">Поділялася на два повіти: Львівський та Жидачівський.</p>
        `
        : '<span>Натисніть на карту, щоб переглянути детальну інформацію</span>';
};

function setFeatureColor(higherDivision) {
    return  higherDivision == 'Київське воєводство' ? colors.KIJOWSKIE :
            higherDivision == 'Брацлавське воєводство' ? colors.BRACLAWSKIE :
            higherDivision == 'Руське воєводство' ? colors.RUSKIE :
            higherDivision == 'Подільське воєводство' ? colors.PODOLSKIE :
            higherDivision == 'Волинське воєводство' ? colors.WOLYNSKIE :
            colors.DEFAULT;
}

// Create layers
const regionsLayer = L.geoJson(data, {
    style: function (feature) {
        return {
            fillColor: setFeatureColor(feature.properties.higherDivision),
            weight: 2,
            opacity: 0.7,
            color: '#000',
            fillOpacity: 0.2
        };
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: new L.DivIcon({
                html: `<strong>${feature.properties.name}</strong>`
            })
        })
    },
    onEachFeature: onEachFeature
});

const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Init map
let map = L.map('map', {
    center: [48.88, 30.81],
    zoom: 6,
    layers: [osmLayer, regionsLayer],
    zoomControl: false
});

map.addControl(zoomCtrl)
    .addControl(titleCtrl)
    .addControl(infoCtrl)
    .addControl(searchCtrl);

// Event listeners
function highlightListener(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#000',
        //fillColor: '#2563EB',
        fillOpacity: 0.5
    });

    layer.bringToFront();
    infoCtrl.update(layer.feature.properties);
}

function resetListener(e) {
    regionsLayer.resetStyle(e.target);
    infoCtrl.update();
}

function zoomToFeatureListener(e) {
    map.fitBounds(e.target.getBounds());
}

// On each feature listener
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightListener,
        mouseout: resetListener,
        click: zoomToFeatureListener
    });
}