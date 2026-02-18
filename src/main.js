import { App } from '@/App.js';

import "@/assets/style.css";

/**
 * Application entry point.
 * Waits for DOM to be fully loaded before initializing the app.
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        new App();
    } catch (error) {
        console.error('Failed to initialize application: ', error);
    }
})
