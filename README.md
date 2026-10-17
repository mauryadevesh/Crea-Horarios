# College Attendance Calculator

A minimalist, responsive attendance tracker with light/dark mode, animated UI, and local persistence.

## Features
- Weekly timetable setup
- Daily logging (Attended / Missed / Cancelled)
- Mark day as holiday
- Target attendance slider (default 75%)
- Safe zone calculations (recover / bunkable)
- Dashboard with donut chart
- Calendar history view
- Subject drill-down history
- Subject notes and edits
- LocalStorage persistence

## Tech Stack
- React + TypeScript (Vite)
- Tailwind CSS
- Framer Motion

## Run locally
1. Install dependencies
2. Start the dev server

### Commands
- `npm install`
- `npm run dev`
- `npm run test:run`

## Supabase Setup (Database & Auth)

1. **Create a Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2. **Enable Auth**: Go to **Authentication > Providers** and enable **Email/Password**.
3. **Database Schema**: Run the following SQL in the **SQL Editor** to create the necessary tables and security policies:

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

-- 2. Feedback Table (Optional - for logging feedback in DB)
create table if not exists public.feedback (
	id uuid primary key default gen_random_uuid(),
	rating int not null,
	category text not null,
	message text not null,
	email text null,
	created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
create policy "Anyone can submit feedback" on public.feedback for insert with check (true);
```

## Environment Variables

1. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your credentials from the Supabase Dashboard (**Project Settings > API**):
   - `VITE_SUPABASE_URL`: Your Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your `anon` public key.
   - `VITE_FEEDBACK_WEBHOOK_URL`: (Optional) URL for a webhook if you wish to receive feedback notifications.

## PWA
- The app includes a manifest and service worker.
- Install it from the browser menu ("Add to Home Screen").

## Project Structure
- `src/lib` core logic and storage
- `src/components` UI components
- `src/data` seed state
=======
# Crea-Horarios
A timetable maker to be used in Colleges and Schools.
