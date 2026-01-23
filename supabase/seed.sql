-- ============================================================
-- Smart Schedule Hub - Seed Data
-- Real College Timetable Data for CSE Department
-- Based on actual timetable image
-- ============================================================
-- 
-- IMPORTANT: Before running this seed file, you MUST run the migration:
-- supabase/migrations/20251220130000_allow_parallel_blocks.sql
-- 
-- This migration is required to allow parallel blocks (multiple subjects
-- in the same time slot) in timetable_entries.
-- ============================================================

DO $$
DECLARE
  dept_id UUID;
  acad_year_id UUID;
  v_section_id UUID;
  v_section_a_id UUID;
  v_timetable_id UUID;
  v_timetable_a_id UUID;
  proj_work_subj_id UUID;
  ob_subj_id UUID;
  dp_subj_id UUID;
  gai_subj_id UUID;
  rpa_subj_id UUID;
  oe_subj_id UUID;
  minor_subj_id UUID;
  sports_subj_id UUID;
  lib_subj_id UUID;
  interaction_guide_subj_id UUID;
  minor_interaction_subj_id UUID;
  minor_sports_subj_id UUID;
  -- CSE-A subject IDs
  proj_work_a_subj_id UUID;
  ob_a_subj_id UUID;
  dp_a_subj_id UUID;
  gai_a_subj_id UUID;
  rpa_a_subj_id UUID;
  oe_mentoring_a_subj_id UUID;
  minor_guide_a_subj_id UUID;
  lib_a_subj_id UUID;
  sports_a_subj_id UUID;
  interaction_guide_a_subj_id UUID;
  minor_sports_a_subj_id UUID;
  krishna_faculty_id UUID;
  lavanya_faculty_id UUID;
  sampoornima_faculty_id UUID;
  sriveni_faculty_id UUID;
  ramakrishna_faculty_id UUID;
  anusha_faculty_id UUID;
  ratna_sirisha_faculty_id UUID;
  radhika_faculty_id UUID;
  nagamani_faculty_id UUID;
  singam_cs_faculty_id UUID;
  spandana_faculty_id UUID;
  swathi_faculty_id UUID;
  bharat_faculty_id UUID;
  sudhakar_faculty_id UUID;
  sudha_dharani_faculty_id UUID;
  room_101_cm_id UUID;
  room_109_cm_id UUID;
  room_302_cb_id UUID;
  room_303_cb_id UUID;
  room_206_cm_id UUID;
  room_library_id UUID;
  monday_id UUID;
  tuesday_id UUID;
  wednesday_id UUID;
  friday_id UUID;
  saturday_id UUID;
  slot_09_10_id UUID;
  slot_10_11_id UUID;
  slot_11_10_12_10_id UUID;
  slot_12_10_13_10_id UUID;
  slot_13_55_14_55_id UUID;
  slot_14_55_15_55_id UUID;
BEGIN

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
  INSERT INTO public.departments (id, name, code, created_at)
  VALUES (gen_random_uuid(), 'Computer Science', 'CSE', now())
  ON CONFLICT DO NOTHING
  RETURNING id INTO dept_id;
  
  -- If conflict, get existing ID
  IF dept_id IS NULL THEN
    SELECT id INTO dept_id FROM public.departments WHERE code = 'CSE' LIMIT 1;
  END IF;

-- ============================================================
-- 2. ACADEMIC YEARS
-- ============================================================
  INSERT INTO public.academic_years (id, year, semester, is_active, created_at)
  VALUES (gen_random_uuid(), '2025–2026', 2, true, now())
  ON CONFLICT (year, semester) DO UPDATE SET is_active = true
  RETURNING id INTO acad_year_id;

-- ============================================================
-- 3. SECTIONS
-- ============================================================
  -- CSE-C Section
  INSERT INTO public.sections (id, name, department_id, academic_year_id, year_of_study, created_at)
  VALUES (gen_random_uuid(), 'C', dept_id, acad_year_id, 4, now())
  ON CONFLICT (name, department_id, academic_year_id) DO NOTHING
  RETURNING id INTO v_section_id;
  
  IF v_section_id IS NULL THEN
    SELECT id INTO v_section_id FROM public.sections 
    WHERE name = 'C' AND department_id = dept_id AND academic_year_id = acad_year_id LIMIT 1;
  END IF;

  -- CSE-A Section
  INSERT INTO public.sections (id, name, department_id, academic_year_id, year_of_study, created_at)
  VALUES (gen_random_uuid(), 'A', dept_id, acad_year_id, 4, now())
  ON CONFLICT (name, department_id, academic_year_id) DO NOTHING
  RETURNING id INTO v_section_a_id;
  
  IF v_section_a_id IS NULL THEN
    SELECT id INTO v_section_a_id FROM public.sections 
    WHERE name = 'A' AND department_id = dept_id AND academic_year_id = acad_year_id LIMIT 1;
  END IF;

