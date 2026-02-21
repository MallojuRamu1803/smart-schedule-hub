DO $$
DECLARE
  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;
  fac_padma UUID; fac_krishna UUID; fac_swathi UUID; fac_srivani UUID; fac_varaprasad UUID; fac_basavaraj UUID; fac_ranadheer UUID;
  fac_pe4 UUID; fac_pe5 UUID; fac_review UUID;
  subj_pe4 UUID; subj_pe5 UUID; subj_pw UUID; subj_pr UUID;
BEGIN
  INSERT INTO departments (id, name, code) VALUES (gen_random_uuid(), 'Computer Science and Data Science', 'CSD') ON CONFLICT (code) DO NOTHING;
  SELECT id INTO dept_id FROM departments WHERE code = 'CSD';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSD-A');
  DELETE FROM timetables WHERE name = 'CSD-A Final';

  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSD-A', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSD-A';

  INSERT INTO faculty (name, email, department_id) VALUES 
  ('Mrs. Padma', 'padma@cvr.ac.in', dept_id),
  ('Mr. E. Krishna', 'e.krishna@cvr.ac.in', dept_id),
  ('Mrs. V. Swathi', 'v.swathi@cvr.ac.in', dept_id),
  ('Mrs. M. Srivani', 'm.srivani@cvr.ac.in', dept_id),
  ('Dr. M. Varaprasad Rao', 'm.varaprasad@cvr.ac.in', dept_id),
  ('Dr. Basavaraj Chunchure', 'b.chunchure@cvr.ac.in', dept_id),
  ('Mr. K. S. Ranadheer Kumar', 'ranadheer.kumar@cvr.ac.in', dept_id),
  ('Faculty PE-IV', 'faculty.pe4.csd@cvr.ac.in', dept_id),
  ('Faculty PE-V', 'faculty.pe5.csd@cvr.ac.in', dept_id),
  ('Faculty Project Review', 'faculty.preview.csd@cvr.ac.in', dept_id),
  ('Faculty Library-CSD', 'faculty.lib.csd@cvr.ac.in', dept_id),
  ('Faculty Mentoring-CSD', 'faculty.men.csd@cvr.ac.in', dept_id)
  ON CONFLICT (email) DO NOTHING;

  SELECT id INTO fac_padma FROM faculty WHERE email = 'padma@cvr.ac.in';
  SELECT id INTO fac_krishna FROM faculty WHERE email = 'e.krishna@cvr.ac.in';
  SELECT id INTO fac_swathi FROM faculty WHERE email = 'v.swathi@cvr.ac.in';
  SELECT id INTO fac_srivani FROM faculty WHERE email = 'm.srivani@cvr.ac.in';
  SELECT id INTO fac_varaprasad FROM faculty WHERE email = 'm.varaprasad@cvr.ac.in';
  SELECT id INTO fac_basavaraj FROM faculty WHERE email = 'b.chunchure@cvr.ac.in';
  SELECT id INTO fac_ranadheer FROM faculty WHERE email = 'ranadheer.kumar@cvr.ac.in';
  SELECT id INTO fac_pe4 FROM faculty WHERE email = 'faculty.pe4.csd@cvr.ac.in';
  SELECT id INTO fac_pe5 FROM faculty WHERE email = 'faculty.pe5.csd@cvr.ac.in';
  SELECT id INTO fac_review FROM faculty WHERE email = 'faculty.preview.csd@cvr.ac.in';

  INSERT INTO classrooms (name, capacity, is_lab) VALUES 
  ('PG-101', 60, false),
  ('PG-402', 60, true)
  ON CONFLICT (name) DO NOTHING;

  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES
  (gen_random_uuid(), 'Professional Elective-IV', 'PE-IV', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Professional Elective-V', 'PE-V', 'theory', 3, v_section_id),
  (gen_random_uuid(), 'Project Stage-II', 'PW-CSD', 'lab', 18, v_section_id),
  (gen_random_uuid(), 'Project Review', 'PR-CSD', 'lab', 3, v_section_id)
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  SELECT id INTO subj_pe4 FROM subjects WHERE code = 'PE-IV';
  SELECT id INTO subj_pe5 FROM subjects WHERE code = 'PE-V';
  SELECT id INTO subj_pw FROM subjects WHERE code = 'PW-CSD';
  SELECT id INTO subj_pr FROM subjects WHERE code = 'PR-CSD';

  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_padma, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_krishna, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_swathi, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_srivani, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_varaprasad, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_basavaraj, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_ranadheer, subj_pw, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_review, subj_pr, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_pe4, subj_pe4, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;
  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), fac_pe5, subj_pe5, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;

  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('CSD-A Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;

  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_padma, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_krishna, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_srivani, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_varaprasad, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_basavaraj, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Monday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pe4, (SELECT id FROM classrooms WHERE name='PG-101'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PE-IV'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pe5, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PE-V'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ranadheer, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_padma, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_krishna, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_srivani, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Tuesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pe4, (SELECT id FROM classrooms WHERE name='PG-101'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PE-IV'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pe5, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PE-V'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_varaprasad, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_basavaraj, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ranadheer, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_padma, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_krishna, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Wednesday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Thursday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_srivani, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Thursday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_varaprasad, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Thursday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_basavaraj, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Thursday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ranadheer, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Thursday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_padma, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Thursday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_review, (SELECT id FROM classrooms WHERE name='PG-101'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PR-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_review, (SELECT id FROM classrooms WHERE name='PG-101'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PR-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_review, (SELECT id FROM classrooms WHERE name='PG-101'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PR-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pe4, (SELECT id FROM classrooms WHERE name='PG-101'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PE-IV'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_pe5, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PE-V'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_krishna, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_swathi, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Friday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_srivani, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=1), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_varaprasad, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=2), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_basavaraj, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=4), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_ranadheer, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=5), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_padma, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=7), (SELECT id FROM subjects WHERE code='PW-CSD'));
  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES
  (timetable_id, v_section_id, fac_krishna, (SELECT id FROM classrooms WHERE name='PG-402'), (SELECT id FROM working_days WHERE day_name='Saturday'), (SELECT id FROM time_slots WHERE slot_order=8), (SELECT id FROM subjects WHERE code='PW-CSD'));
  RAISE NOTICE 'CSD-A Timetable Generated Successfully!';
END $$;
