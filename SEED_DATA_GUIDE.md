# Seed Data Guide - Real College Timetable

This seed file contains **real college timetable data** for the Computer Science (CSE) department.

## What's Included

### Master Data
- **1 Department**: Computer Science (CSE)
- **1 Academic Year**: 2025–2026, Semester 2 (Active)
- **1 Section**: CSE A (4th Year)
- **8 Time Slots**: Including tea break and lunch break
- **5 Working Days**: Monday, Tuesday, Wednesday, Friday, Saturday
- **4 Classrooms**: 101 CM, 109 CM (Lab), 302 CB, 303 CB
- **8 Faculty Members**: All assigned to CSE department
- **9 Subjects**: Project Work, OB, DP, GAI, RPA, OE/Mentoring, Minor, Sports, Library

### Timetable Entries
- **Monday**: 4 Project Work sessions
- **Tuesday**: DP, GAI, RPA (parallel at 10:00-11:00), OE/Mentoring (3 faculty), Minor
- **Wednesday**: No scheduled classes (free day)
- **Friday**: Sports
- **Saturday**: Library, Minor

### Faculty-Subject Mappings
- Mr. G. Krishna Kishore → Project Work
- Mrs. Ch. Lavanya → Project Work
- Dr. P. Sampoornima → OE / Mentoring
- Mrs. D. Sriveni → OE / Mentoring
- Dr. V. Ranga Rao → OE / Mentoring
- Mrs. K. Anusha → DP
- Mrs. T. Radhika → GAI
- Mrs. M. Nagamani → RPA

## How to Run the Seed File

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **SQL Editor** in the left sidebar
   - Click **New query**

2. **Copy and Paste**
   - Open `supabase/seed.sql` file
   - Copy the entire contents
   - Paste into the SQL Editor

3. **Run the Query**
   - Click **Run** button (or press Ctrl+Enter)
   - Wait for completion

4. **Verify**
   - Check the output at the bottom - it should show counts for each table
   - You should see:
     - 1 Department
     - 1 Academic Year
     - 1 Section
     - 9 Subjects
     - 8 Faculty
     - 4 Classrooms
     - 8 Time Slots
     - ~15 Timetable Entries
     - Faculty Availability records

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd smart-schedule-hub

# Run the seed file
supabase db execute --file supabase/seed.sql
```

## Important Notes

### Multiple Subjects at Same Time
On **Tuesday 10:00-11:00**, there are three subjects scheduled:
- DP (302 CB) - Mrs. K. Anusha
- GAI (303 CB) - Mrs. T. Radhika  
- RPA (101 CM) - Mrs. M. Nagamani

These appear as parallel sessions (likely electives). All three will show in the timetable.

### OE / Mentoring
On **Tuesday 13:55-14:55**, OE/Mentoring has three faculty members:
- Dr. P. Sampoornima (101 CM)
- Mrs. D. Sriveni (302 CB)
- Dr. V. Ranga Rao (303 CB)

These are created as separate entries in different rooms (parallel mentoring sessions).

### Subjects Without Specific Faculty
Some subjects (Minor, Sports, Library) don't have specific faculty assignments in the original data. They are assigned to **Mr. G. Krishna Kishore** as a placeholder. You can update these later if needed.

### Faculty Availability
- All faculty are marked as **available** for all active time slots initially
- Then automatically marked as **unavailable** during their teaching hours based on timetable entries

## After Seeding

1. **Login as Admin**
   - Go to `/timetables` page
   - You should see "CSE A - 2025-2026 Sem 2" timetable
   - Click to view the full schedule

2. **Verify Timetable**
   - Check Monday has 4 Project Work sessions
   - Check Tuesday has DP, GAI, RPA at 10:00-11:00
   - Check Wednesday is empty
   - Check Friday has Sports
   - Check Saturday has Library and Minor

3. **Test Faculty View**
   - Assign a faculty role to a user
   - Login and check their schedule shows only their classes

4. **Test Student View**
   - Assign a student role to a user
   - Login and check they can see the CSE A timetable

## Troubleshooting

### "Relation already exists" errors
- The seed file uses `ON CONFLICT DO NOTHING` to handle existing data
- If you want to start fresh, you can truncate tables first (uncomment the TRUNCATE statements at the top)

### "Unique constraint violation"
- Some tables have unique constraints (email, code, etc.)
- The seed file handles conflicts, but if you see errors, check for duplicate data

### Timetable not showing
- Make sure the timetable is marked as `is_active = true`
- Check that `generation_status = 'completed'`
- Verify timetable_entries exist for that timetable_id

## Next Steps

After seeding:
1. Create admin user accounts
2. Assign faculty roles to users (matching faculty emails)
3. Test swap requests functionality
4. Test substitution functionality
5. Add more sections/departments as needed
