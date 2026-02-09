DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  fac_msunitha UUID; fac_sudhakar UUID; fac_sudhadharani UUID; fac_jyothi UUID; fac_ganesh UUID; fac_himabindu UUID; fac_shravya UUID;
  fac_soujanya UUID; fac_srinivas UUID;
  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_rpa UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;
BEGIN
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-D');
  DELETE FROM timetables WHERE name = 'CSE-D Final';

  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-D', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-D';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Mrs. M. Sunitha', 'm.sunitha@cvr.ac.in', dept_id),
  ('Mr. P. Sudhakar', 'p.sudhakar@cvr.ac.in', dept_id),
  ('Mrs. R. Sudha Dharani', 'r.sudharani.d@cvr.ac.in', dept_id),
  ('Ms. T. Jyothi', 't.jyothi@cvr.ac.in', dept_id),
  ('Mr. D. Ganesh', 'd.ganesh@cvr.ac.in', dept_id),
  ('Mrs. IBN. Hima Bindu', 'hima.bindu@cvr.ac.in', dept_id),
  ('Mrs. G. Shravya', 'g.shravya@cvr.ac.in', dept_id),
  ('Dr. A. Soujanya', 'a.soujanya@cvr.ac.in', dept_id),
  ('Mr. S. Srinivas', 's.srinivas@cvr.ac.in', dept_id),
  ('Faculty OB-D', 'faculty.ob.d@cvr.ac.in', dept_id),
  ('Faculty DP-D', 'faculty.dp.d@cvr.ac.in', dept_id),
  ('Faculty GAI-D', 'faculty.gai.d@cvr.ac.in', dept_id),
  ('Faculty RPA-D', 'faculty.rpa.d@cvr.ac.in', dept_id),
  ('Faculty Guide-D', 'faculty.guide.d@cvr.ac.in', dept_id),
  ('Faculty Sports-D', 'faculty.sports.d@cvr.ac.in', dept_id),
  ('Faculty Library-D', 'faculty.library.d@cvr.ac.in', dept_id),
  ('Faculty Minor-D', 'faculty.minor.d@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO fac_msunitha FROM faculty WHERE email = 'm.sunitha@cvr.ac.in';
  SELECT id INTO fac_sudhakar FROM faculty WHERE email = 'p.sudhakar@cvr.ac.in';
  SELECT id INTO fac_sudhadharani FROM faculty WHERE email = 'r.sudharani.d@cvr.ac.in';
  SELECT id INTO fac_jyothi FROM faculty WHERE email = 't.jyothi@cvr.ac.in';
  SELECT id INTO fac_ganesh FROM faculty WHERE email = 'd.ganesh@cvr.ac.in';
  SELECT id INTO fac_himabindu FROM faculty WHERE email = 'hima.bindu@cvr.ac.in';
  SELECT id INTO fac_shravya FROM faculty WHERE email = 'g.shravya@cvr.ac.in';
  SELECT id INTO fac_soujanya FROM faculty WHERE email = 'a.soujanya@cvr.ac.in';
  SELECT id INTO fac_srinivas FROM faculty WHERE email = 's.srinivas@cvr.ac.in';
  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.d@cvr.ac.in';
  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.d@cvr.ac.in';
  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.d@cvr.ac.in';
  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.d@cvr.ac.in';
  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.d@cvr.ac.in';
  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.d@cvr.ac.in';
  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.d@cvr.ac.in';
  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.d@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('304 CB', 60, false),
  ('204 CB', 60, true),
  ('Projects Lab', 60, true),
  ('205 CM', 60, false),
  ('101 CM', 60, false)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'OB', 'OB-D', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Design Patterns', 'DP-D', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Generative AI', 'GAI-D', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'RPA', 'RPA-D', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Project Work', 'PW-D', 'lab', 18, v_section_id),
  (gen_random_uuid(), 'OE / Mentoring', 'OE-D', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-D', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Sports', 'MS-D', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Library', 'LIB-D', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-D', 'theory', 2, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('CSE-D Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_msunitha, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhakar, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhadharani, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_jyothi, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ganesh, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_himabindu, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shravya, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_msunitha, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhakar, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhadharani, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_jyothi, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ganesh, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='101 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_himabindu, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shravya, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_soujanya, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='OE-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='101 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_msunitha, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhakar, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_guide, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='IG-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sports, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MS-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='101 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sudhadharani, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_jyothi, (SELECT id FROM classrooms WHERE name='204 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_lib, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='LIB-D'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='304 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-D'));
  RAISE NOTICE 'CSE-D Timetable Generated Successfully!';
END $$;
