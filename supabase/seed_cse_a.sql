-- ============================================================
-- Smart Schedule Hub - Seed Data for CSE A (2025-26)
-- Based on User Uploaded Image: "TIME TABLE FOR B. TECH IV YEAR II SEM (FOR 2022 BATCH)"
-- Class: CSE A, Room No: 101 CM
-- Dates: 22-12-2025 to 27-12-2025
-- ============================================================

DO $$
DECLARE
  -- IDs
  dept_id UUID;
  acad_year_id UUID;
  v_section_id UUID; -- Renamed from section_id to avoid ambiguity
  timetable_id UUID;
  
  -- Faculty IDs
  f_krishna_kishore UUID;
  f_lavanya UUID;
  f_ratna_sirisha UUID;
  f_anusha UUID;
  f_radhika UUID;
  f_nagamani UUID;
  f_sharmila UUID; -- Class Incharge
  f_sampoornima UUID;
  f_sriveni UUID;
  f_ramakrishna UUID;
  
  -- Room IDs
  r_101_cm UUID;
  r_109_cm UUID;
  r_302_cb UUID;
  r_303_cb UUID;
  r_206_cm UUID; 
  r_library UUID;
  r_new_cellar UUID; 

  -- Subject IDs
  s_proj_work UUID;
  s_ob UUID;
  s_dp UUID;
  s_gai UUID;
  s_rpa UUID;
  s_oe_mentoring UUID;
  s_minor_interaction UUID;
  s_interaction_guide UUID;
  s_minor_sports UUID;
  s_library UUID;

  -- Time Slot IDs
  slot_09_10 UUID;
  slot_10_11 UUID;
  slot_11_10_12_10 UUID;
  slot_12_10_13_10 UUID;
  slot_13_55_14_55 UUID; 
  slot_14_55_15_55 UUID; 

  -- Day IDs
  d_mon UUID;
  d_tue UUID;
  d_wed UUID;
  d_fri UUID;
  d_sat UUID;

BEGIN

-- ============================================================
-- 1. MASTER DATA: Departments, Years, Days, Slots, Rooms
-- ============================================================

  -- Department
  INSERT INTO public.departments (id, name, code, created_at)
  VALUES (gen_random_uuid(), 'Computer Science and Engineering', 'CSE', now())
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO dept_id;

  -- Academic Year (2025-26, IV Year II Sem)
  INSERT INTO public.academic_years (id, year, semester, is_active, created_at)
  VALUES (gen_random_uuid(), '2025-2026', 2, true, now())
  ON CONFLICT (year, semester) DO UPDATE SET is_active = true
  RETURNING id INTO acad_year_id;

  -- Working Days
  DELETE FROM public.working_days;
  
  INSERT INTO public.working_days (id, day_name, day_order, is_active, created_at)
  VALUES 
    (gen_random_uuid(), 'Monday', 1, true, now()),
    (gen_random_uuid(), 'Tuesday', 2, true, now()),
    (gen_random_uuid(), 'Wednesday', 3, true, now()),
    (gen_random_uuid(), 'Thursday', 4, true, now()), -- Enabled Thursday
    (gen_random_uuid(), 'Friday', 5, true, now()),
    (gen_random_uuid(), 'Saturday', 6, true, now()),
    (gen_random_uuid(), 'Sunday', 0, false, now());

  SELECT id INTO d_mon FROM public.working_days WHERE day_name = 'Monday';
  SELECT id INTO d_tue FROM public.working_days WHERE day_name = 'Tuesday';
  SELECT id INTO d_wed FROM public.working_days WHERE day_name = 'Wednesday';
  SELECT id INTO d_fri FROM public.working_days WHERE day_name = 'Friday';
  SELECT id INTO d_sat FROM public.working_days WHERE day_name = 'Saturday';

  -- Time Slots
  DELETE FROM public.timetable_entries; 
  DELETE FROM public.time_slots;
  
  INSERT INTO public.time_slots (id, start_time, end_time, slot_order, is_break, break_name, created_at)
  VALUES 
    (gen_random_uuid(), '09:00', '10:00', 1, false, NULL, now()),
    (gen_random_uuid(), '10:00', '11:00', 2, false, NULL, now()),
    (gen_random_uuid(), '11:00', '11:10', 3, true, 'Short Break', now()),
    (gen_random_uuid(), '11:10', '12:10', 4, false, NULL, now()),
    (gen_random_uuid(), '12:10', '13:10', 5, false, NULL, now()),
    (gen_random_uuid(), '13:10', '13:55', 6, true, 'Lunch Break', now()), 
    (gen_random_uuid(), '13:55', '14:55', 7, false, NULL, now()),
    (gen_random_uuid(), '14:55', '15:55', 8, false, NULL, now());

  SELECT id INTO slot_09_10 FROM public.time_slots WHERE start_time = '09:00';
  SELECT id INTO slot_10_11 FROM public.time_slots WHERE start_time = '10:00';
  SELECT id INTO slot_11_10_12_10 FROM public.time_slots WHERE start_time = '11:10';
  SELECT id INTO slot_12_10_13_10 FROM public.time_slots WHERE start_time = '12:10';
  SELECT id INTO slot_13_55_14_55 FROM public.time_slots WHERE start_time = '13:55';
  SELECT id INTO slot_14_55_15_55 FROM public.time_slots WHERE start_time = '14:55';

  -- Classrooms
  INSERT INTO public.classrooms (id, name, capacity, is_lab, created_at)
  VALUES
    (gen_random_uuid(), '101 CM', 60, false, now()), 
    (gen_random_uuid(), '109 CM', 60, true, now()), 
    (gen_random_uuid(), '302 CB', 60, false, now()), 
    (gen_random_uuid(), '303 CB', 60, false, now()), 
    (gen_random_uuid(), 'Library', 100, false, now()), 
    (gen_random_uuid(), 'New Cellar', 60, true, now()) 
  ON CONFLICT (name) DO UPDATE SET capacity = EXCLUDED.capacity;

  SELECT id INTO r_101_cm FROM public.classrooms WHERE name = '101 CM';
  SELECT id INTO r_109_cm FROM public.classrooms WHERE name = '109 CM';
  SELECT id INTO r_302_cb FROM public.classrooms WHERE name = '302 CB';
  SELECT id INTO r_303_cb FROM public.classrooms WHERE name = '303 CB';
  SELECT id INTO r_library FROM public.classrooms WHERE name = 'Library';
  SELECT id INTO r_new_cellar FROM public.classrooms WHERE name = 'New Cellar';


