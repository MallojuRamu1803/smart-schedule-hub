DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  fac_uma UUID; fac_sudhadharani UUID; fac_shravya UUID; fac_sindhu UUID; fac_divya UUID; fac_manjula UUID; fac_archana UUID;
  fac_ratna UUID; fac_shrisha UUID;
  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_rpa UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;
BEGIN
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-F');
  DELETE FROM timetables WHERE name = 'CSE-F Final';

  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-F', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-F';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Mrs. A. Uma Rani', 'a.uma.rani@cvr.ac.in', dept_id),
  ('Mrs. R. Sudha Dharani', 'r.sudharani.d@cvr.ac.in', dept_id),
  ('Mrs. G. Shravya', 'g.shravya@cvr.ac.in', dept_id),
  ('Mrs. B. Sindhu', 'b.sindhu@cvr.ac.in', dept_id),
  ('Mrs. B. Divya Jyothi', 'b.divya.jyothi@cvr.ac.in', dept_id),
  ('Mrs. Sabavath Manjula', 's.manjula@cvr.ac.in', dept_id),
  ('Mrs. N. Archana', 'n.archana@cvr.ac.in', dept_id),
  ('Mrs. M. Ratna Sirisha', 'm.ratnasirisha@cvr.ac.in', dept_id),
  ('Dr. L. Shrisha', 'l.shrisha@cvr.ac.in', dept_id),
  ('Faculty OB-F', 'faculty.ob.f@cvr.ac.in', dept_id),
  ('Faculty DP-F', 'faculty.dp.f@cvr.ac.in', dept_id),
  ('Faculty GAI-F', 'faculty.gai.f@cvr.ac.in', dept_id),
  ('Faculty RPA-F', 'faculty.rpa.f@cvr.ac.in', dept_id),
  ('Faculty Guide-F', 'faculty.guide.f@cvr.ac.in', dept_id),
  ('Faculty Sports-F', 'faculty.sports.f@cvr.ac.in', dept_id),
  ('Faculty Library-F', 'faculty.library.f@cvr.ac.in', dept_id),
  ('Faculty Minor-F', 'faculty.minor.f@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO fac_uma FROM faculty WHERE email = 'a.uma.rani@cvr.ac.in';
  SELECT id INTO fac_sudhadharani FROM faculty WHERE email = 'r.sudharani.d@cvr.ac.in';
  SELECT id INTO fac_shravya FROM faculty WHERE email = 'g.shravya@cvr.ac.in';
  SELECT id INTO fac_sindhu FROM faculty WHERE email = 'b.sindhu@cvr.ac.in';
  SELECT id INTO fac_divya FROM faculty WHERE email = 'b.divya.jyothi@cvr.ac.in';
  SELECT id INTO fac_manjula FROM faculty WHERE email = 's.manjula@cvr.ac.in';
  SELECT id INTO fac_archana FROM faculty WHERE email = 'n.archana@cvr.ac.in';
  SELECT id INTO fac_ratna FROM faculty WHERE email = 'm.ratnasirisha@cvr.ac.in';
  SELECT id INTO fac_shrisha FROM faculty WHERE email = 'l.shrisha@cvr.ac.in';
  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.f@cvr.ac.in';
  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.f@cvr.ac.in';
  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.f@cvr.ac.in';
  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.f@cvr.ac.in';
  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.f@cvr.ac.in';
  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.f@cvr.ac.in';
  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.f@cvr.ac.in';
  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.f@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('306 CB', 60, false),
  ('308 CM', 60, true),
  ('Old Cellar', 60, true),
  ('205 CM', 60, false),
  ('206 CM', 60, false)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'OB', 'OB-F', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Design Patterns', 'DP-F', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Generative AI', 'GAI-F', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'RPA', 'RPA-F', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Project Work', 'PW-F', 'lab', 18, v_section_id),
  (gen_random_uuid(), 'OE / Mentoring', 'OE-F', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-F', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Sports', 'MS-F', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Library', 'LIB-F', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-F', 'theory', 2, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('CSE-F Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_uma, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhadharani, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shravya, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_divya, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_manjula, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_archana, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_uma, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhadharani, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shravya, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_divya, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='206 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_manjula, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_archana, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ratna, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='OE-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='206 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_uma, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhadharani, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_guide, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='IG-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sports, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MS-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='206 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shravya, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='308 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_lib, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='LIB-F'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='306 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-F'));
  RAISE NOTICE 'CSE-F Timetable Generated Successfully!';
END $$;
