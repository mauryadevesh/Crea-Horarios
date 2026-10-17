-- Migration: 20261017000000_init_timetable_schema.sql
-- Description: Initialize attendance_state and feedback tables with Row Level Security

create table if not exists public.attendance_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.attendance_state enable row level security;

create policy "Users can read own state"
  on public.attendance_state
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own state"
  on public.attendance_state
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own state"
  on public.attendance_state
  for update
  using (auth.uid() = user_id);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  rating integer not null check (rating >= 1 and rating <= 5),
  category text not null,
  message text not null,
  email text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  with check (true);

create policy "Users can read feedback"
  on public.feedback
  for select
  using (auth.uid() is not null);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_attendance_state_updated_at
  before update on public.attendance_state
  for each row
  execute function public.handle_updated_at();
