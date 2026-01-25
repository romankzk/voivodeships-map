const colors = {
    BRACLAWSKIE: "#770c94",
    RUSKIE: "#2563EB",
    BELZKIE: "#6d940c",
    KIJOWSKIE: "#2c781d",
    PODOLSKIE: "#ca7900",
    WOLYNSKIE: "#eb2581",
    DEFAULT: "gray"
};

window.onload = function() {
    document.querySelector('#sources').style.display = 'none';
}

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

function setFeatureColor(higherDivision) {
    switch (higherDivision) {
        case 'Київське воєводство':
            return colors.KIJOWSKIE;
            break;
        case 'Брацлавське воєводство':
            return colors.BRACLAWSKIE;
            break;
        case 'Руське воєводство':
            return colors.RUSKIE;
            break;
        case 'Белзьке воєводство':
            return colors.BELZKIE;
            break;
        case 'Подільське воєводство':
            return colors.PODOLSKIE;
            break
        case 'Волинське воєводство':
            return colors.WOLYNSKIE;
            break;
        default:
            return colors.DEFAULT;
    }
}

// Create layers
const regionsLayer = L.geoJson(areasData, {
    style: function (feature) {
        return {
            fillColor: setFeatureColor(feature.properties.higherDivision),
            weight: 2,
            opacity: 0.7,
            color: '#000',
            fillOpacity: 0.2
        };
    },
    onEachFeature: onEachFeature
});

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

const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Initialize map
let map = L.map('map', {
    center: [48.88, 30.81],
    zoom: 6,
    layers: [osmLayer, regionsLayer, citiesLayer],
    zoomControl: false
});

map.addControl(zoomCtrl)
    .addControl(titleCtrl)
    .addControl(infoCtrl)
    .addControl(searchCtrl);

// Feature event listeners
function highlightListener(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#000',
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

function sourcesToggle() {
    let sourcesList = document.querySelector('#sources');
    let toggleLink = document.querySelector('#toggle-link');
    console.log(sourcesList.style.display);

    if (sourcesList.style.display == 'none') {
        toggleLink.innerHTML = 'приховати';
        sourcesList.style.display = 'block';
        
    } else {
        toggleLink.innerHTML = 'показати';
        sourcesList.style.display = 'none';
    }
}