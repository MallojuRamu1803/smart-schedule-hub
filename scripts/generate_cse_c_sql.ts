
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSE-C';
const DEPT_CODE = 'CSE';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Ms. M. Nagamani', email: 'm.nagamani@cvr.ac.in' }, // Existing
    { name: 'Mr. Singam Chandra Sekhar', email: 'singam.chandra@cvr.ac.in' },
    { name: 'Mr. A. Bharat', email: 'a.bharat@cvr.ac.in' },
    { name: 'Ms. V. Spandana', email: 'v.spandana@cvr.ac.in' }, // Existing
    { name: 'Ms. O. Swathi', email: 'o.swathi@cvr.ac.in' },
    { name: 'Mrs. K. Anusha', email: 'k.anusha@cvr.ac.in' }, // Existing
    { name: 'Mr. P. Sudhakar', email: 'p.sudhakar@cvr.ac.in' },
    { name: 'Ms. R. Sudharani', email: 'r.sudharani@cvr.ac.in' }
];

// Placeholder Faculty
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty OB-C', email: 'faculty.ob.c@cvr.ac.in' },
    { name: 'Faculty DP-C', email: 'faculty.dp.c@cvr.ac.in' },
    { name: 'Faculty GAI-C', email: 'faculty.gai.c@cvr.ac.in' },
    { name: 'Faculty RPA-C', email: 'faculty.rpa.c@cvr.ac.in' },
    { name: 'Faculty Guide-C', email: 'faculty.guide.c@cvr.ac.in' },
    { name: 'Faculty Sports-C', email: 'faculty.sports.c@cvr.ac.in' },
    { name: 'Faculty Library-C', email: 'faculty.library.c@cvr.ac.in' },
    { name: 'Faculty Minor-C', email: 'faculty.minor.c@cvr.ac.in' }
];

const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
const PW_TEAM_VARS = ['fac_nagamani', 'fac_singam', 'fac_bharat', 'fac_spandana', 'fac_swathi', 'fac_anusha'];

// Rooms
const ROOM_MAIN = '303 CB';
const ROOM_PW = 'New Cellar';
// Parallel Rooms
const ROOM_DP = '302 CB'; // B1 Room
const ROOM_GAI = '303 CB';
const ROOM_RPA = '206 CM';

const ROOMS_TO_INSERT = [
    { name: '303 CB', capacity: 60, is_lab: false },
    { name: 'New Cellar', capacity: 60, is_lab: true },
    { name: '302 CB', capacity: 60, is_lab: false },
    { name: '306 CB', capacity: 60, is_lab: false }, // B2 Room
    { name: '206 CM', capacity: 60, is_lab: false }
];

// Subjects
const SUBJECTS = [
    { code: 'OB-C', name: 'OB', hours: 3, type: 'theory' },
    { code: 'DP-C', name: 'Design Patterns', hours: 3, type: 'theory' },
    { code: 'GAI-C', name: 'Generative AI', hours: 3, type: 'theory' },
    { code: 'RPA-C', name: 'RPA', hours: 3, type: 'theory' },
    { code: 'PW-C', name: 'Project Work', hours: 18, type: 'lab' },
    { code: 'OE-C', name: 'OE / Mentoring', hours: 1, type: 'theory' },
    { code: 'IG-C', name: 'Interaction with Guide', hours: 1, type: 'theory' },
    { code: 'MS-C', name: 'Minor / Sports', hours: 1, type: 'theory' },
    { code: 'LIB-C', name: 'Library', hours: 1, type: 'theory' },
    { code: 'MIG-C', name: 'Minor / Interaction', hours: 2, type: 'theory' }
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_nagamani UUID; fac_singam UUID; fac_bharat UUID; fac_spandana UUID; fac_swathi UUID; fac_anusha UUID;\n';
sql += '  fac_sudhakar UUID; fac_sudharani UUID;\n';
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
sql += "  SELECT id INTO fac_nagamani FROM faculty WHERE email = 'm.nagamani@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_singam FROM faculty WHERE email = 'singam.chandra@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_bharat FROM faculty WHERE email = 'a.bharat@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_spandana FROM faculty WHERE email = 'v.spandana@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_swathi FROM faculty WHERE email = 'o.swathi@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_anusha FROM faculty WHERE email = 'k.anusha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sudhakar FROM faculty WHERE email = 'p.sudhakar@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sudharani FROM faculty WHERE email = 'r.sudharani@cvr.ac.in';\n";

sql += "  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.c@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.c@cvr.ac.in';\n";
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
    addEntry('Monday', slot, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);
});

// WEDNESDAY: All PW (6 slots)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Wednesday', slot, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);
});

// TUESDAY
addEntry('Tuesday', 1, 'OB-C', 'fac_ob', ROOM_MAIN);
// Parallel 10-11
addEntry('Tuesday', 2, 'DP-C', 'fac_dp', ROOM_DP);
addEntry('Tuesday', 2, 'GAI-C', 'fac_gai', ROOM_GAI);
addEntry('Tuesday', 2, 'RPA-C', 'fac_rpa', ROOM_RPA);

addEntry('Tuesday', 4, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Tuesday', 5, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Tuesday', 7, 'OE-C', 'fac_sudhakar', ROOM_MAIN); // Mentoring/OE
addEntry('Tuesday', 8, 'MIG-C', 'fac_minor', ROOM_MAIN);

// FRIDAY
addEntry('Friday', 1, 'OB-C', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Friday', 2, 'DP-C', 'fac_dp', ROOM_DP);
addEntry('Friday', 2, 'GAI-C', 'fac_gai', ROOM_GAI);
addEntry('Friday', 2, 'RPA-C', 'fac_rpa', ROOM_RPA);

addEntry('Friday', 4, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Friday', 5, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Friday', 7, 'IG-C', 'fac_guide', ROOM_MAIN);
addEntry('Friday', 8, 'MS-C', 'fac_sports', ROOM_MAIN);

// SATURDAY
addEntry('Saturday', 1, 'OB-C', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Saturday', 2, 'DP-C', 'fac_dp', ROOM_DP);
addEntry('Saturday', 2, 'GAI-C', 'fac_gai', ROOM_GAI);
addEntry('Saturday', 2, 'RPA-C', 'fac_rpa', ROOM_RPA);

addEntry('Saturday', 4, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Saturday', 5, 'PW-C', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Saturday', 7, 'LIB-C', 'fac_lib', ROOM_MAIN);
addEntry('Saturday', 8, 'MIG-C', 'fac_minor', ROOM_MAIN);


sql += "  RAISE NOTICE 'CSE-C Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_cse_c.sql', sql);
console.log('SQL Generated: supabase/seed_cse_c.sql');
