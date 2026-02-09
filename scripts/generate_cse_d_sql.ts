
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSE-D';
const DEPT_CODE = 'CSE';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Mrs. M. Sunitha', email: 'm.sunitha@cvr.ac.in' },
    { name: 'Mr. P. Sudhakar', email: 'p.sudhakar@cvr.ac.in' }, // Reusing Sudhakar from C if same, else duplicate is fine if email distinct? existing in C as p.sudhakar.
    { name: 'Mrs. R. Sudha Dharani', email: 'r.sudharani.d@cvr.ac.in' }, // C has r.sudharani. Distinct? C was Ms. R. Sudharani. D is Mrs. R. Sudha Dharani. Likely same person. I'll use a new email to be safe or reuse if exact matches. I'll use new.
    { name: 'Ms. T. Jyothi', email: 't.jyothi@cvr.ac.in' },
    { name: 'Mr. D. Ganesh', email: 'd.ganesh@cvr.ac.in' },
    { name: 'Mrs. IBN. Hima Bindu', email: 'hima.bindu@cvr.ac.in' },
    { name: 'Mrs. G. Shravya', email: 'g.shravya@cvr.ac.in' },
    { name: 'Dr. A. Soujanya', email: 'a.soujanya@cvr.ac.in' },
    { name: 'Mr. S. Srinivas', email: 's.srinivas@cvr.ac.in' }
];

// Placeholder Faculty
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty OB-D', email: 'faculty.ob.d@cvr.ac.in' },
    { name: 'Faculty DP-D', email: 'faculty.dp.d@cvr.ac.in' },
    { name: 'Faculty GAI-D', email: 'faculty.gai.d@cvr.ac.in' },
    { name: 'Faculty RPA-D', email: 'faculty.rpa.d@cvr.ac.in' },
    { name: 'Faculty Guide-D', email: 'faculty.guide.d@cvr.ac.in' },
    { name: 'Faculty Sports-D', email: 'faculty.sports.d@cvr.ac.in' },
    { name: 'Faculty Library-D', email: 'faculty.library.d@cvr.ac.in' },
    { name: 'Faculty Minor-D', email: 'faculty.minor.d@cvr.ac.in' }
];

const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
// Mrs. M. Sunitha, Mr. Sudhakar, Mrs. R. Sudha Dharani, Ms. T. Jyothi, Mr. D. Ganesh, Mrs. IBN. Hima Bindu, Mrs. G. Shravya
const PW_TEAM_VARS = ['fac_msunitha', 'fac_sudhakar', 'fac_sudhadharani', 'fac_jyothi', 'fac_ganesh', 'fac_himabindu', 'fac_shravya'];

// Rooms
const ROOM_MAIN = '304 CB';
const ROOM_PW = '204 CB'; // Using 204 CB as primary PW room
// Parallel Rooms
const ROOM_DP = '304 CB';
const ROOM_GAI = '205 CM';
const ROOM_RPA = '101 CM';

const ROOMS_TO_INSERT = [
    { name: '304 CB', capacity: 60, is_lab: false },
    { name: '204 CB', capacity: 60, is_lab: true }, // PW Room
    { name: 'Projects Lab', capacity: 60, is_lab: true }, // Extra PW Room
    { name: '205 CM', capacity: 60, is_lab: false },
    { name: '101 CM', capacity: 60, is_lab: false }
];

