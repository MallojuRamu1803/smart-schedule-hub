# How to Run SQL Migrations

This guide explains how to run the database migrations for Smart Schedule Hub.

## Migration Files

You need to run these two migration files **in order**:

1. `supabase/migrations/20251217170922_66949a57-a167-489c-ae16-e18a93f29aaa.sql` - Creates all main tables
2. `supabase/migrations/20251220111402_c39e2317-65b2-4a89-829a-b20244105993.sql` - Adds substitutions, swap requests, and templates

---

## Method 1: Using Supabase Dashboard (Easiest - Recommended)

This method works for remote Supabase projects.

### Step 1: Access SQL Editor
1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project (or create a new one)
3. In the left sidebar, click on **"SQL Editor"**
4. Click **"New query"** button

### Step 2: Run First Migration
1. Open the first migration file:
   - Navigate to `supabase/migrations/20251217170922_66949a57-a167-489c-ae16-e18a93f29aaa.sql`
   - Copy **ALL** the contents (Ctrl+A, then Ctrl+C)
2. Paste the SQL into the SQL Editor
3. Click **"Run"** button (or press Ctrl+Enter)
4. Wait for success message: "Success. No rows returned"

### Step 3: Run Second Migration
1. Click **"New query"** again (or clear the editor)
2. Open the second migration file:
   - Navigate to `supabase/migrations/20251220111402_c39e2317-65b2-4a89-829a-b20244105993.sql`
   - Copy **ALL** the contents
3. Paste the SQL into the SQL Editor
4. Click **"Run"** button
5. Wait for success message

### Step 4: Verify Migrations
1. Go to **"Table Editor"** in the left sidebar
2. You should see tables like:
   - `departments`
   - `faculty`
   - `subjects`
   - `timetables`
   - `substitutions`
   - `swap_requests`
   - And many more...

✅ **Done!** Your database is now set up.

---

## Method 2: Using Supabase CLI (For Local Development)

This method is for running Supabase locally or managing remote projects via CLI.

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

Or using other package managers:
- **Windows (Scoop)**: `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` then `scoop install supabase`
- **macOS (Homebrew)**: `brew install supabase/tap/supabase`
- **Linux**: Download from [Supabase CLI releases](https://github.com/supabase/cli/releases)

### Step 2: Login to Supabase
```bash
supabase login
```
This will open a browser window for authentication.

### Step 3: Link Your Project (Remote) OR Start Local

**For Remote Project:**
```bash
# Link to your remote project
supabase link --project-ref your-project-ref
# Find your project-ref in your Supabase project URL
# Example: https://xxxxx.supabase.co -> project-ref is xxxxx
```

**For Local Project:**
```bash
# Start local Supabase (requires Docker)
supabase start
```

### Step 4: Run Migrations

**For Remote Project:**
```bash
# Push migrations to remote database
supabase db push
```

**For Local Project:**
```bash
# Reset database and apply all migrations
supabase db reset

# OR apply new migrations only
supabase migration up
```

### Step 5: Verify
```bash
# Check migration status
supabase migration list
```

✅ **Done!** Migrations are applied.

---

## Method 3: Using psql (Advanced)

If you have direct database access via PostgreSQL client.

### Step 1: Get Connection String
From Supabase Dashboard:
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy the **URI** or use **Host**, **Database name**, **Port**, **User**, **Password**

### Step 2: Connect and Run
```bash
# Connect to database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Or using individual parameters
psql -h db.[YOUR-PROJECT-REF].supabase.co -U postgres -d postgres -p 5432
```

### Step 3: Run Migrations
Once connected, you can run SQL directly:

```sql
-- Run first migration
\i supabase/migrations/20251217170922_66949a57-a167-489c-ae16-e18a93f29aaa.sql

-- Run second migration
\i supabase/migrations/20251220111402_c39e2317-65b2-4a89-829a-b20244105993.sql
```

Or copy-paste the SQL content directly.

✅ **Done!**

---

## Method 4: Using Supabase CLI Init (Fresh Start)

If starting a completely new project and want to use migrations from the start:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to remote project OR start local
supabase link --project-ref your-project-ref
# OR
supabase start

# Apply all migrations
supabase db push  # for remote
# OR
supabase db reset  # for local
```

---

## Troubleshooting

### Error: "relation already exists"
**Problem**: You're trying to run migrations that were already run.

**Solution**: 
- Check if tables already exist in Table Editor
- If they exist, you can skip the migration or drop the database and start fresh
- For fresh start: In SQL Editor, run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` (⚠️ **WARNING**: This deletes all data!)

### Error: "syntax error" or "permission denied"
**Problem**: SQL might be incomplete or you don't have permissions.

**Solution**:
- Make sure you copied the **entire** file contents
- Verify you're using the project owner account or have admin access
- Check that you're running migrations in the correct order

### Error: "migration already applied" (CLI)
**Problem**: Migration was already run.

**Solution**:
```bash
# Check which migrations are applied
supabase migration list

# If you need to re-run, you might need to mark as not applied
# (Advanced - only if you know what you're doing)
```

### Migrations Not Showing in Dashboard
**Problem**: After running via CLI, changes might not immediately appear in Dashboard.

**Solution**:
- Refresh the Supabase Dashboard
- Go to Table Editor and refresh
- Wait a few seconds and try again

---

## Verification Checklist

After running migrations, verify these tables exist:

**Main Tables:**
- [ ] `departments`
- [ ] `academic_years`
- [ ] `sections`
- [ ] `subjects`
- [ ] `faculty`
- [ ] `faculty_subjects`
- [ ] `classrooms`
- [ ] `time_slots`
- [ ] `working_days`
- [ ] `faculty_availability`
- [ ] `timetables`
- [ ] `timetable_entries`
- [ ] `user_roles`
- [ ] `profiles`

**Additional Tables (from second migration):**
- [ ] `substitutions`
- [ ] `swap_requests`
- [ ] `timetable_versions`
- [ ] `timetable_templates`

**Verify Default Data:**
- [ ] `working_days` has 7 rows (Monday-Sunday)
- [ ] `time_slots` has 9 rows (with breaks)

---

## Quick Reference

**Recommended for beginners:** Method 1 (Supabase Dashboard)
**Recommended for developers:** Method 2 (Supabase CLI)
**For direct database access:** Method 3 (psql)

**Always run migrations in order:**
1. First: `20251217170922_...sql`
2. Then: `20251220111402_...sql`

