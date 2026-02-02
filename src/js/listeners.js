import { colors } from './enums';

// Highlight region on hover
export function highlightListener(e) {
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
export function resetListener(e) {
    regionsLayer.resetStyle(e.target);
    infoCtrl.update();
}

// Zoom to region on click
export function zoomToFeatureListener(e) {
    map.fitBounds(e.target.getBounds());
}

// Sources show/hide link handler
export function sourcesToggle() {
    let sourcesList = document.querySelector('#sources');
    let toggleLink = document.querySelector('#toggle-link');

    if (sourcesList.style.display == 'none') {
        toggleLink.innerHTML = 'приховати';
        sourcesList.style.display = 'block';
        
    } else {
        toggleLink.innerHTML = 'показати';
        sourcesList.style.display = 'none';
    }
}

export function setFeatureColor(higherDivision) {
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