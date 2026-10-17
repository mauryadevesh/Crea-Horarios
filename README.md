# Weekly Timetable Maker

A minimalist, conflict-free responsive timetable planner and daily lecture logger with an offline-first local JSON Database.

## Features
- **Conflict-Free Timetable Builder**: Automated clash prevention for faculty double-booking, room overlap, and class collision.
- **Dual-Mode Matrix**: Responsive mobile cards and desktop schedule data matrix with day-by-day filtering.
- **Daily Lecture Log**: Real-time attendance logging (Attended, Missed, Cancelled) and single-day lecture swaps/overrides.
- **Local JSON Database**: Offline-first storage with single-click JSON database Export and Import.
- **Minimalist Aesthetic**: Dark forest palette (#16362B, #1B3F33, #F5F2DF) with zero emojis and custom typography.

## Tech Stack
- React 18 + TypeScript (Vite)
- Tailwind CSS
- Framer Motion
- Vitest

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Run Test Suite
```bash
npm run test:run
```

### 4. Build for Production
```bash
npm run build
```

## JSON Database Management
The application operates entirely offline-first using a structured JSON database stored in your browser's LocalStorage.

- **Export Database**: Click **Export JSON** in the top-right header panel to download your complete `timetable_database.json`.
- **Import Database**: Click **Import JSON** to load and restore any previously exported `.json` schedule file.
- **Integrity Verifier**: Run the deterministic CLI verification script:
  ```bash
  node execution/verify_json_db.mjs [path_to_json_file]
  ```
- **Template Reference**: Default seed template is available at [`data/default_timetable_database.json`](data/default_timetable_database.json).

## Project Structure
- `src/lib/` - Conflict engine, JSON database manager, and persistence logic
- `src/components/` - Responsive timetable views, modal builders, and JSON database panel
- `data/` - Default JSON database templates and seed data
- `directives/` - Standard Operating Procedures (SOPs)
- `execution/` - Deterministic verification scripts
