import { Map } from './components/Map';
import { RegionsLayer, BordersLayer, CitiesLayer } from './components/LayerFactory';
import { InfoControl, TitleControl } from './components/ControlFactory';

export class App {
    constructor() {
        this.map = new Map('map');
        this.titleControl = new TitleControl();
        this.infoControl = new InfoControl();
        this.init();
    }

    async init() {
        // Initialize UI
        this.titleControl.addTo(this.map.instance);
        this.infoControl.addTo(this.map.instance);

        // Fetch Areas data
        const areasData = await (await fetch('./data/areas.geojson')).json();
        const bordersData = await (await fetch('./data/borders.geojson')).json();
        const pointsData = await (await fetch('./data/points.geojson')).json();

        // Initialize layer with callbacks
        const regionsLayer = new RegionsLayer(areasData, {
            onMouseOver: (props) => this.infoControl.update(props),
            onMouseOut: () => this.infoControl.update()
        });

        const bordersLayer = new BordersLayer(bordersData);

        const primaryCitiesLayer = new CitiesLayer(pointsData);
        primaryCitiesLayer.setFilter = (f) => f.properties.type != "starostwo";

        const secondaryCitiesLayer = new CitiesLayer(pointsData);
        secondaryCitiesLayer.setFilter = (f) => f.properties.type == "starostwo";

        regionsLayer.init(this.map.instance);
        bordersLayer.init(this.map.instance);
        primaryCitiesLayer.init(this.map.instance);
        secondaryCitiesLayer.init(this.map.instance);
    }
}