-- ============================================================
-- 4. TIME SLOTS
-- Delete existing time slots and insert new ones with correct times
-- Must delete dependent records first to avoid foreign key violations
-- ============================================================
  -- Delete dependent records first (in order of dependencies)
  DELETE FROM public.substitutions;
  DELETE FROM public.swap_requests;
  DELETE FROM public.faculty_availability;
  DELETE FROM public.timetable_entries;
  DELETE FROM public.time_slots;
  
  -- Insert the correct time slots
  INSERT INTO public.time_slots (id, start_time, end_time, slot_order, is_break, break_name, created_at)
  VALUES 
    (gen_random_uuid(), '09:00', '10:00', 1, false, NULL, now()),
    (gen_random_uuid(), '10:00', '11:00', 2, false, NULL, now()),
    (gen_random_uuid(), '11:00', '11:10', 3, true, 'Tea Break', now()),
    (gen_random_uuid(), '11:10', '12:10', 4, false, NULL, now()),
    (gen_random_uuid(), '12:10', '13:10', 5, false, NULL, now()),
    (gen_random_uuid(), '13:10', '13:55', 6, true, 'Lunch Break', now()),
    (gen_random_uuid(), '13:55', '14:55', 7, false, NULL, now()),
    (gen_random_uuid(), '14:55', '15:55', 8, false, NULL, now());

  -- Get time slot IDs
  SELECT id INTO slot_09_10_id FROM public.time_slots WHERE start_time = '09:00' AND end_time = '10:00' LIMIT 1;
  SELECT id INTO slot_10_11_id FROM public.time_slots WHERE start_time = '10:00' AND end_time = '11:00' LIMIT 1;
  SELECT id INTO slot_11_10_12_10_id FROM public.time_slots WHERE start_time = '11:10' AND end_time = '12:10' LIMIT 1;
  SELECT id INTO slot_12_10_13_10_id FROM public.time_slots WHERE start_time = '12:10' AND end_time = '13:10' LIMIT 1;
  SELECT id INTO slot_13_55_14_55_id FROM public.time_slots WHERE start_time = '13:55' AND end_time = '14:55' LIMIT 1;
  SELECT id INTO slot_14_55_15_55_id FROM public.time_slots WHERE start_time = '14:55' AND end_time = '15:55' LIMIT 1;

-- ============================================================
-- 5. WORKING DAYS
-- ============================================================
  UPDATE public.working_days SET is_active = false;
  UPDATE public.working_days SET is_active = true WHERE day_name IN ('Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday');
  
  SELECT id INTO monday_id FROM public.working_days WHERE day_name = 'Monday' LIMIT 1;
  SELECT id INTO tuesday_id FROM public.working_days WHERE day_name = 'Tuesday' LIMIT 1;
  SELECT id INTO wednesday_id FROM public.working_days WHERE day_name = 'Wednesday' LIMIT 1;
  SELECT id INTO friday_id FROM public.working_days WHERE day_name = 'Friday' LIMIT 1;
  SELECT id INTO saturday_id FROM public.working_days WHERE day_name = 'Saturday' LIMIT 1;

-- ============================================================
-- 6. CLASSROOMS
-- ============================================================
  INSERT INTO public.classrooms (id, name, capacity, is_lab, created_at)
  VALUES 
    (gen_random_uuid(), '101 CM', 60, false, now()),
    (gen_random_uuid(), '109 CM', 30, true, now()),
    (gen_random_uuid(), '302 CB', 60, false, now()),
    (gen_random_uuid(), '303 CB', 60, false, now()),
    (gen_random_uuid(), '206 CM', 60, true, now()),
    (gen_random_uuid(), 'Library', 60, false, now())
  ON CONFLICT (name) DO NOTHING;

  SELECT id INTO room_101_cm_id FROM public.classrooms WHERE name = '101 CM' LIMIT 1;
  SELECT id INTO room_109_cm_id FROM public.classrooms WHERE name = '109 CM' LIMIT 1;
  SELECT id INTO room_302_cb_id FROM public.classrooms WHERE name = '302 CB' LIMIT 1;
  SELECT id INTO room_303_cb_id FROM public.classrooms WHERE name = '303 CB' LIMIT 1;
  SELECT id INTO room_206_cm_id FROM public.classrooms WHERE name = '206 CM' LIMIT 1;
  SELECT id INTO room_library_id FROM public.classrooms WHERE name = 'Library' LIMIT 1;