// Subjects
const SUBJECTS = [
    { code: 'OB-D', name: 'OB', hours: 3, type: 'theory' },
    { code: 'DP-D', name: 'Design Patterns', hours: 3, type: 'theory' },
    { code: 'GAI-D', name: 'Generative AI', hours: 3, type: 'theory' },
    { code: 'RPA-D', name: 'RPA', hours: 3, type: 'theory' },
    { code: 'PW-D', name: 'Project Work', hours: 18, type: 'lab' },
    { code: 'OE-D', name: 'OE / Mentoring', hours: 1, type: 'theory' },
    { code: 'IG-D', name: 'Interaction with Guide', hours: 1, type: 'theory' },
    { code: 'MS-D', name: 'Minor / Sports', hours: 1, type: 'theory' },
    { code: 'LIB-D', name: 'Library', hours: 1, type: 'theory' },
    { code: 'MIG-D', name: 'Minor / Interaction', hours: 2, type: 'theory' }
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_msunitha UUID; fac_sudhakar UUID; fac_sudhadharani UUID; fac_jyothi UUID; fac_ganesh UUID; fac_himabindu UUID; fac_shravya UUID;\n';
sql += '  fac_soujanya UUID; fac_srinivas UUID;\n';
sql += '  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_rpa UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;\n';
sql += 'BEGIN\n';

// 1. Setup Data
sql += `  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = '${SECTION_NAME}');\n`;
sql += `  DELETE FROM timetables WHERE name = '${SECTION_NAME} Final';\n`;
sql += "\n";

sql += `  SELECT id INTO dept_id FROM departments WHERE code = '${DEPT_CODE}';\n`;
sql += `  SELECT id INTO acad_year_id FROM academic_years WHERE year = '${ACAD_YEAR}' AND semester = 2;\n`;

// Section
sql += `  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), '${SECTION_NAME}', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;\n`;
sql += `  SELECT id INTO v_section_id FROM sections WHERE name = '${SECTION_NAME}';\n`;
sql += "\n";

// Faculty Insert
sql += "  INSERT INTO faculty (name, email, department_id) VALUES \n";
const facValues = ALL_FACULTY_TO_INSERT.map(f => `  ('${f.name}', '${f.email}', dept_id)`).join(',\n');
sql += facValues + "\n  ON CONFLICT (email) DO NOTHING;\n\n";

// Faculty Selects
sql += "  SELECT id INTO fac_msunitha FROM faculty WHERE email = 'm.sunitha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sudhakar FROM faculty WHERE email = 'p.sudhakar@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sudhadharani FROM faculty WHERE email = 'r.sudharani.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_jyothi FROM faculty WHERE email = 't.jyothi@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_ganesh FROM faculty WHERE email = 'd.ganesh@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_himabindu FROM faculty WHERE email = 'hima.bindu@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_shravya FROM faculty WHERE email = 'g.shravya@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_soujanya FROM faculty WHERE email = 'a.soujanya@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_srinivas FROM faculty WHERE email = 's.srinivas@cvr.ac.in';\n";

sql += "  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.d@cvr.ac.in';\n";
sql += "\n";

// Classroom Insert
sql += "  INSERT INTO classrooms (name, capacity, is_lab) VALUES \n";
const roomValues = ROOMS_TO_INSERT.map(r => `  ('${r.name}', ${r.capacity}, ${r.is_lab})`).join(',\n');
sql += roomValues + "\n  ON CONFLICT (name) DO NOTHING;\n\n";

// Subjects Insert
sql += "  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES\n";
const subjValues = SUBJECTS.map(s => `  (gen_random_uuid(), '${s.name}', '${s.code}', '${s.type}', ${s.hours}, v_section_id)`).join(',\n');
sql += subjValues + "\n  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;\n\n";

// Timetable Record
sql += `  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status) VALUES ('${SECTION_NAME} Final', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;\n\n`;

// 2. Schedule Logic (Pattern: Mon/Wed PW, Tue/Fri/Sat mixed)

// Helper to get PW Faculty Var Name based on name
const getPwFacVar = (index: number) => {
    return PW_TEAM_VARS[index % PW_TEAM_VARS.length];
};

let pwCounter = 0;
const addEntry = (day: string, slot: number, subjectCode: string, facVar: string, room: string) => {
    sql += `  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES\n`;
    sql += `  (timetable_id, v_section_id, ${facVar}, (SELECT id FROM classrooms WHERE name='${room}'), (SELECT id FROM working_days WHERE day_name='${day}'), (SELECT id FROM time_slots WHERE slot_order=${slot}), (SELECT id FROM subjects WHERE code='${subjectCode}'));\n`;
};

// MONDAY: All PW (6 slots: 1,2, 4,5, 7,8)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Monday', slot, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);
});

// WEDNESDAY: All PW (6 slots)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Wednesday', slot, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);
});

// TUESDAY
addEntry('Tuesday', 1, 'OB-D', 'fac_ob', ROOM_MAIN);
// Parallel 10-11
addEntry('Tuesday', 2, 'DP-D', 'fac_dp', ROOM_DP);
addEntry('Tuesday', 2, 'GAI-D', 'fac_gai', ROOM_GAI);
addEntry('Tuesday', 2, 'RPA-D', 'fac_rpa', ROOM_RPA);

addEntry('Tuesday', 4, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Tuesday', 5, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Tuesday', 7, 'OE-D', 'fac_soujanya', ROOM_MAIN); // Mentoring/OE
addEntry('Tuesday', 8, 'MIG-D', 'fac_minor', ROOM_MAIN);

// FRIDAY
addEntry('Friday', 1, 'OB-D', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Friday', 2, 'DP-D', 'fac_dp', ROOM_DP);
addEntry('Friday', 2, 'GAI-D', 'fac_gai', ROOM_GAI);
addEntry('Friday', 2, 'RPA-D', 'fac_rpa', ROOM_RPA);

addEntry('Friday', 4, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Friday', 5, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Friday', 7, 'IG-D', 'fac_guide', ROOM_MAIN);
addEntry('Friday', 8, 'MS-D', 'fac_sports', ROOM_MAIN);

// SATURDAY
addEntry('Saturday', 1, 'OB-D', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Saturday', 2, 'DP-D', 'fac_dp', ROOM_DP);
addEntry('Saturday', 2, 'GAI-D', 'fac_gai', ROOM_GAI);
addEntry('Saturday', 2, 'RPA-D', 'fac_rpa', ROOM_RPA);

addEntry('Saturday', 4, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Saturday', 5, 'PW-D', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Saturday', 7, 'LIB-D', 'fac_lib', ROOM_MAIN);
addEntry('Saturday', 8, 'MIG-D', 'fac_minor', ROOM_MAIN);


sql += "  RAISE NOTICE 'CSE-D Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_cse_d.sql', sql);
console.log('SQL Generated: supabase/seed_cse_d.sql');
