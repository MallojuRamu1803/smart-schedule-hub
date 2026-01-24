DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  venugopal_id UUID; guruvaiah_id UUID; kalyana_id UUID; pavani_id UUID; sanjeev_id UUID;
  sheshi_id UUID; spandana_id UUID; sunitha_id UUID; radhika_id UUID; gamidelli_id UUID;
BEGIN
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-G');
  DELETE FROM timetables WHERE name = 'CSE-G Final Shuffled';

  INSERT INTO departments (name, code) VALUES ('Computer Science and Engineering', 'CSE') ON CONFLICT (code) DO NOTHING;
  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  INSERT INTO academic_years (year, semester, is_active) VALUES ('2025-2026', 2, true) ON CONFLICT (year, semester) DO UPDATE SET is_active = true;
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-G', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-G';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Mr. G. Venugopal Rao', 'g.venugopal@cvr.ac.in', dept_id), ('Mr. Guruvaiah', 'guruvaiah@cvr.ac.in', dept_id),
  ('Mr. G. Kalyana Chakravarthy', 'kalyana@cvr.ac.in', dept_id), ('Mrs. T. Pavani', 't.pavani@cvr.ac.in', dept_id),
  ('Mr. B. Sanjeev', 'b.sanjeev@cvr.ac.in', dept_id), ('Mrs. Sheshi Rekha', 'sheshi@cvr.ac.in', dept_id),
  ('Ms. V. Spandana', 'v.spandana@cvr.ac.in', dept_id), ('Mrs. Y. Sunitha', 'y.sunitha@cvr.ac.in', dept_id),
  ('Mrs. T. Radhika', 't.radhika@cvr.ac.in', dept_id), ('Mr. Gamidelli Yedukondalu', 'gamidelli@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO venugopal_id FROM faculty WHERE email = 'g.venugopal@cvr.ac.in';
  SELECT id INTO guruvaiah_id FROM faculty WHERE email = 'guruvaiah@cvr.ac.in';
  SELECT id INTO kalyana_id FROM faculty WHERE email = 'kalyana@cvr.ac.in';
  SELECT id INTO pavani_id FROM faculty WHERE email = 't.pavani@cvr.ac.in';
  SELECT id INTO sanjeev_id FROM faculty WHERE email = 'b.sanjeev@cvr.ac.in';
  SELECT id INTO sheshi_id FROM faculty WHERE email = 'sheshi@cvr.ac.in';
  SELECT id INTO spandana_id FROM faculty WHERE email = 'v.spandana@cvr.ac.in';
  SELECT id INTO sunitha_id FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';
  SELECT id INTO radhika_id FROM faculty WHERE email = 't.radhika@cvr.ac.in';
  SELECT id INTO gamidelli_id FROM faculty WHERE email = 'gamidelli@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('Room No. 211 CB', 60, false), ('Room No. 205 CM', 60, false), ('Room No. 112 CB', 60, false),
  ('New Cellar', 60, true), ('Dep. Library', 30, false), ('Central Library', 100, false),
  ('Sports Complex', 100, false), ('Faculty Cabin', 10, false)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'OB', 'OB-G', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Design Patterns', 'DP-G', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Generative AI', 'GAI-G', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'OE / Interaction', 'OE-G', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'OE / Library', 'OELIB-G', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-G', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-G', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Sports', 'MS-G', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Mentoring', 'MEN-G', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Project Work', 'PW-G', 'lab', 18, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  INSERT INTO working_days (day_name, day_order, is_active) VALUES ('Monday', 0, true), ('Tuesday', 1, true), ('Wednesday', 2, true), ('Thursday', 3, false), ('Friday', 4, true), ('Saturday', 5, true), ('Sunday', 6, false) ON CONFLICT (day_name) DO UPDATE SET is_active = EXCLUDED.is_active;
  INSERT INTO time_slots (start_time, end_time, slot_order, is_break, break_name) VALUES ('09:00', '10:00', 1, false, NULL), ('10:00', '11:00', 2, false, NULL), ('11:00', '11:10', 3, true, 'Break'), ('11:10', '12:10', 4, false, NULL), ('12:10', '13:10', 5, false, NULL), ('13:10', '13:55', 6, true, 'Lunch'), ('13:55', '14:55', 7, false, NULL), ('14:55', '15:55', 8, false, NULL) ON CONFLICT (start_time, end_time) DO NOTHING;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status)
  VALUES ('CSE-G Final Shuffled', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, radhika_id, (SELECT id FROM classrooms WHERE name='Faculty Cabin'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='MEN-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, radhika_id, (SELECT id FROM classrooms WHERE name='Sports Complex'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='MS-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, guruvaiah_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, guruvaiah_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, venugopal_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, venugopal_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, kalyana_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, radhika_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sheshi_id, (SELECT id FROM classrooms WHERE name='Room No. 205 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, pavani_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, pavani_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sanjeev_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sanjeev_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, guruvaiah_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, guruvaiah_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, kalyana_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='OB-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sunitha_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='IG-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, spandana_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, spandana_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sheshi_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sheshi_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, radhika_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='DP-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sheshi_id, (SELECT id FROM classrooms WHERE name='Room No. 205 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='GAI-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, venugopal_id, (SELECT id FROM classrooms WHERE name='Central Library'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='OELIB-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, kalyana_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='OB-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sunitha_id, (SELECT id FROM classrooms WHERE name='Dep. Library'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='OE-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, pavani_id, (SELECT id FROM classrooms WHERE name='Room No. 112 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='MIG-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, radhika_id, (SELECT id FROM classrooms WHERE name='Room No. 211 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sheshi_id, (SELECT id FROM classrooms WHERE name='Room No. 205 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, venugopal_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, venugopal_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sunitha_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-G'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, sunitha_id, (SELECT id FROM classrooms WHERE name='New Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-G'));
  RAISE NOTICE 'Shuffled with Continuous PW Only Generated!';
END $$;
