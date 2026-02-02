## Interactive map of Ukrainian lands within the Polish-Lithuanian Commonwealth
An interactive map visualizing Ukrainian lands within the Polish-Lithuanian Commonwealth in the time period 1569-1772.

## Tech Stack
- Map Engine: Leaflet.js
- Build Tool: Vite
- Language: Vanilla JavaScript
- Data: GeoJSON

## Project Structure

src/
├── assets/             # Global styles and static assets
├── components/         # Class-based UI & Map logic
│   ├── LayerFactory.js # Polygon and Point layer engines
│   ├── Map.js          # Leaflet instance wrapper
│   └── InfoControl.js  # Interactive side panel
├── utils/              # Pure functions, Enums, and Constants
│   ├── constants.js    # Colors, Eras, and Source metadata
│   └── styles.js       # Centralized Style Registry
├── App.js              # Application entry controller
└── main.js             # Vite entry point

## Development
### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
1. Clone the repository:

```Bash
git clone https://github.com/your-username/voivodeships-map.git
```
2. Install dependencies:

```Bash
npm install
```
3. Start the development server:

```Bash
npm run dev
```
### Deployment
This project is configured for GitHub Actions. Pushing to the main branch automatically triggers the build pipeline (vite build) and deploys the optimized ./dist folder to GitHub Pages.