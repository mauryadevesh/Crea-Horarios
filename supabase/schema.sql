-- Supabase Database Schema for Weekly Timetable Maker
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create attendance_state table
create table if not exists public.attendance_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.attendance_state enable row level security;

-- Policies for attendance_state
drop policy if exists "Users can read own state" on public.attendance_state;
create policy "Users can read own state"
  on public.attendance_state
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own state" on public.attendance_state;
create policy "Users can insert own state"
  on public.attendance_state
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own state" on public.attendance_state;
create policy "Users can update own state"
  on public.attendance_state
  for update
  using (auth.uid() = user_id);

-- 2. Create feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  rating integer not null check (rating >= 1 and rating <= 5),
  category text not null,
  message text not null,
  email text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  with check (true);

drop policy if exists "Users can read feedback" on public.feedback;
create policy "Users can read feedback"
  on public.feedback
  for select
  using (auth.uid() is not null);

-- 3. Trigger to maintain updated_at on state changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_attendance_state_updated_at on public.attendance_state;
create trigger set_attendance_state_updated_at
  before update on public.attendance_state
  for each row
  execute function public.handle_updated_at();
