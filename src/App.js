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

        // Fetch geojson data
        const areasData = await (await fetch('./data/areas.geojson')).json();
        const bordersData = await (await fetch('./data/borders.geojson')).json();
        const pointsData = await (await fetch('./data/points.geojson')).json();

        // Create layers
        const regionsLayer = new RegionsLayer(areasData, {
            onMouseOver: (props) => this.infoControl.update(props),
            onMouseOut: () => this.infoControl.update()
        });

        const bordersLayer = new BordersLayer(bordersData);

        const primaryCitiesLayer = new CitiesLayer(pointsData);
        primaryCitiesLayer.setFilter = (f) => f.properties.type != "starostwo";

        const secondaryCitiesLayer = new CitiesLayer(pointsData);
        secondaryCitiesLayer.setFilter = (f) => f.properties.type == "starostwo";

        // Initialize layers
        regionsLayer.init(this.map.instance, this.map.getPane('regionsPane'));
        bordersLayer.init(this.map.instance, this.map.getPane('regionsPane'));
        primaryCitiesLayer.init(this.map.instance, this.map.getPane('citiesPane'));
        secondaryCitiesLayer.init(this.map.instance, this.map.getPane('citiesPane'));
    }
}