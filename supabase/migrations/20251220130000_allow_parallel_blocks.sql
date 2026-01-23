-- Migration to allow parallel blocks in timetable_entries
-- Remove the unique constraint that prevents multiple entries for same section/time slot
-- and replace with a constraint that allows parallel blocks (different rooms/subjects)

-- Drop the existing unique constraint
ALTER TABLE public.timetable_entries 
DROP CONSTRAINT IF EXISTS timetable_entries_timetable_id_section_id_working_day_id_ti_key;

-- Drop the new constraint if it already exists (for idempotency)
ALTER TABLE public.timetable_entries 
DROP CONSTRAINT IF EXISTS timetable_entries_unique_per_slot;

-- Create a new unique constraint that allows multiple entries for the same section/time slot
-- but prevents exact duplicates (same subject, faculty, room)
-- Using a named constraint so ON CONFLICT can reference it
ALTER TABLE public.timetable_entries 
ADD CONSTRAINT timetable_entries_unique_per_slot 
UNIQUE (timetable_id, section_id, working_day_id, time_slot_id, subject_id, faculty_id, classroom_id);

-- Add a comment explaining the change
COMMENT ON CONSTRAINT timetable_entries_unique_per_slot ON public.timetable_entries IS 
'Allows parallel blocks (multiple subjects in same time slot) but prevents exact duplicate entries';
