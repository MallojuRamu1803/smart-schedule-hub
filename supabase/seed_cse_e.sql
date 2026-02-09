DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  fac_pranitha UUID; fac_kranthi UUID; fac_sindhu UUID; fac_sunitha UUID; fac_sanjeev UUID;
  fac_sharmila UUID; fac_venkateshwar UUID;
  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;
BEGIN
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-E');
  DELETE FROM timetables WHERE name = 'CSE-E Final';

  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-E', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-E';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Ms. U. Pranitha', 'u.pranitha@cvr.ac.in', dept_id),
  ('Mr. Kranthi Kumar', 'kranthi.kumar@cvr.ac.in', dept_id),
  ('Mrs. B. Sindhu', 'b.sindhu@cvr.ac.in', dept_id),
  ('Ms. Y. Sunitha', 'y.sunitha@cvr.ac.in', dept_id),
  ('Mr. B. Sanjeev', 'b.sanjeev@cvr.ac.in', dept_id),
  ('Mrs. B. Sharmila', 'b.sharmila@cvr.ac.in', dept_id),
  ('Dr. P. Venkateshwar Rao', 'p.venkateshwar@cvr.ac.in', dept_id),
  ('Faculty OB-E', 'faculty.ob.e@cvr.ac.in', dept_id),
  ('Faculty DP-E', 'faculty.dp.e@cvr.ac.in', dept_id),
  ('Faculty GAI-E', 'faculty.gai.e@cvr.ac.in', dept_id),
  ('Faculty Guide-E', 'faculty.guide.e@cvr.ac.in', dept_id),
  ('Faculty Sports-E', 'faculty.sports.e@cvr.ac.in', dept_id),
  ('Faculty Library-E', 'faculty.library.e@cvr.ac.in', dept_id),
  ('Faculty Minor-E', 'faculty.minor.e@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO fac_pranitha FROM faculty WHERE email = 'u.pranitha@cvr.ac.in';
  SELECT id INTO fac_kranthi FROM faculty WHERE email = 'kranthi.kumar@cvr.ac.in';
  SELECT id INTO fac_sindhu FROM faculty WHERE email = 'b.sindhu@cvr.ac.in';
  SELECT id INTO fac_sunitha FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';
  SELECT id INTO fac_sanjeev FROM faculty WHERE email = 'b.sanjeev@cvr.ac.in';
  SELECT id INTO fac_sharmila FROM faculty WHERE email = 'b.sharmila@cvr.ac.in';
  SELECT id INTO fac_venkateshwar FROM faculty WHERE email = 'p.venkateshwar@cvr.ac.in';
  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.e@cvr.ac.in';
  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.e@cvr.ac.in';
  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.e@cvr.ac.in';
  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.e@cvr.ac.in';
  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.e@cvr.ac.in';
  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.e@cvr.ac.in';
  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.e@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('305 CB', 60, false),
  ('204 CM', 60, true),
  ('New Cellar', 60, true),
  ('205 CM', 60, false)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'OB', 'OB-E', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Design Patterns', 'DP-E', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Generative AI', 'GAI-E', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Project Work', 'PW-E', 'lab', 18, v_section_id),
  (gen_random_uuid(), 'OE / Mentoring', 'OE-E', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-E', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Sports', 'MS-E', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Library', 'LIB-E', 'theory', 1, v_section_id),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-E', 'theory', 2, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('CSE-E Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_kranthi, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sunitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sanjeev, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_kranthi, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sunitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sanjeev, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_kranthi, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sunitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sharmila, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='OE-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sanjeev, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pranitha, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_guide, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='IG-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sports, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MS-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ob, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='OB-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_dp, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='DP-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_gai, (SELECT id FROM classrooms WHERE name='205 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='GAI-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_kranthi, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_sindhu, (SELECT id FROM classrooms WHERE name='204 CM'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_lib, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='LIB-E'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_minor, (SELECT id FROM classrooms WHERE name='305 CB'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='MIG-E'));
  RAISE NOTICE 'CSE-E Timetable Generated Successfully!';
END $$;