-- ============================================================
-- 7. FACULTY
-- ============================================================
  INSERT INTO public.faculty (id, name, email, department_id, created_at)
  VALUES 
    (gen_random_uuid(), 'Mr. G. Krishna Kishore', 'krishna.kishore@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. Ch. Lavanya', 'lavanya@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Dr. P. Sampoornima', 'sampoornima@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. D. Sriveni', 'sriveni@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Dr. V. Ramakrishna', 'ramakrishna.v@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. K. Anusha', 'anusha@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Ms.M. Ratna Sirisha', 'ratna.sirisha@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. T. Radhika', 'radhika@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. M. Nagamani', 'nagamani@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mr. Singam Chandra Sekhar', 'singam.chandra.sekhar@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Ms. V. Spandana', 'v.spandana@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Ms. O. Swathi', 'o.swathi@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mr. A. Bharat', 'a.bharat@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mr. P. Sudhakar', 'p.sudhakar@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Ms. R. Sudha Dharani', 'r.sudha.dharani@college.edu', dept_id, now())
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO krishna_faculty_id FROM public.faculty WHERE name = 'Mr. G. Krishna Kishore' LIMIT 1;
  SELECT id INTO lavanya_faculty_id FROM public.faculty WHERE name = 'Mrs. Ch. Lavanya' LIMIT 1;
  SELECT id INTO sampoornima_faculty_id FROM public.faculty WHERE name = 'Dr. P. Sampoornima' LIMIT 1;
  SELECT id INTO sriveni_faculty_id FROM public.faculty WHERE name = 'Mrs. D. Sriveni' LIMIT 1;
  SELECT id INTO ramakrishna_faculty_id FROM public.faculty WHERE name = 'Dr. V. Ramakrishna' LIMIT 1;
  SELECT id INTO anusha_faculty_id FROM public.faculty WHERE name = 'Mrs. K. Anusha' LIMIT 1;
  SELECT id INTO ratna_sirisha_faculty_id FROM public.faculty WHERE name = 'Ms.M. Ratna Sirisha' LIMIT 1;
  SELECT id INTO radhika_faculty_id FROM public.faculty WHERE name = 'Mrs. T. Radhika' LIMIT 1;
  SELECT id INTO nagamani_faculty_id FROM public.faculty WHERE name = 'Mrs. M. Nagamani' LIMIT 1;
  SELECT id INTO singam_cs_faculty_id FROM public.faculty WHERE name = 'Mr. Singam Chandra Sekhar' LIMIT 1;
  SELECT id INTO spandana_faculty_id FROM public.faculty WHERE name = 'Ms. V. Spandana' LIMIT 1;
  SELECT id INTO swathi_faculty_id FROM public.faculty WHERE name = 'Ms. O. Swathi' LIMIT 1;
  SELECT id INTO bharat_faculty_id FROM public.faculty WHERE name = 'Mr. A. Bharat' LIMIT 1;
  SELECT id INTO sudhakar_faculty_id FROM public.faculty WHERE name = 'Mr. P. Sudhakar' LIMIT 1;
  SELECT id INTO sudha_dharani_faculty_id FROM public.faculty WHERE name = 'Ms. R. Sudha Dharani' LIMIT 1;

