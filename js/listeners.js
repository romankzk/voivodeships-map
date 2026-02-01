// Highlight region on hover
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

// Reset region highligh on mouse out
function resetListener(e) {
    regionsLayer.resetStyle(e.target);
    infoCtrl.update();
}

// Zoom to region on click
function zoomToFeatureListener(e) {
    map.fitBounds(e.target.getBounds());
}

// Sources show/hide link handler
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

function setFeatureColor(higherDivision) {
    switch (higherDivision) {
        case 'Київське воєводство':
            return colors.KIJOWSKIE;
            break;
        case 'Київське воєводство (до 1667)':
            return colors.KIJOWSKIE_1667
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
        case 'Берестейське воєводство':
            return colors.BRZESKOLITEWSKIE;
            break;
        case 'Чернігівське воєводство':
            return colors.CZERNIHOWSKIE;
            break;
        default:
            return colors.DEFAULT;
    }
}