-- ============================================================
-- 2. FACULTY
-- ============================================================
  INSERT INTO public.faculty (id, name, email, department_id, created_at)
  VALUES
    (gen_random_uuid(), 'Mr. G. Krishna Kishore', 'krishna.kishore@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. Ch. Lavanya', 'lavanya@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Ms. M. Ratna Sirisha', 'ratna.sirisha@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. K. Anusha', 'anusha@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. T. Radhika', 'radhika@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. M. Nagamani', 'nagamani@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Ms. Sharmila Bandlamudi', 'sharmila@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Dr. P. Sampoornima', 'sampoornima@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Mrs. D. Sriveni', 'sriveni@college.edu', dept_id, now()),
    (gen_random_uuid(), 'Dr. V. Ramakrishna', 'ramakrishna@college.edu', dept_id, now())
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

  -- Refetch IDs
  SELECT id INTO f_krishna_kishore FROM public.faculty WHERE email = 'krishna.kishore@college.edu' LIMIT 1;
  SELECT id INTO f_lavanya FROM public.faculty WHERE email = 'lavanya@college.edu' LIMIT 1;
  SELECT id INTO f_ratna_sirisha FROM public.faculty WHERE email = 'ratna.sirisha@college.edu' LIMIT 1;
  SELECT id INTO f_anusha FROM public.faculty WHERE email = 'anusha@college.edu' LIMIT 1;
  SELECT id INTO f_radhika FROM public.faculty WHERE email = 'radhika@college.edu' LIMIT 1;
  SELECT id INTO f_nagamani FROM public.faculty WHERE email = 'nagamani@college.edu' LIMIT 1;
  SELECT id INTO f_sharmila FROM public.faculty WHERE email = 'sharmila@college.edu' LIMIT 1;
  SELECT id INTO f_sampoornima FROM public.faculty WHERE email = 'sampoornima@college.edu' LIMIT 1;
  SELECT id INTO f_sriveni FROM public.faculty WHERE email = 'sriveni@college.edu' LIMIT 1;
  SELECT id INTO f_ramakrishna FROM public.faculty WHERE email = 'ramakrishna@college.edu' LIMIT 1;


