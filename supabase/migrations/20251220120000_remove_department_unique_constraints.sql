-- Remove UNIQUE constraints from departments table to allow duplicate names/codes
-- Departments will be differentiated by their sections

-- Drop the unique constraints (PostgreSQL automatically creates these constraint names)
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_code_key;

-- Alternative constraint names that might exist
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_name_unique;
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_code_unique;

-- Note: We're keeping name and code as NOT NULL, but allowing duplicates
-- This allows multiple departments with the same name/code but different sections
-- Users can differentiate departments by viewing their associated sections
