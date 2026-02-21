
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSD-A';
const DEPT_CODE = 'CSD';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Mrs. Padma', email: 'padma@cvr.ac.in' },
    { name: 'Mr. E. Krishna', email: 'e.krishna@cvr.ac.in' },
    { name: 'Mrs. V. Swathi', email: 'v.swathi@cvr.ac.in' },
    { name: 'Mrs. M. Srivani', email: 'm.srivani@cvr.ac.in' },
    { name: 'Dr. M. Varaprasad Rao', email: 'm.varaprasad@cvr.ac.in' },
    { name: 'Dr. Basavaraj Chunchure', email: 'b.chunchure@cvr.ac.in' },
    { name: 'Mr. K. S. Ranadheer Kumar', email: 'ranadheer.kumar@cvr.ac.in' }
];

// Placeholder Faculty
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty PE-IV', email: 'faculty.pe4.csd@cvr.ac.in' },
    { name: 'Faculty PE-V', email: 'faculty.pe5.csd@cvr.ac.in' },
    { name: 'Faculty Project Review', email: 'faculty.preview.csd@cvr.ac.in' },
    { name: 'Faculty Library-CSD', email: 'faculty.lib.csd@cvr.ac.in' },
    { name: 'Faculty Mentoring-CSD', email: 'faculty.men.csd@cvr.ac.in' }
];

const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
const PW_TEAM_VARS = ['fac_padma', 'fac_krishna', 'fac_swathi', 'fac_srivani', 'fac_varaprasad', 'fac_basavaraj', 'fac_ranadheer'];

// Rooms
const ROOM_MAIN = 'PG-101';
const ROOM_PW = 'PG-402';
const ROOM_PE4 = 'PG-101';
const ROOM_PE5 = 'PG-402';

const ROOMS_TO_INSERT = [
    { name: 'PG-101', capacity: 60, is_lab: false },
    { name: 'PG-402', capacity: 60, is_lab: true }
];

