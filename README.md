## Interactive map of Ukrainian lands within the Polish-Lithuanian Commonwealth
An interactive map visualizing Ukrainian lands within the Polish-Lithuanian Commonwealth in the time period 1569-1772.

https://romankzk.github.io/voivodeships-map/


## Tech Stack
- Map Engine: Leaflet.js
- Build Tool: Vite
- Language: Vanilla JavaScript
- Data: GeoJSON

## Development
### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
1. Clone the repository:

```Bash
git clone https://github.com/romankzk/voivodeships-map.git
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