import L from 'leaflet';
import { FLAG_ICONS, SOURCES, TIME_PERIODS } from '@/utils/constants.js';

/**
 * Abstract base class for all map UI controls.
 * Wraps Leaflet's L.Control with a common lifecycle: create container, render HTML, bind events.
 * Subclasses should override {@link update}, {@link _renderHtml}, and {@link _setupListeners}.
 */
class Control {
    /**
     * @param {object} options - Leaflet control position options
     * @param {string} [options.position='topleft'] - Control position on the map
     */
    constructor(options = { position: 'topleft' }) {
        /** @type {object} Leaflet control options */
        this.options = options;

        /** @type {L.Control|null} The Leaflet control instance */
        this.instance = null;

        /** @type {HTMLElement|null} The control's root DOM container */
        this.container = null;

        /** @type {string} CSS class applied to the control container */
        this.containerClass = '';
    }

    /**
     * Creates the Leaflet control and adds it to the map.
     * Initializes the DOM container, renders content, and sets up event listeners.
     * @param {L.Map} map - The Leaflet map instance
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

    /**
     * Updates the control's content. Called after state changes.
     * @param {object} [props] - Optional properties to pass to the renderer
     */
    update(props) { }

    /**
     * Renders the control's inner HTML. Called by {@link update}.
     * @param {object} [props] - Optional properties for rendering
     */
    _renderHtml(props) { }

    /**
     * Sets up DOM event listeners on the control container.
     * @param {HTMLElement} container - The control's root DOM element
     */
    _setupListeners(container) { }
}

/**
 * Displays detailed information about a hovered map region.
 * Shows region name, administrative division, country with flag, original/Latin names,
 * administrative center, years of existence, and additional notes.
 * @extends Control
 */
export class InfoControl extends Control {
    /**
     * @param {object} [options={position: 'bottomleft'}] - Leaflet control position options
     */
    constructor(options = { position: 'bottomleft' }) {
        super(options);
        this.containerClass = 'info-control';
    }

    /**
     * Updates the info panel with region properties, or resets to the default hint.
     * @param {object|null} [props] - GeoJSON feature properties of the hovered region
     */
    update(props) {
        if (!this.container) return;

        this._renderHtml(props);
    }

    /**
     * Renders the info panel HTML from region properties.
     * @param {object|null} props - Region properties (name, country, center, years, etc.)
     */
    _renderHtml(props) {
        if (!props) {
            const isTouchDevice = 'ontouchstart' in window;
            const hint = isTouchDevice
                ? 'Натисніть на область на карті, щоб переглянути детальну інформацію'
                : 'Наведіть курсор на карту, щоб переглянути детальну інформацію';
            this.container.innerHTML = `<span>${hint}</span>`;
            return;
        }

        const countryInfo = FLAG_ICONS.find(i => i.name == props.country) || '';

        this.container.innerHTML = `
            <h2>${props.name}</h2>
            <h3>${props.higherDivision != props.name && props.higherDivision != props.country ? props.higherDivision : ''}</h3>
            <h4>
                <img src="${countryInfo.iconUrl}"
                        class="country-icon"
                        alt="${countryInfo.name}"
                        loading="lazy"
                    />
                ${props.country || ''}
            </h4>
            <div class="grid-wrapper">
                ${props.nameOriginal ? this.#renderRow(`Назва ${countryInfo.lang}`, props.nameOriginal) : ''}
                ${props.nameLatin ? this.#renderRow("Назва латиною", props.nameLatin) : ''}
                ${props.center ? this.#renderRow("Центр", props.center) : ''}
                ${props.years ? this.#renderRow("Роки існування", props.years) : ''}
                ${props.description ? this.#renderRow("Додатково", props.description) : ''}
            </div>
        `;
    }

    /**
     * Renders a single label-value row as a definition list pair.
     * @param {string} label - The row label text
     * @param {string} value - The row value text
     * @returns {string} HTML string for a dt/dd pair, or empty string if value is falsy
     */
    #renderRow(label, value) {
        if (!value) return '';
        return `
            <dt>${label}:</dt>
            <dd>${value}</dd>
        `;
    }
}

/**
 * Displays the map title, disclaimer, legend, and a collapsible list of academic sources.
 * @extends Control
 */
export class TitleControl extends Control {
    /**
     * @param {object} [options={position: 'topleft'}] - Leaflet control position options
     */
    constructor(options = { position: 'topleft' }) {
        super(options);
        this.containerClass = 'title-control';

        /** @type {boolean} Whether the sources list is currently hidden */
        this.sourcesHidden = true;

        /** @type {boolean} Whether the title body is expanded on mobile */
        this.bodyExpanded = false;
    }

    /**
     * Re-renders the title control content.
     */
    update() {
        if (!this.container) return;

        this._renderHtml();
    }

    /**
     * Renders the title, legend circles, and toggleable sources list.
     * On mobile, the body is wrapped in a collapsible container.
     */
    _renderHtml() {
        this.container.innerHTML = `
                <h1>
                    <img src="map-logo.svg" alt="Map logo" width="24" height="24">
                    <span>Українські землі у XVII-XVIII ст.</span>
                </h1>
                <button class="title-toggle-btn" id="title-toggle">${this.bodyExpanded ? "згорнути" : "детальніше..."}</button>
                <div class="title-body ${this.bodyExpanded ? 'expanded' : ''}">
                    <p>Дана карта є лише гіпотетичною реконструкцією на основі аналізу доступних архівних джерел.<br>Якщо помітили помилку або маєте що додати, повідомте про це автора.</p>
                    <h2>Умовні позначення</h2>
                    <div class="legend-item">
                        <span class="legend-circle level-1-circle"></span>
                        <span class="legend-text">Центри воєводств, комітатів, цинутів</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-circle level-2-circle"></span>
                        <span class="legend-text">Центри повітів, полків</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-circle level-3-circle"></span>
                        <span class="legend-text">Центри староств</span>
                    </div>
                    <h2>Джерела</h2>
                    <p>
                        <a id="toggle-link" href="#">${this.sourcesHidden ? "показати" : "сховати"}</a>
                    </p>
                    <ol id="sources" class="${this.sourcesHidden ? "hidden" : ""}">${this.#renderSourcesList(SOURCES)}</ol>
                </div>`
    }

