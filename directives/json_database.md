# SOP: Local JSON Database Management

## Objective
Provide offline-first, local, reproducible data persistence for the Weekly Timetable Maker using standard JSON database structures without third-party cloud database dependencies.

## Architecture
- **Primary Storage**: Browser LocalStorage under key `timetable_json_database_v1`.
- **Database Schema**: Versioned JSON document (`JsonDatabaseFile`) containing subjects, faculty assignments, timetable mappings, scheduled slots, attendance logs, and notes.
- **Export**: Generates clean, human-readable `timetable_database.json` via the web UI.
- **Import**: Validates and restores any exported `.json` timetable database file with schema verification.
- **Template Reference**: Located at [`data/default_timetable_database.json`](file:///C:/Users/maury/documents/AttendenceTracker/Track/data/default_timetable_database.json).

## Verification & Integrity Check
Run the deterministic CLI verifier to check the structural integrity of your database:
```bash
node execution/verify_json_db.mjs [path_to_json_file]
```
If no path is passed, it validates `data/default_timetable_database.json`.
