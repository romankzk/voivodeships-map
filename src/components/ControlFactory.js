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

                this._setupListeners(this.container);

                this.update();
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
        this.currentPeriod = options.initialPeriod || TIME_PERIODS.PERIOD_1640.id;
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