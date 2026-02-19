## Інтерактивна карта українських земель XVI-XIX ст.

Інтерактивна карта для візуалізації адміністративно-територіально устрою українських земель у складі Речі Посполитої та інших держав у період 1640-1760 рр.

### Основні можливості

- Інтерактивна Leaflet карта з регіонами та містами
- Кілька часових періодів (1640, 1760) з миттєвим перемиканням
- Пошук локацій через OSM Nominatim API
- Світла/темна тема
- Редактор метаданих GeoJSON

### Технологічний стек

- **Фреймворк:** React + TypeScript
- **Карта:** Leaflet.js
- **Стилі:** Tailwind
- **Build Tool:** Vite
- **Іконки:** Lucide React
- **Дані:** GeoJSON

### Структура проєкту

```
src/
  main.tsx                          # Entry point, router setup, theme init
  AppRoot.tsx                       # Map page root component
  pages/
    EditorPage.tsx                  # Feature property editor page
  components/
    layers/
      RegionsLayer.tsx              # Region polygon layer (color-coded, hover/click)
      BordersLayer.tsx              # Border line layer
      CitiesLayer.tsx               # City circle marker layer with tooltips
    controls/
      TitleControl.tsx              # Title, legend, sources panel
      InfoControl.tsx               # Hovered region info panel
      TimelineControl.tsx           # Period switcher buttons
      SearchControl.tsx             # OSM Nominatim search
      EditButtonControl.tsx         # Navigate to editor page
      ThemeToggleControl.tsx        # Dark/light mode toggle
  hooks/
    useMap.ts                       # Leaflet map initialization, tile layer swapping
    usePeriodData.ts                # GeoJSON data fetching with AbortController
    useLeafletControl.ts            # Leaflet control + React portal bridge
    useDarkMode.ts                  # Reactive dark mode state (MutationObserver)
    useOverrides.ts                 # React bindings for override store
    useDebounce.ts                  # Input debounce hook
  store/
    overrides.ts                    # In-memory feature property override store
  context/
    MapContext.tsx                   # Shared map state via React context
  types/
    index.ts                        # TypeScript interfaces
  utils/
    constants.ts                    # Time periods, styles, colors, sources
  assets/
    style.css                       # Tailwind imports, Leaflet overrides
public/
  data/                             # GeoJSON files (areas, borders, points per period)
```

### Додавання та редагування регіонів та міст
#### Редагування існуючих даних
Всі дані для карти у форматі GeoJSON розміщені у папці `public/data/`. За потреби їх можна завантажити і відредагувати у QGIS. 

Шар `areas` у форматі полігонів, відображає найнижчі адмінодиниці, наприклад повіти, хоча іноді може позначати і воєводства. Кордони повітів на карті позначені штрихпунктирною лінією. 

Шар `borders` у форматі ліній, необхідний для позначення кордонів воєводств, які відображені на карті суцільною товстою лінією.

Шар `points` в форматі точок, відображає центри адмінодиниць, таких як воєводства, повіти та староства.

#### Створення нових даних
Нові дані для карти можна створити самостійно у системі QGIS і експортувати у формат GeoJSON. Для конкретного року повинно існувати три файли з зазначеними полями:
   - `areas-{year}.geojson`:
      - `name` - назва, наприклад *Львівська земля"
      - `higherDivision` - вища адмінодиниця, наприклад "Руське воєводство"
      - `nameOriginal` - назва в оригіналі (польською, угорською тощо)
      - `nameLatin` - назва латиною
      - `center` - адміністративний центр, наприклад "Львів"
      - `years` - роки існування, напр. "1472-1772"
      - `description` - додаткова інформація
      - `country` - держава, напр. "Річ Посполита"
   - `borders-{year}.geojson`: без властивостей
   - `points-{year}.geojson`:
      - `name` - назва міста, напр. "Овруч"
      - `description` - додаткова інформація, наразі не відображається на карті
      - `adminLevel` - тип міста: 1 - центр воєводства, 2 - центр повіту, полку, 3 - центр староства

#### Додавання даних у проєкт

1. Перенесіть три GeoJSON файли у папку `public/data/`.

2. Додайте нове значення у константу `TIME_PERIODS` у `src/utils/constants.ts`:
   ```ts
   PERIOD_{YEAR}: {
       id: "{year}",
       label: "{year}",
       areasFile: "areas-{year}",
       bordersFile: "borders-{year}",
       pointsFile: "points-{year}"
   }
   ```

Все інше (кнопка зміни періодів, дані редактора, завантаження даних) буде оновлено автоматично.

### Розробка

#### Передумови
- Node.js (v20.19+ or v22+)
- npm

#### Налаштування

```bash
git clone https://github.com/romankzk/voivodeships-map.git
cd voivodeships-map
npm install
```

#### Скрипти

| Команда | Опис |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run typecheck` | Type-check only |
| `npm run preview` | Preview production build locally |

### Deployment

Пуш до `main` запускає GitHub Actions workflow, який білдить проєкт і деплоїть папку `./dist` на GitHub Pages.
