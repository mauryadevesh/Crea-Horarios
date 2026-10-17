# Weekly Timetable Maker

A minimalist, conflict-free responsive timetable planner with automated clash detection and local JSON database storage.

## Features
- **Conflict-Free Timetable Builder**: Automated clash prevention for faculty double-booking, room overlap, and time collision.
- **Dual-Mode Matrix**: Responsive mobile cards and desktop schedule matrix with day-by-day filtering.
- **Subjects & Faculty Management**: Assign teachers, customize lecture rooms, and manage weekly periods.
- **Local JSON Database & Accounts**: Offline-first storage with user sign in/register directly in the browser.
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

- **Account Authentication**: Sign in or Register in the top-right corner to persist your personal timetable.
- **Integrity Verifier**: Run the deterministic CLI verification script:
  ```bash
  node execution/verify_json_db.mjs [path_to_json_file]
  ```
- **Template Reference**: Default seed template is available at [`data/default_timetable_database.json`](data/default_timetable_database.json).

## Project Structure
- `src/lib/` - Conflict engine, JSON database manager, and persistence logic
- `src/components/` - Responsive timetable views, modal builders, and account manager
- `src/context/` - Timetable context state provider
- `data/` - Default JSON database templates and seed data
- `directives/` - Standard Operating Procedures (SOPs)
- `execution/` - Deterministic verification scripts
