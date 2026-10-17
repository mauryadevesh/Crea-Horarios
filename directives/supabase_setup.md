# SOP: Supabase Project Setup & Connection

## Objective
Establish a secure, authenticated Supabase PostgreSQL connection for cloud synchronization of weekly timetables, lecture logs, and user sessions.

## Prerequisites
- Supabase account (free at https://supabase.com)
- Node.js runtime installed

## Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Choose an organization, enter a name (e.g. `Weekly-Timetable`), and set a strong database password.
4. Select your preferred region and click **Create new project**.

## Step 2: Configure Environment Variables
1. In the Supabase project dashboard, navigate to **Project Settings** > **API**.
2. Locate the following credentials:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys** > `anon` `public` key
3. Open or create `.env` in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
   ```

## Step 3: Enable Email / Password Authentication
1. In Supabase Dashboard, navigate to **Authentication** > **Providers**.
2. Ensure **Email** is enabled.
3. (Optional for development) Disable **Confirm email** under **Authentication** > **URL Configuration / Providers** if you want instant test sign-ups.

## Step 4: Run the Database Migration
1. Go to **SQL Editor** in the Supabase Dashboard.
2. Open the file [`supabase/schema.sql`](file:///C:/Users/maury/documents/AttendenceTracker/Track/supabase/schema.sql).
3. Copy its entire content, paste it into the SQL editor, and click **Run**.
4. Confirm success:
   - `public.attendance_state` table created with Row-Level Security (RLS) policies.
   - `public.feedback` table created with submission policies.
   - Trigger `set_attendance_state_updated_at` active.

## Step 5: Test Connection
Execute the deterministic verification script from your terminal:
```bash
node execution/verify_supabase.mjs
```
The script will perform retries with exponential backoff and verify table accessibility.
