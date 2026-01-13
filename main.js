const colors = {
    BRACLAWSKIE: "#770c94",
    RUSKIE: "#2563EB",
    KIJOWSKIE: "#2c781d",
    PODOLSKIE: "#ca7900",
    WOLYNSKIE: "#eb2581",
    DEFAULT: "gray"
};

// Init Info control
let infoCtrl = L.control();

infoCtrl.onAdd = function (map) {
    this._div = L.DomUtil.get('info');
    this.update();

    return this._div;
};

infoCtrl.update = function (props) {
    this._div.innerHTML = '<h2>Річ Посполита у 1620 році</h2>' +  (props ?
        `<span class="division-name">${props.name}<span><br><span class="sup-division-name">${props.relation}</span>`
        : '<span class="division-name">Тут буде інформація про регіон</span>');
};

function setFeatureColor(relation) {
    return  relation == 'Київське воєводство' ? colors.KIJOWSKIE :
            relation == 'Брацлавське воєводство' ? colors.BRACLAWSKIE :
            relation == 'Руське воєводство' ? colors.RUSKIE :
            relation == 'Подільське воєводство' ? colors.PODOLSKIE :
            relation == 'Волинське воєводство' ? colors.WOLYNSKIE :
            colors.DEFAULT;
}

// Create layers
const regionsLayer = L.geoJson(data, {
    style: function (feature) {
        return {
            fillColor: setFeatureColor(feature.properties.relation),
            weight: 2,
            opacity: 0.7,
            color: '#000',
            fillOpacity: 0.2
        };
    },
    onEachFeature: onEachFeature
}).bindPopup(function (layer) {
    return layer.feature.properties.name;
});

const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Init map
let map = L.map('map', {
    center: [48.88, 30.81],
    zoom: 6,
    layers: [osmLayer, regionsLayer]
});

infoCtrl.addTo(map);

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