    /**
     * Renders the sources as an HTML list of links.
     * @param {Array<{title: string, link: string}>} keys - Array of source objects
     * @returns {string} HTML string of <li> elements
     */
    #renderSourcesList(keys) {
        const listItems = keys
            .map(source => {
                return `
                <li>
                    <a target="_blank" href="${source.link}">${source.title}</a>
                </li>`
            })
            .join('');

        return listItems;
    }

    /**
     * Handles click on the show/hide toggle link for the sources list
     * and the mobile expand/collapse button for the title body.
     * @param {HTMLElement} container - The control's root DOM element
     */
    _setupListeners(container) {
        container.addEventListener('click', (e) => {
            const target = e.target;

            if (target.closest('#toggle-link')) {
                let sourcesEl = document.querySelector('#sources');

                sourcesEl.classList.toggle('hidden');

                this.sourcesHidden = this.sourcesHidden ? false : true;

                this.update();
            }

            if (target.closest('#title-toggle')) {
                this.bodyExpanded = !this.bodyExpanded;
                this.update();
            }
        });
    }
}

/**
 * Provides buttons for switching between historical time periods.
 * Supports a loading state that disables buttons during data fetching.
 * @extends Control
 */
export class TimelineControl extends Control {
    /**
     * @param {object} options - Control options
     * @param {string} [options.position='topright'] - Control position on the map
     * @param {Function} [options.onPeriodChange] - Callback invoked with the new period ID on switch
     * @param {string} [options.initialPeriod] - The initially active period ID
     */
    constructor(options = { position: 'topright' }) {
        super(options);

        /** @type {Function|undefined} Callback for period change events */
        this.onPeriodChange = options.onPeriodChange;

        /** @type {string} The currently active period ID */
        this.currentPeriod = options.initialPeriod || TIME_PERIODS.PERIOD_1640.id;

        /** @type {boolean} Whether data is currently being loaded */
        this.loading = false;

        this.containerClass = 'timeline-control';
    }

    /**
     * Renders period buttons, marking the current period as active and disabling all when loading.
     */
    _renderHtml() {
        this.container.innerHTML = Object.values(TIME_PERIODS).map(period =>
            `<button
                class="period-btn ${period.id === this.currentPeriod ? 'active' : ''}"
                data-id="${period.id}"
                ${this.loading ? 'disabled' : ''}>
                ${period.label}
            </button>
            `)
            .join('');
    }

    /**
     * Re-renders the timeline buttons.
     */
    update() {
        if (!this.container) return;

        this._renderHtml();
    }

    /**
     * Sets the loading state and re-renders buttons accordingly.
     * @param {boolean} isLoading - Whether data is currently being fetched
     */
    setLoading(isLoading) {
        this.loading = isLoading;
        this.update();
    }

    /**
     * Handles click events on period buttons.
     * Updates the active state and notifies the app via the onPeriodChange callback.
     * @param {HTMLElement} container - The control's root DOM element
     */
    _setupListeners(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.period-btn');
            if (!btn || this.loading) return;

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
 * Provides a search input that queries OpenStreetMap Nominatim for locations within Ukraine.
 * Displays results in a dropdown and notifies the app when a location is selected.
 * @extends Control
 */
export class SearchControl extends Control {
    /**
     * @param {object} options - Control options
     * @param {Function} options.onLocationSelect - Callback invoked with the selected GeoJSON-like feature
     */
    constructor(options = { onLocationSelect }) {
        super({ position: 'topright' });

        /** @type {Function} Callback for location selection */
        this.onLocationSelect = options.onLocationSelect;

        this.containerClass = 'search-control';
    }

    /**
     * Renders the search input and results dropdown.
     */
    update() {
        if (!this.container) return;

        this.container.innerHTML = `
                    <div class="search-wrapper">
                        <input type="text" class="search-input" placeholder="Шукати на карті..." />
                        <ul class="search-results" style="display: none;"></ul>
                    </div>
                `;
    }

    /**
     * Sets up debounced input handling for search queries and click handling for result selection.
     * @param {HTMLElement} container - The control's root DOM element
     */
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
     * Queries the OpenStreetMap Nominatim API for locations matching the search term.
     * Results are restricted to Ukraine and returned in Ukrainian.
     * @param {string} query - The search query string
     * @returns {Promise<Array<object>>} Array of GeoJSON-like feature objects
     */
    async #searchOSM(query) {
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

    /**
     * Renders search results into the dropdown list.
     * @param {Array<object>} matches - Array of GeoJSON-like feature objects
     * @param {HTMLUListElement} listElement - The <ul> element to render results into
     */
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

    /**
     * Invokes the location selection callback with the chosen feature.
     * @param {object} feature - The selected GeoJSON-like feature
     */
    #handleSelection(feature) {
        if (this.onLocationSelect) {
            this.onLocationSelect(feature);
        }
    }
}