-- ============================================================
-- 3. SECTION & SUBJECTS
-- ============================================================

  -- Section CSE A
  INSERT INTO public.sections (id, name, department_id, academic_year_id, year_of_study, created_at)
  VALUES (gen_random_uuid(), 'A', dept_id, acad_year_id, 4, now())
  ON CONFLICT (name, department_id, academic_year_id) DO NOTHING
  RETURNING id INTO v_section_id;

  IF v_section_id IS NULL THEN
    SELECT id INTO v_section_id FROM public.sections WHERE name = 'A' AND department_id = dept_id LIMIT 1;
  END IF;

  -- Subjects
  INSERT INTO public.subjects (id, name, code, subject_type, weekly_hours, section_id, created_at)
  VALUES
    (gen_random_uuid(), 'Project Work', 'PROJ', 'lab', 10, v_section_id, now()), 
    (gen_random_uuid(), 'OB', 'OB', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'DP', 'DP', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'GAI', 'GAI', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'RPA', 'RPA', 'theory', 3, v_section_id, now()),
    (gen_random_uuid(), 'OE / Mentoring', 'OE_MENTOR', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Minor / Interaction with Guide', 'MINOR_INT', 'theory', 2, v_section_id, now()), 
    (gen_random_uuid(), 'Interaction with Guide', 'INT_GUIDE', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Minor / Sports', 'MINOR_SPORTS', 'theory', 1, v_section_id, now()),
    (gen_random_uuid(), 'Library', 'LIB', 'theory', 1, v_section_id, now())
  ON CONFLICT (code) DO NOTHING;

  SELECT id INTO s_proj_work FROM public.subjects WHERE code = 'PROJ' AND section_id = v_section_id;
  SELECT id INTO s_ob FROM public.subjects WHERE code = 'OB' AND section_id = v_section_id;
  SELECT id INTO s_dp FROM public.subjects WHERE code = 'DP' AND section_id = v_section_id;
  SELECT id INTO s_gai FROM public.subjects WHERE code = 'GAI' AND section_id = v_section_id;
  SELECT id INTO s_rpa FROM public.subjects WHERE code = 'RPA' AND section_id = v_section_id;
  SELECT id INTO s_oe_mentoring FROM public.subjects WHERE code = 'OE_MENTOR' AND section_id = v_section_id;
  SELECT id INTO s_minor_interaction FROM public.subjects WHERE code = 'MINOR_INT' AND section_id = v_section_id;
  SELECT id INTO s_interaction_guide FROM public.subjects WHERE code = 'INT_GUIDE' AND section_id = v_section_id;
  SELECT id INTO s_minor_sports FROM public.subjects WHERE code = 'MINOR_SPORTS' AND section_id = v_section_id;
  SELECT id INTO s_library FROM public.subjects WHERE code = 'LIB' AND section_id = v_section_id;

  -- Faculty-Subject Mapping
  INSERT INTO public.faculty_subjects (id, faculty_id, subject_id, created_at)
  VALUES
    (gen_random_uuid(), f_krishna_kishore, s_proj_work, now()),
    (gen_random_uuid(), f_lavanya, s_proj_work, now()),
    (gen_random_uuid(), f_ratna_sirisha, s_proj_work, now()),
    (gen_random_uuid(), f_anusha, s_proj_work, now()),
    (gen_random_uuid(), f_radhika, s_proj_work, now()),
    (gen_random_uuid(), f_nagamani, s_proj_work, now()),
    (gen_random_uuid(), f_sampoornima, s_oe_mentoring, now()),
    (gen_random_uuid(), f_sriveni, s_oe_mentoring, now()),
    (gen_random_uuid(), f_ramakrishna, s_oe_mentoring, now()),
    -- Added missing mappings
    (gen_random_uuid(), f_sharmila, s_ob, now()),
    (gen_random_uuid(), f_anusha, s_dp, now()),
    (gen_random_uuid(), f_radhika, s_gai, now()),
    (gen_random_uuid(), f_nagamani, s_rpa, now()),
    (gen_random_uuid(), f_sharmila, s_minor_interaction, now()),
    (gen_random_uuid(), f_sharmila, s_interaction_guide, now()),
    (gen_random_uuid(), f_sharmila, s_minor_sports, now()),
    (gen_random_uuid(), f_sharmila, s_library, now())
  ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. TIMETABLE ENTRIES
-- ============================================================

  -- Create Timetable
  INSERT INTO public.timetables (id, name, academic_year_id, generated_at, is_active, generation_status, created_at)
  VALUES (gen_random_uuid(), 'CSE A (2025-26)', acad_year_id, now(), true, 'completed', now())
  RETURNING id INTO timetable_id;

  -- MONDAY
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_krishna_kishore, s_proj_work, r_109_cm, d_mon, slot_09_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_krishna_kishore, s_proj_work, r_109_cm, d_mon, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_krishna_kishore, s_proj_work, r_109_cm, d_mon, slot_11_10_12_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_krishna_kishore, s_proj_work, r_109_cm, d_mon, slot_12_10_13_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_lavanya, s_proj_work, r_109_cm, d_mon, slot_13_55_14_55, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_lavanya, s_proj_work, r_109_cm, d_mon, slot_14_55_15_55, true);

  -- TUESDAY
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_ob, r_101_cm, d_tue, slot_09_10, true);

  -- 10:00-11:00 Parallel
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_dp, r_302_cb, d_tue, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_radhika, s_gai, r_303_cb, d_tue, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_nagamani, s_rpa, r_101_cm, d_tue, slot_10_11, true);

  -- 11:10-1:10 Project Work
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_ratna_sirisha, s_proj_work, r_101_cm, d_tue, slot_11_10_12_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_ratna_sirisha, s_proj_work, r_101_cm, d_tue, slot_12_10_13_10, true);

  -- 1:55-2:55 OE/Mentoring
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sampoornima, s_oe_mentoring, r_101_cm, d_tue, slot_13_55_14_55, true);

  -- 2:55-3:55 Minor/Interaction
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_minor_interaction, r_101_cm, d_tue, slot_14_55_15_55, true);

  -- WEDNESDAY
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_proj_work, r_new_cellar, d_wed, slot_09_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_proj_work, r_new_cellar, d_wed, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_proj_work, r_new_cellar, d_wed, slot_11_10_12_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_proj_work, r_new_cellar, d_wed, slot_12_10_13_10, true); 

  -- 1:55-3:55 Project Work
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_radhika, s_proj_work, r_101_cm, d_wed, slot_13_55_14_55, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_radhika, s_proj_work, r_101_cm, d_wed, slot_14_55_15_55, true);

  -- FRIDAY
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_ob, r_101_cm, d_fri, slot_09_10, true);

  -- 10:00-11:00 Parallel
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_dp, r_302_cb, d_fri, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_radhika, s_gai, r_303_cb, d_fri, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_nagamani, s_rpa, r_101_cm, d_fri, slot_10_11, true);

  -- 11:10-1:10 Project Work
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_nagamani, s_proj_work, r_new_cellar, d_fri, slot_11_10_12_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_nagamani, s_proj_work, r_new_cellar, d_fri, slot_12_10_13_10, true);

  -- 1:55-2:55 Helper
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_interaction_guide, r_101_cm, d_fri, slot_13_55_14_55, true);

  -- 2:55-3:55 Minor/Sports
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_minor_sports, r_101_cm, d_fri, slot_14_55_15_55, true);

  -- SATURDAY
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_ob, r_101_cm, d_sat, slot_09_10, true);

  -- 10:00-11:00 Parallel
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_anusha, s_dp, r_302_cb, d_sat, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_radhika, s_gai, r_303_cb, d_sat, slot_10_11, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_nagamani, s_rpa, r_101_cm, d_sat, slot_10_11, true);

  -- 11:10-1:10 Project Work
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_krishna_kishore, s_proj_work, r_new_cellar, d_sat, slot_11_10_12_10, true),
    (gen_random_uuid(), timetable_id, v_section_id, f_krishna_kishore, s_proj_work, r_new_cellar, d_sat, slot_12_10_13_10, true);

  -- 1:55-2:55 Library
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_library, r_library, d_sat, slot_13_55_14_55, true);

  -- 2:55-3:55 Minor/Interaction
  INSERT INTO public.timetable_entries (id, timetable_id, section_id, faculty_id, subject_id, classroom_id, working_day_id, time_slot_id, is_locked) VALUES
    (gen_random_uuid(), timetable_id, v_section_id, f_sharmila, s_minor_interaction, r_101_cm, d_sat, slot_14_55_15_55, true);


  RAISE NOTICE 'Seed Data for CSE A (Image Based) Inserted Successfully!';

END $$;
