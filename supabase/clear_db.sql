-- ============================================================
-- Smart Schedule Hub - Data Cleanup Script
-- Use this script to DELETE ALL DATA from the database
-- ============================================================

-- 1. Delete from child tables first (to satisfy foreign key constraints)
DELETE FROM public.substitutions;
DELETE FROM public.swap_requests;
DELETE FROM public.timetable_entries;
DELETE FROM public.faculty_availability;
DELETE FROM public.faculty_subjects;

-- 2. Delete main entities
DELETE FROM public.timetables;
DELETE FROM public.subjects;
DELETE FROM public.sections;
DELETE FROM public.faculty;
DELETE FROM public.classrooms;
DELETE FROM public.time_slots;
DELETE FROM public.working_days;
DELETE FROM public.academic_years;
DELETE FROM public.departments;

-- 3. Reset sequences if needed (optional, depends on ID type - here we use UUIDs so mostly not needed)
-- But if there are any serials, we would reset them here.