-- ============================================================
-- 8. SUBJECTS
-- ============================================================
  INSERT INTO public.subjects (id, name, code, subject_type, weekly_hours, section_id, created_at)
  VALUES 
    -- Note: DB constraint allows max 10 weekly_hours; using 10 even though timetable has 12+ actual periods
    (gen_random_uuid(), 'Project Work (New Cellar)', 'PROJ_NEW_CELLAR', 'lab', 10, v_section_id, now()),
    (gen_random_uuid(), 'OB', 'OB', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'DP', 'DP', 'lab', 3, v_section_id, now()),
    (gen_random_uuid(), 'GAI', 'GAI', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'RPA', 'RPA', 'lab', 3, v_section_id, now()),
    (gen_random_uuid(), 'OE / Library', 'OE_LIB', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'Mentoring', 'MENTOR', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Minor', 'MINOR', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'Library', 'LIB', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Sports', 'SPORTS', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Interaction with Guide', 'GUIDE_INT', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Minor/Interaction with guide', 'MINOR_GUIDE', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Minor/Sports', 'MINOR_SPORTS', 'theory', 1, v_section_id, now())
  ON CONFLICT (code) DO NOTHING;

  SELECT id INTO proj_work_subj_id FROM public.subjects s WHERE s.name = 'Project Work (New Cellar)' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO ob_subj_id FROM public.subjects s WHERE s.name = 'OB' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO dp_subj_id FROM public.subjects s WHERE s.name = 'DP' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO gai_subj_id FROM public.subjects s WHERE s.name = 'GAI' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO rpa_subj_id FROM public.subjects s WHERE s.name = 'RPA' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO oe_subj_id FROM public.subjects s WHERE s.name = 'OE / Library' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO minor_subj_id FROM public.subjects s WHERE s.name = 'Minor' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO sports_subj_id FROM public.subjects s WHERE s.name = 'Sports' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO lib_subj_id FROM public.subjects s WHERE s.name = 'Library' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO interaction_guide_subj_id FROM public.subjects s WHERE s.name = 'Interaction with Guide' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO minor_interaction_subj_id FROM public.subjects s WHERE s.name = 'Minor/Interaction with guide' AND s.section_id = v_section_id LIMIT 1;
  SELECT id INTO minor_sports_subj_id FROM public.subjects s WHERE s.name = 'Minor/Sports' AND s.section_id = v_section_id LIMIT 1;

-- ============================================================
-- 8B. SUBJECTS FOR CSE-A
-- ============================================================
  INSERT INTO public.subjects (id, name, code, subject_type, weekly_hours, section_id, created_at)
  VALUES 
    (gen_random_uuid(), 'Project Work', 'PROJ_A', 'lab', 10, v_section_a_id, now()),
    (gen_random_uuid(), 'OB', 'OB_A', 'theory', 3, v_section_a_id, now()),
    (gen_random_uuid(), 'DP', 'DP_A', 'lab', 3, v_section_a_id, now()),
    (gen_random_uuid(), 'GAI', 'GAI_A', 'theory', 3, v_section_a_id, now()),
    (gen_random_uuid(), 'RPA', 'RPA_A', 'lab', 3, v_section_a_id, now()),
    (gen_random_uuid(), 'OE / Mentoring', 'OE_MENTOR_A', 'theory', 1, v_section_a_id, now()),
    (gen_random_uuid(), 'Minor / Interaction with Guide', 'MINOR_GUIDE_A', 'theory', 1, v_section_a_id, now()),
    (gen_random_uuid(), 'Library', 'LIB_A', 'theory', 1, v_section_a_id, now()),
    (gen_random_uuid(), 'Sports', 'SPORTS_A', 'theory', 1, v_section_a_id, now()),
    (gen_random_uuid(), 'Interaction with Guide', 'GUIDE_INT_A', 'theory', 1, v_section_a_id, now()),
    (gen_random_uuid(), 'Minor / Sports', 'MINOR_SPORTS_A', 'theory', 1, v_section_a_id, now())
  ON CONFLICT (code) DO NOTHING;

  SELECT id INTO proj_work_a_subj_id FROM public.subjects s WHERE s.name = 'Project Work' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO ob_a_subj_id FROM public.subjects s WHERE s.name = 'OB' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO dp_a_subj_id FROM public.subjects s WHERE s.name = 'DP' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO gai_a_subj_id FROM public.subjects s WHERE s.name = 'GAI' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO rpa_a_subj_id FROM public.subjects s WHERE s.name = 'RPA' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO oe_mentoring_a_subj_id FROM public.subjects s WHERE s.name = 'OE / Mentoring' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO minor_guide_a_subj_id FROM public.subjects s WHERE s.name = 'Minor / Interaction with Guide' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO lib_a_subj_id FROM public.subjects s WHERE s.name = 'Library' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO sports_a_subj_id FROM public.subjects s WHERE s.name = 'Sports' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO interaction_guide_a_subj_id FROM public.subjects s WHERE s.name = 'Interaction with Guide' AND s.section_id = v_section_a_id LIMIT 1;
  SELECT id INTO minor_sports_a_subj_id FROM public.subjects s WHERE s.name = 'Minor / Sports' AND s.section_id = v_section_a_id LIMIT 1;

-- ============================================================
-- 9. FACULTY-SUBJECT MAPPING
-- ============================================================
  INSERT INTO public.faculty_subjects (id, faculty_id, subject_id, created_at)
  VALUES 
    -- Project Work (New Cellar) faculty
    (gen_random_uuid(), nagamani_faculty_id, proj_work_subj_id, now()),
    (gen_random_uuid(), singam_cs_faculty_id, proj_work_subj_id, now()),
    (gen_random_uuid(), spandana_faculty_id, proj_work_subj_id, now()),
    (gen_random_uuid(), swathi_faculty_id, proj_work_subj_id, now()),
    (gen_random_uuid(), bharat_faculty_id, proj_work_subj_id, now()),
    (gen_random_uuid(), anusha_faculty_id, proj_work_subj_id, now()),
    -- OB, DP, GAI, RPA (faculty not mentioned in image, mapped to available faculty)
    (gen_random_uuid(), sudhakar_faculty_id, ob_subj_id, now()),
    (gen_random_uuid(), anusha_faculty_id, dp_subj_id, now()),
    (gen_random_uuid(), spandana_faculty_id, dp_subj_id, now()),
    (gen_random_uuid(), swathi_faculty_id, gai_subj_id, now()),
    (gen_random_uuid(), bharat_faculty_id, rpa_subj_id, now()),
    -- OE / Library and Minor/Library/Sports related
    (gen_random_uuid(), sudha_dharani_faculty_id, oe_subj_id, now()),
    (gen_random_uuid(), sudhakar_faculty_id, minor_subj_id, now()),
    (gen_random_uuid(), sudhakar_faculty_id, interaction_guide_subj_id, now()),
    (gen_random_uuid(), sudhakar_faculty_id, minor_interaction_subj_id, now()),
    (gen_random_uuid(), sudhakar_faculty_id, minor_sports_subj_id, now()),
    -- Mentoring
    (gen_random_uuid(), sudhakar_faculty_id, (SELECT id FROM public.subjects WHERE code = 'MENTOR' AND section_id = v_section_id LIMIT 1), now()),
    (gen_random_uuid(), sudha_dharani_faculty_id, (SELECT id FROM public.subjects WHERE code = 'MENTOR' AND section_id = v_section_id LIMIT 1), now())
  ON CONFLICT (faculty_id, subject_id) DO NOTHING;

-- ============================================================
-- 9B. FACULTY-SUBJECT MAPPING FOR CSE-A
-- ============================================================
  INSERT INTO public.faculty_subjects (id, faculty_id, subject_id, created_at)
  VALUES 
    -- Project Work faculty for CSE-A (using multiple faculty)
    (gen_random_uuid(), krishna_faculty_id, proj_work_a_subj_id, now()),
    (gen_random_uuid(), lavanya_faculty_id, proj_work_a_subj_id, now()),
    (gen_random_uuid(), anusha_faculty_id, proj_work_a_subj_id, now()),
    (gen_random_uuid(), radhika_faculty_id, proj_work_a_subj_id, now()),
    -- OB, DP, GAI, RPA for CSE-A
    (gen_random_uuid(), sampoornima_faculty_id, ob_a_subj_id, now()),
    (gen_random_uuid(), anusha_faculty_id, dp_a_subj_id, now()),
    (gen_random_uuid(), radhika_faculty_id, gai_a_subj_id, now()),
    (gen_random_uuid(), nagamani_faculty_id, rpa_a_subj_id, now()),
    -- OE/Mentoring and other subjects for CSE-A
    (gen_random_uuid(), sampoornima_faculty_id, oe_mentoring_a_subj_id, now()),
    (gen_random_uuid(), sriveni_faculty_id, oe_mentoring_a_subj_id, now()),
    (gen_random_uuid(), ramakrishna_faculty_id, oe_mentoring_a_subj_id, now()),
    (gen_random_uuid(), krishna_faculty_id, minor_guide_a_subj_id, now()),
    (gen_random_uuid(), krishna_faculty_id, interaction_guide_a_subj_id, now()),
    (gen_random_uuid(), krishna_faculty_id, minor_sports_a_subj_id, now()),
    (gen_random_uuid(), krishna_faculty_id, lib_a_subj_id, now())
  ON CONFLICT (faculty_id, subject_id) DO NOTHING;

-- ============================================================
-- 10. CREATE TIMETABLES
-- ============================================================
  -- CSE-C Timetable
  DELETE FROM public.timetables WHERE name = 'CSE C - 2025-2026 Sem 2';
  
  INSERT INTO public.timetables (id, name, academic_year_id, generated_at, is_active, generation_status, created_at)
  VALUES (gen_random_uuid(), 'CSE C - 2025-2026 Sem 2', acad_year_id, now(), true, 'completed', now())
  RETURNING id INTO v_timetable_id;

  -- CSE-A Timetable
  DELETE FROM public.timetables WHERE name = 'CSE A - 2025-2026 Sem 2';
  
  INSERT INTO public.timetables (id, name, academic_year_id, generated_at, is_active, generation_status, created_at)
  VALUES (gen_random_uuid(), 'CSE A - 2025-2026 Sem 2', acad_year_id, now(), true, 'completed', now())
  RETURNING id INTO v_timetable_a_id;

-- ============================================================
-- 11. TIMETABLE ENTRIES - EXACTLY AS PER CSE-C TIMETABLE
-- ============================================================
  -- MONDAY (CSE-C)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: Project Work (New Cellar) – Ms. Nagamani – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, nagamani_faculty_id, room_303_cb_id, monday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Project Work (New Cellar) – Ms. Nagamani – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, nagamani_faculty_id, room_303_cb_id, monday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work (New Cellar) – Ms. Nagamani – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, nagamani_faculty_id, room_303_cb_id, monday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (New Cellar) – Mr. Singam Chandra Sekhar – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, singam_cs_faculty_id, room_303_cb_id, monday_id, slot_12_10_13_10_id, false, now()),
    -- 13:55–14:55: — (no class)
    -- 14:55–15:55: Project Work (New Cellar) – Ms. O. Swathi – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, swathi_faculty_id, room_303_cb_id, monday_id, slot_14_55_15_55_id, false, now());

  -- TUESDAY (CSE-C)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: OB – Faculty Not Mentioned – 303 CB (mapped to Mr. P. Sudhakar)
    (gen_random_uuid(), v_timetable_id, v_section_id, ob_subj_id, sudhakar_faculty_id, room_303_cb_id, tuesday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Parallel block – DP (B1), DP (B2), GAI, RPA
    (gen_random_uuid(), v_timetable_id, v_section_id, dp_subj_id, anusha_faculty_id, room_302_cb_id, tuesday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, dp_subj_id, spandana_faculty_id, room_302_cb_id, tuesday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, gai_subj_id, swathi_faculty_id, room_303_cb_id, tuesday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, rpa_subj_id, bharat_faculty_id, room_206_cm_id, tuesday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work – Mr. A. Bharat – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, bharat_faculty_id, room_303_cb_id, tuesday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work – Mr. A. Bharat – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, bharat_faculty_id, room_303_cb_id, tuesday_id, slot_12_10_13_10_id, false, now()),
    -- 13:55–14:55: OE / Library – Library (mapped to Ms. R. Sudha Dharani)
    (gen_random_uuid(), v_timetable_id, v_section_id, oe_subj_id, sudha_dharani_faculty_id, room_library_id, tuesday_id, slot_13_55_14_55_id, false, now()),
    -- 14:55–15:55: Minor / Interaction with Guide – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, minor_interaction_subj_id, sudhakar_faculty_id, room_303_cb_id, tuesday_id, slot_14_55_15_55_id, false, now());

  -- WEDNESDAY (CSE-C)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: Project Work (New Cellar) – Mr. Singam Chandra Sekhar – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, singam_cs_faculty_id, room_303_cb_id, wednesday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Project Work (New Cellar) – Mr. Singam Chandra Sekhar – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, singam_cs_faculty_id, room_303_cb_id, wednesday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work (New Cellar) – Mr. Singam Chandra Sekhar – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, singam_cs_faculty_id, room_303_cb_id, wednesday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (New Cellar) – Ms. V. Spandana – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, spandana_faculty_id, room_303_cb_id, wednesday_id, slot_12_10_13_10_id, false, now()),
    -- 13:55–14:55: — (no class)
    -- 14:55–15:55: Project Work (New Cellar) – Ms. V. Spandana – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, spandana_faculty_id, room_303_cb_id, wednesday_id, slot_14_55_15_55_id, false, now());

  -- FRIDAY (CSE-C)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: OB – Faculty Not Mentioned – 303 CB (mapped to Mr. P. Sudhakar)
    (gen_random_uuid(), v_timetable_id, v_section_id, ob_subj_id, sudhakar_faculty_id, room_303_cb_id, friday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Parallel block – DP (B1), DP (B2), GAI, RPA
    (gen_random_uuid(), v_timetable_id, v_section_id, dp_subj_id, anusha_faculty_id, room_302_cb_id, friday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, dp_subj_id, spandana_faculty_id, room_302_cb_id, friday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, gai_subj_id, swathi_faculty_id, room_303_cb_id, friday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, rpa_subj_id, bharat_faculty_id, room_206_cm_id, friday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work (New Cellar) – Mr. Singam Chandra Sekhar – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, singam_cs_faculty_id, room_303_cb_id, friday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: — (no class)
    -- 13:55–14:55: Mentoring – Mr. P. Sudhakar, Ms. R. Sudha Dharani – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, (SELECT id FROM public.subjects WHERE code = 'MENTOR' AND section_id = v_section_id LIMIT 1), sudhakar_faculty_id, room_303_cb_id, friday_id, slot_13_55_14_55_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, (SELECT id FROM public.subjects WHERE code = 'MENTOR' AND section_id = v_section_id LIMIT 1), sudha_dharani_faculty_id, room_303_cb_id, friday_id, slot_13_55_14_55_id, false, now()),
    -- 14:55–15:55: Minor / Interaction with Guide – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, minor_interaction_subj_id, sudhakar_faculty_id, room_303_cb_id, friday_id, slot_14_55_15_55_id, false, now());

  -- SATURDAY (CSE-C)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: OB – Faculty Not Mentioned – 303 CB (mapped to Mr. P. Sudhakar)
    (gen_random_uuid(), v_timetable_id, v_section_id, ob_subj_id, sudhakar_faculty_id, room_303_cb_id, saturday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: DP (B1), DP (B2) – 302 CB, 306 CB (no GAI/RPA on Saturday)
    (gen_random_uuid(), v_timetable_id, v_section_id, dp_subj_id, anusha_faculty_id, room_302_cb_id, saturday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_id, v_section_id, dp_subj_id, spandana_faculty_id, room_302_cb_id, saturday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work (New Cellar) – Mrs. K. Anusha – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, proj_work_subj_id, anusha_faculty_id, room_303_cb_id, saturday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: — (no class)
    -- 13:55–14:55: Interaction with Guide – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, interaction_guide_subj_id, sudhakar_faculty_id, room_303_cb_id, saturday_id, slot_13_55_14_55_id, false, now()),
    -- 14:55–15:55: Minor / Sports – 303 CB
    (gen_random_uuid(), v_timetable_id, v_section_id, minor_sports_subj_id, sudhakar_faculty_id, room_303_cb_id, saturday_id, slot_14_55_15_55_id, false, now());

-- ============================================================
-- 11B. TIMETABLE ENTRIES FOR CSE-A
-- ============================================================
  -- MONDAY (CSE-A)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: Project Work (101 CM) - Faculty A
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, krishna_faculty_id, room_101_cm_id, monday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Project Work (101 CM) - Faculty A
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, krishna_faculty_id, room_101_cm_id, monday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work (101 CM) - Faculty B
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, lavanya_faculty_id, room_101_cm_id, monday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (101 CM) - Faculty B
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, lavanya_faculty_id, room_101_cm_id, monday_id, slot_12_10_13_10_id, false, now()),
    -- 01:55–02:55: Project Work (101 CM) - Faculty C
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, anusha_faculty_id, room_101_cm_id, monday_id, slot_13_55_14_55_id, false, now()),
    -- 02:55–03:55: Project Work (101 CM) - Faculty C
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, anusha_faculty_id, room_101_cm_id, monday_id, slot_14_55_15_55_id, false, now());

  -- TUESDAY (CSE-A)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: OB (101 CM) - Faculty D
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, ob_a_subj_id, sampoornima_faculty_id, room_101_cm_id, tuesday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Parallel block – DP (B1), GAI, RPA (separate inserts to allow multiple entries)
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, dp_a_subj_id, anusha_faculty_id, room_302_cb_id, tuesday_id, slot_10_11_id, false, now())
  ON CONFLICT DO NOTHING;
  
  -- Insert parallel block entries separately (GAI and RPA)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, gai_a_subj_id, radhika_faculty_id, room_303_cb_id, tuesday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, rpa_a_subj_id, nagamani_faculty_id, room_206_cm_id, tuesday_id, slot_10_11_id, false, now())
  ON CONFLICT DO NOTHING;
  
  -- Continue with remaining Tuesday entries
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES
    -- 11:10–12:10: Project Work (101 CM) - Faculty H
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, ratna_sirisha_faculty_id, room_101_cm_id, tuesday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (101 CM) - Faculty H
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, ratna_sirisha_faculty_id, room_101_cm_id, tuesday_id, slot_12_10_13_10_id, false, now()),
    -- 01:55–02:55: OE / Mentoring (101 CM) - Faculty I
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, oe_mentoring_a_subj_id, sampoornima_faculty_id, room_101_cm_id, tuesday_id, slot_13_55_14_55_id, false, now()),
    -- 02:55–03:55: Minor / Interaction with Guide (101 CM) - Faculty J
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, minor_guide_a_subj_id, krishna_faculty_id, room_101_cm_id, tuesday_id, slot_14_55_15_55_id, false, now())
  ON CONFLICT DO NOTHING;

  -- WEDNESDAY (CSE-A)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: Project Work (101 CM) - Faculty K
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, lavanya_faculty_id, room_101_cm_id, wednesday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Project Work (101 CM) - Faculty K
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, lavanya_faculty_id, room_101_cm_id, wednesday_id, slot_10_11_id, false, now()),
    -- 11:10–12:10: Project Work (101 CM) - Faculty L
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, anusha_faculty_id, room_101_cm_id, wednesday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (101 CM) - Faculty L
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, anusha_faculty_id, room_101_cm_id, wednesday_id, slot_12_10_13_10_id, false, now()),
    -- 01:55–02:55: Project Work (101 CM) - Faculty M
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, radhika_faculty_id, room_101_cm_id, wednesday_id, slot_13_55_14_55_id, false, now()),
    -- 02:55–03:55: Project Work (101 CM) - Faculty M
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, radhika_faculty_id, room_101_cm_id, wednesday_id, slot_14_55_15_55_id, false, now());

  -- FRIDAY (CSE-A)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: OB (101 CM) - Faculty D
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, ob_a_subj_id, sampoornima_faculty_id, room_101_cm_id, friday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Parallel block – DP (B1) - first entry
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, dp_a_subj_id, anusha_faculty_id, room_302_cb_id, friday_id, slot_10_11_id, false, now())
  ON CONFLICT DO NOTHING;
  
  -- Insert parallel block entries separately (GAI and RPA) for Friday
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, gai_a_subj_id, radhika_faculty_id, room_303_cb_id, friday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, rpa_a_subj_id, nagamani_faculty_id, room_206_cm_id, friday_id, slot_10_11_id, false, now())
  ON CONFLICT DO NOTHING;
  
  -- Continue with remaining Friday entries
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES
    -- 11:10–12:10: Project Work (101 CM) - Faculty N
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, krishna_faculty_id, room_101_cm_id, friday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (101 CM) - Faculty N
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, krishna_faculty_id, room_101_cm_id, friday_id, slot_12_10_13_10_id, false, now()),
    -- 01:55–02:55: Interaction with Guide (101 CM) - Faculty O
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, interaction_guide_a_subj_id, krishna_faculty_id, room_101_cm_id, friday_id, slot_13_55_14_55_id, false, now()),
    -- 02:55–03:55: Minor / Sports (101 CM) - Faculty P
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, minor_sports_a_subj_id, krishna_faculty_id, room_101_cm_id, friday_id, slot_14_55_15_55_id, false, now())
  ON CONFLICT DO NOTHING;

  -- SATURDAY (CSE-A)
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES 
    -- 09:00–10:00: OB (101 CM) - Faculty D
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, ob_a_subj_id, sampoornima_faculty_id, room_101_cm_id, saturday_id, slot_09_10_id, false, now()),
    -- 10:00–11:00: Parallel block – DP (B1) - first entry
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, dp_a_subj_id, anusha_faculty_id, room_302_cb_id, saturday_id, slot_10_11_id, false, now())
  ON CONFLICT DO NOTHING;
  
  -- Insert parallel block entries separately (GAI and RPA) for Saturday
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, gai_a_subj_id, radhika_faculty_id, room_303_cb_id, saturday_id, slot_10_11_id, false, now()),
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, rpa_a_subj_id, nagamani_faculty_id, room_206_cm_id, saturday_id, slot_10_11_id, false, now())
  ON CONFLICT DO NOTHING;
  
  -- Continue with remaining Saturday entries
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at)
  VALUES
    -- 11:10–12:10: Project Work (101 CM) - Faculty Q
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, lavanya_faculty_id, room_101_cm_id, saturday_id, slot_11_10_12_10_id, false, now()),
    -- 12:10–13:10: Project Work (101 CM) - Faculty Q
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, proj_work_a_subj_id, lavanya_faculty_id, room_101_cm_id, saturday_id, slot_12_10_13_10_id, false, now()),
    -- 01:55–02:55: Library (101 CM) - Faculty R
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, lib_a_subj_id, krishna_faculty_id, room_101_cm_id, saturday_id, slot_13_55_14_55_id, false, now()),
    -- 02:55–03:55: Minor / Interaction with Guide (101 CM) - Faculty J
    (gen_random_uuid(), v_timetable_a_id, v_section_a_id, minor_guide_a_subj_id, krishna_faculty_id, room_101_cm_id, saturday_id, slot_14_55_15_55_id, false, now())
  ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. FACULTY AVAILABILITY
