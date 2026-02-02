import { App } from './App'; 

import 'leaflet/dist/leaflet.css';
import "./assets/style.css";

// Initializing the app
document.addEventListener('DOMContentLoaded', () => {
    try {
        new App();
    } catch (error) {
        console.error('Failed to initialize application: ', error);
    }
})