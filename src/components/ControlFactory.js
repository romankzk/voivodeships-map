import L from 'leaflet';
import { SOURCES } from '../utils/constants';

class Control {
    constructor(options = { position: 'topleft' }) {
        this.options = options;
        this.instance = null;
        this.container = null;
        this.containerClass = '';
    }

    addTo(map) {
        const ControlClass = L.Control.extend({
            onAdd: () => {
                this.container = L.DomUtil.create('div', this.containerClass);
                L.DomUtil.addClass(this.container, 'base-control');

                L.DomEvent.disableClickPropagation(this.container);

                L.DomEvent.on(this.container, 'click', (e) => this._handleClick(e));

                this.update();
                return this.container;
            }
        });

        this.instance = new ControlClass(this.options);
        this.instance.addTo(map);
    }

    update(props) { }
    _handleClick(e) {}
}

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

    _handleClick(e) {
        const target = e.target;

        if (target.closest('#toggle-link')) {
            let sourcesEl = document.querySelector('#sources');
            let toggleLink = document.querySelector('#toggle-link');

            sourcesEl.classList.toggle('hidden');

            this.sourcesHidden = this.sourcesHidden ? false : true;
            
            this.update();
        }

    }
}