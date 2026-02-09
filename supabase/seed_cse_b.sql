DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  fac_surendra UUID; fac_archana UUID; fac_pramod UUID; fac_shrava UUID; fac_pranitha UUID;
  fac_smidhu UUID; fac_sunitha UUID; fac_deepthi UUID;
  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_rpa UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;
BEGIN
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-B');
  DELETE FROM timetables WHERE name = 'CSE-B Final';

  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-B', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-B';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Mr. K. Surendra', 'k.surendra@cvr.ac.in', dept_id),
  ('Mrs. N. Archana', 'n.archana@cvr.ac.in', dept_id),
  ('Mr. A. Pramod Raj', 'pramod.raj@cvr.ac.in', dept_id),
  ('Mr. G. Shrava', 'g.shrava@cvr.ac.in', dept_id),
  ('Ms. U. Pranitha', 'u.pranitha@cvr.ac.in', dept_id),
  ('Mrs. B. Smidhu', 'b.smidhu@cvr.ac.in', dept_id),
  ('Mrs. K. Deepthi Reddy', 'k.deepthi@cvr.ac.in', dept_id),
  ('Faculty OB-B', 'faculty.ob.b@cvr.ac.in', dept_id),
  ('Faculty DP-B', 'faculty.dp.b@cvr.ac.in', dept_id),
  ('Faculty GAI-B', 'faculty.gai.b@cvr.ac.in', dept_id),
  ('Faculty RPA-B', 'faculty.rpa.b@cvr.ac.in', dept_id),
  ('Faculty Guide-B', 'faculty.guide.b@cvr.ac.in', dept_id),
  ('Faculty Sports-B', 'faculty.sports.b@cvr.ac.in', dept_id),
  ('Faculty Library-B', 'faculty.library.b@cvr.ac.in', dept_id),
  ('Faculty Minor-B', 'faculty.minor.b@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO fac_surendra FROM faculty WHERE email = 'k.surendra@cvr.ac.in';
  SELECT id INTO fac_archana FROM faculty WHERE email = 'n.archana@cvr.ac.in';
  SELECT id INTO fac_pramod FROM faculty WHERE email = 'pramod.raj@cvr.ac.in';
  SELECT id INTO fac_shrava FROM faculty WHERE email = 'g.shrava@cvr.ac.in';
  SELECT id INTO fac_pranitha FROM faculty WHERE email = 'u.pranitha@cvr.ac.in';
  SELECT id INTO fac_smidhu FROM faculty WHERE email = 'b.smidhu@cvr.ac.in';
  SELECT id INTO fac_deepthi FROM faculty WHERE email = 'k.deepthi@cvr.ac.in';
  SELECT id INTO fac_sunitha FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';
  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.b@cvr.ac.in';
  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.b@cvr.ac.in';
  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.b@cvr.ac.in';
  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.b@cvr.ac.in';
  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.b@cvr.ac.in';
  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.b@cvr.ac.in';
  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.b@cvr.ac.in';
  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.b@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('302 CB', 60, false),
  ('Old Cellar', 60, true),
  ('303 CB', 60, false),
  ('101 CM', 60, false)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'OB', 'OB-B', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Design Patterns', 'DP-B', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Generative AI', 'GAI-B', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'RPA', 'RPA-B', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Project Work', 'PW-B', 'lab', 18, v_section_id),
  (gen_random_uuid(), 'OE / Mentoring', 'OE-B', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-B', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Sports', 'MS-B', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Library', 'LIB-B', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-B', 'theory', 2, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('CSE-B Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_surendra, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_archana, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pramod, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shrava, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_surendra, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_archana, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pramod, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shrava, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_surendra, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_archana, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='101 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pramod, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_shrava, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_smidhu, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='OE-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='101 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_surendra, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_guide, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='IG-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sports, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MS-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='303 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_rpa, (SELECT id FROM classrooms WHERE name='101 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='RPA-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_archana, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pramod, (SELECT id FROM classrooms WHERE name='Old Cellar'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_lib, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='LIB-B'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='302 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-B'));
  RAISE NOTICE 'CSE-B Timetable Generated Successfully!';
END $$;