-- ============================================================
  INSERT INTO public.faculty_availability (id, faculty_id, working_day_id, time_slot_id, is_available, created_at)
  SELECT 
    gen_random_uuid(),
    f.id,
    wd.id,
    ts.id,
    true,
    now()
  FROM public.faculty f
  CROSS JOIN public.working_days wd
  CROSS JOIN public.time_slots ts
  WHERE wd.is_active = true AND ts.is_break = false
  ON CONFLICT (faculty_id, working_day_id, time_slot_id) DO NOTHING;

  -- Mark faculty as unavailable during their teaching hours
  UPDATE public.faculty_availability fa
  SET is_available = false
  FROM public.timetable_entries te
  WHERE fa.faculty_id = te.faculty_id
    AND fa.working_day_id = te.working_day_id
    AND fa.time_slot_id = te.time_slot_id;

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Department: Computer Science (CSE)';
  RAISE NOTICE 'Section: CSE C (4th Year)';
  RAISE NOTICE 'Timetable: CSE C - 2025-2026 Sem 2';
  RAISE NOTICE 'Section: CSE A (4th Year)';
  RAISE NOTICE 'Timetable: CSE A - 2025-2026 Sem 2';

END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
SELECT 'Departments' as table_name, COUNT(*) as count FROM public.departments
UNION ALL
SELECT 'Academic Years', COUNT(*) FROM public.academic_years
UNION ALL
SELECT 'Sections', COUNT(*) FROM public.sections
UNION ALL
SELECT 'Subjects', COUNT(*) FROM public.subjects
UNION ALL
SELECT 'Faculty', COUNT(*) FROM public.faculty
UNION ALL
SELECT 'Classrooms', COUNT(*) FROM public.classrooms
UNION ALL
SELECT 'Time Slots', COUNT(*) FROM public.time_slots
UNION ALL
SELECT 'Timetable Entries', COUNT(*) FROM public.timetable_entries
UNION ALL
SELECT 'Faculty Availability', COUNT(*) FROM public.faculty_availability;
