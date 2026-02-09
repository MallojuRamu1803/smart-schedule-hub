DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  fac_nagamani UUID; fac_singam UUID; fac_bharat UUID; fac_spandana UUID; fac_swathi UUID; fac_anusha UUID;
  fac_sudhakar UUID; fac_sudharani UUID;
  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_rpa UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;
BEGIN
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-C');
  DELETE FROM timetables WHERE name = 'CSE-C Final';

  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-C', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-C';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Ms. M. Nagamani', 'm.nagamani@cvr.ac.in', dept_id),
  ('Mr. Singam Chandra Sekhar', 'singam.chandra@cvr.ac.in', dept_id),
  ('Mr. A. Bharat', 'a.bharat@cvr.ac.in', dept_id),
  ('Ms. V. Spandana', 'v.spandana@cvr.ac.in', dept_id),
  ('Ms. O. Swathi', 'o.swathi@cvr.ac.in', dept_id),
  ('Mrs. K. Anusha', 'k.anusha@cvr.ac.in', dept_id),
  ('Mr. P. Sudhakar', 'p.sudhakar@cvr.ac.in', dept_id),
  ('Ms. R. Sudharani', 'r.sudharani@cvr.ac.in', dept_id),
  ('Faculty OB-C', 'faculty.ob.c@cvr.ac.in', dept_id),
  ('Faculty DP-C', 'faculty.dp.c@cvr.ac.in', dept_id),
  ('Faculty GAI-C', 'faculty.gai.c@cvr.ac.in', dept_id),
  ('Faculty RPA-C', 'faculty.rpa.c@cvr.ac.in', dept_id),
  ('Faculty Guide-C', 'faculty.guide.c@cvr.ac.in', dept_id),
  ('Faculty Sports-C', 'faculty.sports.c@cvr.ac.in', dept_id),
  ('Faculty Library-C', 'faculty.library.c@cvr.ac.in', dept_id),
  ('Faculty Minor-C', 'faculty.minor.c@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO fac_nagamani FROM faculty WHERE email = 'm.nagamani@cvr.ac.in';
  SELECT id INTO fac_singam FROM faculty WHERE email = 'singam.chandra@cvr.ac.in';
  SELECT id INTO fac_bharat FROM faculty WHERE email = 'a.bharat@cvr.ac.in';
  SELECT id INTO fac_spandana FROM faculty WHERE email = 'v.spandana@cvr.ac.in';
  SELECT id INTO fac_swathi FROM faculty WHERE email = 'o.swathi@cvr.ac.in';
  SELECT id INTO fac_anusha FROM faculty WHERE email = 'k.anusha@cvr.ac.in';
  SELECT id INTO fac_sudhakar FROM faculty WHERE email = 'p.sudhakar@cvr.ac.in';
  SELECT id INTO fac_sudharani FROM faculty WHERE email = 'r.sudharani@cvr.ac.in';
  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.c@cvr.ac.in';
  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.c@cvr.ac.in';
  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.c@cvr.ac.in';
  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.c@cvr.ac.in';
  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.c@cvr.ac.in';
  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.c@cvr.ac.in';
  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.c@cvr.ac.in';
  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.c@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('303 CB', 60, false),
  ('New Cellar', 60, true),
  ('302 CB', 60, false),
  ('306 CB', 60, false),
  ('206 CM', 60, false)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'OB', 'OB-C', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Design Patterns', 'DP-C', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Generative AI', 'GAI-C', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'RPA', 'RPA-C', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Project Work', 'PW-C', 'lab', 18, v_section_id),
  (gen_random_uuid(), 'OE / Mentoring', 'OE-C', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-C', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Sports', 'MS-C', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Library', 'LIB-C', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-C', 'theory', 2, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('CSE-C Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_nagamani, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_singam, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_bharat, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_spandana, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_anusha, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_nagamani, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_singam, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_bharat, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_spandana, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_anusha, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='206 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_nagamani, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_singam, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhakar, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='OE-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='206 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_bharat, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_spandana, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_guide, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='IG-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sports, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MS-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='206 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_anusha, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_lib, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='LIB-C'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-C'));
  RAISE NOTICE 'CSE-C Timetable Generated Successfully!';
END $$;
