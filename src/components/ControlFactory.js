import L from 'leaflet';
import { SOURCES, TIME_PERIODS } from '../utils/constants.js';

/**
 * Base class for all controls
 */
class Control {
    /**
     * @constructor
     * @param {object} - options for L.Control object
     */
    constructor(options = { position: 'topleft' }) {
        this.options = options;
        this.instance = null;
        this.container = null;
        this.containerClass = '';
    }

    /**
     * Method which adds control to the map
     * @param {L.map} map - map instance
     */
    addTo(map) {
        const ControlClass = L.Control.extend({
            onAdd: () => {
                this.container = L.DomUtil.create('div', this.containerClass);
                L.DomUtil.addClass(this.container, 'base-control');

                L.DomEvent.disableClickPropagation(this.container);
                
                this.update();
                
                this._setupListeners(this.container);

                return this.container;
            }
        });

        this.instance = new ControlClass(this.options);
        this.instance.addTo(map);
    }

    update(props) { }
    _setupListeners(container) { }
}

/**
 * Class for control which shows details about region
 * @extends Control
 */
export class InfoControl extends Control {
    constructor(options = { position: 'bottomleft' }) {
        super(options);
        this.containerClass = 'info-control';
    }

    update(props) {
        if (!this.container) return;

        if (!props) {
            this.container.innerHTML = '<span>Наведіть курсор на карту, щоб переглянути детальну інформацію</span>';
            return;
        }

        this.container.innerHTML = `
            <h2>${props.name || '-'}</h2>
            <p class="subheading">${props.higherDivision || "-"}</p>
            <div class="grid-wrapper">
                ${props.namePolish ? this._renderRow("Назва польською", props.namePolish) : ''}
                ${props.nameLatin ? this._renderRow("Назва латиною", props.nameLatin) : ''}
                ${props.center ? this._renderRow("Центр", props.center) : ''}
                ${props.years ? this._renderRow("Роки існування", props.years) : ''}
                ${props.description ? this._renderRow("Додатково", props.description) : ''}
            </div>
        `;
    }

    _renderRow(label, value) {
        if (!value) return '';
        return `
            <dt>${label}:</dt>
            <dd>${value}</dd>
        `;
    }
}

/**
 * Class for the control which shows map title and description
 * @extends Control
 */
export class TitleControl extends Control {
    constructor(options = { position: 'topleft' }) {
        super(options);
        this.containerClass = 'title-control';
        this.sourcesHidden = true;
    }

    update() {
        if (!this.container) return;

        this.container.innerHTML = `
                <h1>Українські землі у складі Речі Посполитої</h1>
                <p>Інтерактивна карта адміністративно-територіального поділу українських земель<br> у складі Речі Посполитої у XVII-XIII ст.</p>
                <p>Карта несе лише ознайомчий характер і не претендує на історичну достовірність.</p>
                <p>Джерела: <a id="toggle-link" href="#">${this.sourcesHidden ? "показати" : "сховати"}</a></p>
                <ul id="sources" class="${this.sourcesHidden ? "hidden" : ""}">${this._renderSourcesList(SOURCES)}</ul>
            `;
    }

    _renderSourcesList(keys) {
        const listItems = keys
            .map(source => {
                return `<li><a target="_blank" href="${source.link}">${source.title}</a></li>`
            })
            .join('');

        return listItems;
    }

    _setupListeners(container) {
        container.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('#toggle-link')) {
                let sourcesEl = document.querySelector('#sources');

                sourcesEl.classList.toggle('hidden');

                this.sourcesHidden = this.sourcesHidden ? false : true;

                this.update();
            }
        });
    }
}

/**
 * Class for controls which allows switching between different time periods
 * @extends Control
 */
export class TimelineControl extends Control {
    constructor(options = { position: 'topright' }) {
        super(options);
        this.onPeriodChange = options.onPeriodChange;
        this.currentPeriod = options.initialPeriod || TIME_PERIODS.PERIOD_1620.id;
        this.containerClass = 'timeline-control';
    }

    update() {
        if (!this.container) return;

        this.container.innerHTML = Object.values(TIME_PERIODS).map(period => `
                    <button class="period-btn ${period.id === this.currentPeriod ? 'active' : ''}" 
                            data-id="${period.id}">
                        ${period.label}
                    </button>
                `).join('');
    }

    _setupListeners(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.period-btn');
            if (!btn) return;

            const periodId = btn.dataset.id;

            // Update UI
            container.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Notify the app that we are changing periods
            if (this.onPeriodChange) {
                this.onPeriodChange(periodId);
            }
        });
    }
}

/**
 * Class for control which allows searching the map
 * @extends Control
 */
export class SearchControl extends Control {
    constructor(options = { onLocationSelect}) {
        super({ position: 'topright' });
        this.onLocationSelect = options.onLocationSelect;
        this.containerClass = 'search-control';
    }

    update() {
        if (!this.container) return;

        this.container.innerHTML = `
                    <div class="search-wrapper">
                        <input type="text" class="search-input" placeholder="Шукати на карті..." />
                        <ul class="search-results" style="display: none;"></ul>
                    </div>
                `;
    }

    _setupListeners(container) {
        const input = container.querySelector('.search-input');
        const resultsList = container.querySelector('.search-results');

        // Use a "Debounce" to prevent spamming the OSM API
        let debounceTimer;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 3) {
                resultsList.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                const osmResults = await this.#searchOSM(query);
                this.#renderResults(osmResults, resultsList);
            }, 500); // Wait 500ms after typing stops
        });

        resultsList.addEventListener('click', (e) => {
            const item = e.target.closest('li');
            if (!item) return;

            const feature = JSON.parse(item.dataset.feature);
            this.#handleSelection(feature);
            
            // UI Reset
            resultsList.style.display = 'none';
            input.value = '';
        });
    }

    /**
     * Fetches results from OpenStreetMap Nominatim API
     * @private
     */
    async #searchOSM(query) {
        // We can restrict search to Ukraine or specific bounding boxes to keep it relevant
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ua`;

        try {
            const response = await fetch(url, {
                headers: { 'Accept-Language': 'uk, en' } // Prefer Ukrainian names
            });
            const data = await response.json();

            // Map OSM format to internal "Feature" format for consistency
            return data.map(item => ({
                properties: {
                    name: item.display_name.split(',')[0],
                    higherDivision: item.display_name.split(',').slice(1, 3).join(','),
                    isOSM: true // Flag to distinguish from your local data
                },
                geometry: {
                    coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                }
            }));
        } catch (error) {
            console.error("OSM Search failed:", error);
            return [];
        }
    }

    #renderResults(matches, listElement) {
        if (matches.length === 0) {
            listElement.style.display = 'none';
            return;
        }

        listElement.innerHTML = matches.map(f => `
            <li class="search-item" data-feature='${JSON.stringify(f)}'>
                <span class="item-name">${f.properties.name}</span>
                <span class="item-meta">${f.properties.higherDivision || ''}</span>
            </li>
        `).join('');

        listElement.style.display = 'block';
    }

    #handleSelection(feature) {
        if (this.onLocationSelect) {
            this.onLocationSelect(feature);
        }
    }
}