import { App } from './App'; 

import "./style.css";
import 'leaflet/dist/leaflet.css';

// Initializing the app
document.addEventListener('DOMContentLoaded', () => {
    try {
        new App();
    } catch (error) {
        console.error('Failed to initialize application: ', error);
    }
})