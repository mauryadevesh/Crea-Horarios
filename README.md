# Weekly Timetable Maker (Crea-Horarios)

A modern, responsive, conflict-free weekly timetable planner and attendance tracker built with React 18, TypeScript, Vite, Tailwind CSS v4, and Framer Motion. Features offline-first local storage, PWA support, and cloud synchronization with Supabase.

---

## Key Features

- **Conflict-Free Schedule Builder**:
  - Interactive weekly schedule grid across all days (Monday to Sunday).
  - Slot configuration with customizable subject, room, start time, end time, and teacher.
  - Automated clash detection warning of room double-bookings and time overlaps
    
- **Offline-First & Cloud Synchronization**:
  - Full functionality with browser `localStorage` without requiring an account.
  - Cloud sync powered by **Supabase** with email/password authentication and Row-Level Security (RLS).
  - Resilient auto-save with 500ms debouncing and unload keepalive flushing.

- **Progressive Web App (PWA)**:
  - Installable on mobile devices and desktop ("Add to Home Screen").
  - Service worker caching with Workbox for fast loading and offline reliability.

- **User Feedback Mechanism**:
  - Collapsible feedback drawer supporting webhook integration or database storage.

---

## Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## Project Structure

```
├── public/                 # Static assets (PWA icons, manifest)
├── src/
│   ├── components/         # UI components
│   │   ├── AddSlotModal.tsx        # Modal to configure and add schedule slots
│   │   ├── Alerts.tsx              # Safe/Risk attendance alert banners
│   │   ├── AuthPanel.tsx           # Supabase auth modal & user session controls
│   │   ├── CalendarHistory.tsx     # Calendar view for historical logs
│   │   ├── DailyLogging.tsx        # Daily class attendance logger
│   │   ├── Dashboard.tsx           # High-level overview dashboard
│   │   ├── ErrorBoundary.tsx       # Fallback UI error boundary
│   │   ├── FeedbackForm.tsx        # Feedback & suggestions submission
│   │   ├── ScheduleGridView.tsx    # Weekly schedule grid layout
│   │   ├── SlotConflictBanner.tsx  # Warning banner for overlapping slots
│   │   ├── SubjectCard.tsx         # Subject details card
│   │   ├── SubjectHistoryModal.tsx # Detailed subject log modal
│   │   ├── TargetMode.tsx          # Target attendance percentage slider
│   │   └── TimetableSetup.tsx      # Subject & slot management tab
│   ├── context/
│   │   └── AttendanceContext.tsx   # React Context provider for state
│   ├── data/
│   │   └── seed.ts                 # Default initial timetable state
│   ├── lib/
│   │   ├── attendance.ts           # Attendance analytics & streak math
│   │   ├── attendance.test.ts      # Unit tests for attendance calculations
│   │   ├── conflicts.ts            # Clash and time-overlap detection
│   │   ├── conflicts.test.ts       # Unit tests for slot conflicts
│   │   ├── constants.ts            # Global constants and storage keys
│   │   ├── storage.ts              # LocalStorage + Supabase sync hook
│   │   ├── supabase.ts             # Supabase client initialization
│   │   └── types.ts                # TypeScript interfaces and types
│   ├── App.tsx                     # Main layout and tab navigation
│   ├── index.css                   # Tailwind v4 styles and custom theme
│   └── main.tsx                    # React application entry point
├── package.json
├── tailwind.config.cjs
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/crea-horarios.git
   cd crea-horarios
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server:

```bash
npm run dev
```

Open your browser at the URL shown in the terminal (typically `http://localhost:5173`).

---

## Available Scripts

- `npm run dev`: Starts the local development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles TypeScript and builds the production bundle into `dist/`.
- `npm run preview`: Locally previews the production build from `dist/`.
- `npm run test`: Launches Vitest in interactive watch mode.
- `npm run test:run`: Runs all Vitest unit tests once and exits.

---

## Environment Variables

To enable cloud authentication, remote synchronization, or feedback webhooks, create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Feedback Webhook (Optional)
VITE_FEEDBACK_WEBHOOK_URL=https://your-webhook-endpoint.com/api/feedback
```

> **Note**: If Supabase variables are omitted, the application will seamlessly operate entirely in offline mode using `localStorage`.

---

## Supabase Database Setup

If using Supabase for cloud sync and authentication:

1. Create a project at [Supabase](https://supabase.com/).
2. Enable the **Email/Password** provider under **Authentication > Providers**.
3. Open the **SQL Editor** in your Supabase dashboard and execute the following SQL to set up tables and Row-Level Security:

```sql
-- 1. Attendance State Table
create table if not exists public.attendance_state (
    user_id uuid primary key references auth.users (id) on delete cascade,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.attendance_state enable row level security;

-- Policies for attendance_state
create policy "Users can read own state" on public.attendance_state
    for select using (auth.uid() = user_id);

create policy "Users can insert own state" on public.attendance_state
    for insert with check (auth.uid() = user_id);

create policy "Users can update own state" on public.attendance_state
    for update using (auth.uid() = user_id);

-- 2. Feedback Table (Optional)
create table if not exists public.feedback (
    id uuid primary key default gen_random_uuid(),
    rating int not null,
    category text not null,
    message text not null,
    email text null,
    created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback" on public.feedback
    for insert with check (true);
```

---

## Running Tests

Unit tests cover the core calculation algorithms (`attendance.ts`) and timetable conflict detection (`conflicts.ts`).

Run the test suite using Vitest:

```bash
npm run test:run
```

---

## Progressive Web App (PWA)

- **Installable**: Open the application in Chromium-based browsers or Safari on iOS and click **"Add to Home Screen"** or the install icon in the address bar.
- **Offline Capable**: Static assets and application shells are cached automatically via Workbox service worker rules.

---

## License

This project is open source and available under the [MIT License](LICENSE).
