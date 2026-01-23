# Allow Duplicate Department Names/Codes

## Overview

This update allows multiple departments to have the same name or code. Departments will be differentiated by their sections instead.

## Why This Change?

Previously, the database enforced unique constraints on department names and codes. However, in practice, you might have:
- Multiple "Computer Science and Engineering" departments with different sections
- Same department code (e.g., "CSE") used for different department instances
- Departments that share names but have different section configurations

## Migration Required

You need to run the migration to remove the unique constraints:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy and paste the contents of `supabase/migrations/20251220120000_remove_department_unique_constraints.sql`
5. Click **Run**

### Option 2: Using Supabase CLI

```bash
supabase db reset
# or
supabase migration up
```

## What Changed?

1. **Database**: Removed UNIQUE constraints on `departments.name` and `departments.code`
2. **UI**: 
   - Removed duplicate error message
   - Added "Sections" column to department table to help differentiate departments
   - Sections are displayed as badges showing section name and year (e.g., "A (Y1)", "B (Y2)")

## How to Use

1. **Create departments with same name/code**: You can now create multiple departments with identical names or codes
2. **Differentiate by sections**: Each department can have different sections, which are displayed in the table
3. **View sections**: The sections column shows all sections for each department, making it easy to identify which department you're working with

## Example

You can now have:
- Department 1: "Computer Science & Engineering" (CSE) with sections: A (Y1), B (Y1)
- Department 2: "Computer Science & Engineering" (CSE) with sections: A (Y2), B (Y2), C (Y2)

Both will appear in the list, differentiated by their sections.

## Notes

- Sections are still unique within a department (same section name + department + academic year)
- The department ID (UUID) is still unique and used internally
- When editing, you'll see the sections associated with that specific department