// Subjects
// PE-IV & V are 3 hours/week EACH (Parallel)
const SUBJECTS = [
    { code: 'PE-IV', name: 'Professional Elective-IV', hours: 3, type: 'theory' },
    { code: 'PE-V', name: 'Professional Elective-V', hours: 3, type: 'theory' },
    { code: 'PW-CSD', name: 'Project Stage-II', hours: 18, type: 'lab' },
    { code: 'PR-CSD', name: 'Project Review', hours: 3, type: 'lab' }
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_padma UUID; fac_krishna UUID; fac_swathi UUID; fac_srivani UUID; fac_varaprasad UUID; fac_basavaraj UUID; fac_ranadheer UUID;\n';
sql += '  fac_pe4 UUID; fac_pe5 UUID; fac_review UUID;\n';
// Subject Vars
sql += '  subj_pe4 UUID; subj_pe5 UUID; subj_pw UUID; subj_pr UUID;\n';
sql += 'BEGIN\n';

// 1. Setup Data
sql += `  INSERT INTO departments (id, name, code) VALUES (gen_random_uuid(), 'Computer Science and Data Science', '${DEPT_CODE}') ON CONFLICT (code) DO NOTHING;\n`;
sql += `  SELECT id INTO dept_id FROM departments WHERE code = '${DEPT_CODE}';\n`;

sql += `  SELECT id INTO acad_year_id FROM academic_years WHERE year = '${ACAD_YEAR}' AND semester = 2;\n`;

sql += `  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = '${SECTION_NAME}');\n`;
sql += `  DELETE FROM timetables WHERE name = '${SECTION_NAME} Final';\n`;
sql += "\n";

// Section
sql += `  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), '${SECTION_NAME}', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;\n`;
sql += `  SELECT id INTO v_section_id FROM sections WHERE name = '${SECTION_NAME}';\n`;
sql += "\n";

// Faculty Insert
sql += "  INSERT INTO faculty (name, email, department_id) VALUES \n";
const facValues = ALL_FACULTY_TO_INSERT.map(f => `  ('${f.name}', '${f.email}', dept_id)`).join(',\n');
sql += facValues + "\n  ON CONFLICT (email) DO NOTHING;\n\n";

// Faculty Selects
sql += "  SELECT id INTO fac_padma FROM faculty WHERE email = 'padma@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_krishna FROM faculty WHERE email = 'e.krishna@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_swathi FROM faculty WHERE email = 'v.swathi@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_srivani FROM faculty WHERE email = 'm.srivani@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_varaprasad FROM faculty WHERE email = 'm.varaprasad@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_basavaraj FROM faculty WHERE email = 'b.chunchure@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_ranadheer FROM faculty WHERE email = 'ranadheer.kumar@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_pe4 FROM faculty WHERE email = 'faculty.pe4.csd@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_pe5 FROM faculty WHERE email = 'faculty.pe5.csd@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_review FROM faculty WHERE email = 'faculty.preview.csd@cvr.ac.in';\n";
sql += "\n";

// Classroom Insert
sql += "  INSERT INTO classrooms (name, capacity, is_lab) VALUES \n";
const roomValues = ROOMS_TO_INSERT.map(r => `  ('${r.name}', ${r.capacity}, ${r.is_lab})`).join(',\n');
sql += roomValues + "\n  ON CONFLICT (name) DO NOTHING;\n\n";

// Subjects Insert
sql += "  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES\n";
const subjValues = SUBJECTS.map(s => `  (gen_random_uuid(), '${s.name}', '${s.code}', '${s.type}', ${s.hours}, v_section_id)`).join(',\n');
sql += subjValues + "\n  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;\n\n";

// Select Subject IDs
sql += "  SELECT id INTO subj_pe4 FROM subjects WHERE code = 'PE-IV';\n";
sql += "  SELECT id INTO subj_pe5 FROM subjects WHERE code = 'PE-V';\n";
sql += "  SELECT id INTO subj_pw FROM subjects WHERE code = 'PW-CSD';\n";
sql += "  SELECT id INTO subj_pr FROM subjects WHERE code = 'PR-CSD';\n";
sql += "\n";

// Fac->Subj Mappings in case of dynamic gen
const addMapping = (facVar: string, subjVar: string) => {
    sql += `  INSERT INTO faculty_subjects (id, faculty_id, subject_id, created_at) VALUES (gen_random_uuid(), ${facVar}, ${subjVar}, now()) ON CONFLICT (faculty_id, subject_id) DO NOTHING;\n`;
};
PW_TEAM_VARS.forEach(fac => addMapping(fac, 'subj_pw'));
addMapping('fac_review', 'subj_pr');
addMapping('fac_pe4', 'subj_pe4');
addMapping('fac_pe5', 'subj_pe5');
sql += "\n";

// Timetable Record
sql += `  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('${SECTION_NAME} Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;\n\n`;

// 2. Schedule Construction
// We will manually build the schedule to align perfectly with:
// 1. Parallel PE-IV/PE-V on 3 distinct days (1 hour each day).
// 2. Project Review on Friday.
// 3. Rest Project Work.

const getPwFac = (i: number) => PW_TEAM_VARS[i % PW_TEAM_VARS.length];
let p = 0;

const insert = (day: string, slot: number, code: string, fac: string, room: string) => {
    sql += `  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES\n`;
    sql += `  (timetable_id, v_section_id, ${fac}, (SELECT id FROM classrooms WHERE name='${room}'), (SELECT id FROM working_days WHERE day_name='${day}'), (SELECT id FROM time_slots WHERE slot_order=${slot}), (SELECT id FROM subjects WHERE code='${code}'));\n`;
};

// --- MONDAY ---
// All Project Work
[1, 2, 4, 5, 7, 8].forEach(s => insert('Monday', s, 'PW-CSD', getPwFac(p++), ROOM_PW));

// --- TUESDAY ---
// Slot 1: Parallel Elective Block 1
insert('Tuesday', 1, 'PE-IV', 'fac_pe4', ROOM_PE4);
insert('Tuesday', 1, 'PE-V', 'fac_pe5', ROOM_PE5);
// Rest Project
[2, 4, 5, 7, 8].forEach(s => insert('Tuesday', s, 'PW-CSD', getPwFac(p++), ROOM_PW));


// --- WEDNESDAY ---
// Slot 1: Parallel Elective Block 2
insert('Wednesday', 1, 'PE-IV', 'fac_pe4', ROOM_PE4);
insert('Wednesday', 1, 'PE-V', 'fac_pe5', ROOM_PE5);
// Rest Project
[2, 4, 5, 7, 8].forEach(s => insert('Wednesday', s, 'PW-CSD', getPwFac(p++), ROOM_PW));


// --- THURSDAY ---
// All Project Work
[1, 2, 4, 5, 7, 8].forEach(s => insert('Thursday', s, 'PW-CSD', getPwFac(p++), ROOM_PW));


// --- FRIDAY ---
// Review Morning (3 slots: 1,2,4)
[1, 2, 4].forEach(s => insert('Friday', s, 'PR-CSD', 'fac_review', ROOM_MAIN));
// Slot 5: Parallel Elective Block 3 (Afternoon start)
insert('Friday', 5, 'PE-IV', 'fac_pe4', ROOM_PE4);
insert('Friday', 5, 'PE-V', 'fac_pe5', ROOM_PE5);

// Rest Project (Slot 7,8)
[7, 8].forEach(s => insert('Friday', s, 'PW-CSD', getPwFac(p++), ROOM_PW));


// --- SATURDAY ---
// All Project Work (or spare?)
// Let's keep Saturday for Project Work to meet the ~18 hours demand.
[1, 2, 4, 5, 7, 8].forEach(s => insert('Saturday', s, 'PW-CSD', getPwFac(p++), ROOM_PW));


sql += "  RAISE NOTICE 'CSD-A Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_csd_a.sql', sql);
console.log('SQL Generated: supabase/seed_csd_a.sql');
