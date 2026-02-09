
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSE-B';
const DEPT_CODE = 'CSE';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Mr. K. Surendra', email: 'k.surendra@cvr.ac.in' },
    { name: 'Mrs. N. Archana', email: 'n.archana@cvr.ac.in' },
    { name: 'Mr. A. Pramod Raj', email: 'pramod.raj@cvr.ac.in' },
    { name: 'Mr. G. Shrava', email: 'g.shrava@cvr.ac.in' },
    { name: 'Ms. U. Pranitha', email: 'u.pranitha@cvr.ac.in' },
    { name: 'Mrs. B. Smidhu', email: 'b.smidhu@cvr.ac.in' },
    { name: 'Mrs. K. Deepthi Reddy', email: 'k.deepthi@cvr.ac.in' }
];

// Placeholder Faculty (Reuse some or create new specific to B if needed)
// reusing generic placeholders or existing ones
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty OB-B', email: 'faculty.ob.b@cvr.ac.in' },
    { name: 'Faculty DP-B', email: 'faculty.dp.b@cvr.ac.in' },
    { name: 'Faculty GAI-B', email: 'faculty.gai.b@cvr.ac.in' },
    { name: 'Faculty RPA-B', email: 'faculty.rpa.b@cvr.ac.in' },
    { name: 'Faculty Guide-B', email: 'faculty.guide.b@cvr.ac.in' },
    { name: 'Faculty Sports-B', email: 'faculty.sports.b@cvr.ac.in' },
    { name: 'Faculty Library-B', email: 'faculty.library.b@cvr.ac.in' },
    { name: 'Faculty Minor-B', email: 'faculty.minor.b@cvr.ac.in' }
];

// Combine
const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
// Mr. K. Surendra, Mrs. N. Archana, Mr. A. Pramod Raj, Mr. G. Shrava, Ms. U. Pranitha
const PW_TEAM_VARS = ['fac_surendra', 'fac_archana', 'fac_pramod', 'fac_shrava', 'fac_pranitha'];

// Rooms
const ROOM_MAIN = '302 CB';
const ROOM_PW = 'Old Cellar';
const ROOM_DP = '302 CB';
const ROOM_GAI = '303 CB';
const ROOM_RPA = '101 CM';

const ROOMS_TO_INSERT = [
    { name: '302 CB', capacity: 60, is_lab: false },
    { name: 'Old Cellar', capacity: 60, is_lab: true },
    { name: '303 CB', capacity: 60, is_lab: false },
    { name: '101 CM', capacity: 60, is_lab: false }
];

// Subjects
const SUBJECTS = [
    { code: 'OB-B', name: 'OB', hours: 3, type: 'theory' },
    { code: 'DP-B', name: 'Design Patterns', hours: 3, type: 'theory' },
    { code: 'GAI-B', name: 'Generative AI', hours: 3, type: 'theory' },
    { code: 'RPA-B', name: 'RPA', hours: 3, type: 'theory' },
    { code: 'PW-B', name: 'Project Work', hours: 18, type: 'lab' },
    { code: 'OE-B', name: 'OE / Mentoring', hours: 1, type: 'theory' },
    { code: 'IG-B', name: 'Interaction with Guide', hours: 1, type: 'theory' },
    { code: 'MS-B', name: 'Minor / Sports', hours: 1, type: 'theory' },
    { code: 'LIB-B', name: 'Library', hours: 1, type: 'theory' },
    { code: 'MIG-B', name: 'Minor / Interaction', hours: 2, type: 'theory' }
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_surendra UUID; fac_archana UUID; fac_pramod UUID; fac_shrava UUID; fac_pranitha UUID;\n';
sql += '  fac_smidhu UUID; fac_sunitha UUID; fac_deepthi UUID;\n';
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
sql += "  SELECT id INTO fac_surendra FROM faculty WHERE email = 'k.surendra@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_archana FROM faculty WHERE email = 'n.archana@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_pramod FROM faculty WHERE email = 'pramod.raj@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_shrava FROM faculty WHERE email = 'g.shrava@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_pranitha FROM faculty WHERE email = 'u.pranitha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_smidhu FROM faculty WHERE email = 'b.smidhu@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_deepthi FROM faculty WHERE email = 'k.deepthi@cvr.ac.in';\n";
// Existing Sunitha
sql += "  SELECT id INTO fac_sunitha FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';\n";

sql += "  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.b@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.b@cvr.ac.in';\n";
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

// 2. Schedule Logic (Manual Mapping - Same Pattern as A)

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
    addEntry('Monday', slot, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);
});

// WEDNESDAY: All PW (6 slots)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Wednesday', slot, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);
});

// TUESDAY
addEntry('Tuesday', 1, 'OB-B', 'fac_ob', ROOM_MAIN);
// Parallel 10-11
addEntry('Tuesday', 2, 'DP-B', 'fac_dp', ROOM_DP);
addEntry('Tuesday', 2, 'GAI-B', 'fac_gai', ROOM_GAI);
addEntry('Tuesday', 2, 'RPA-B', 'fac_rpa', ROOM_RPA);

addEntry('Tuesday', 4, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Tuesday', 5, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Tuesday', 7, 'OE-B', 'fac_smidhu', ROOM_MAIN); // OE 1
addEntry('Tuesday', 8, 'MIG-B', 'fac_minor', ROOM_MAIN);

// FRIDAY
addEntry('Friday', 1, 'OB-B', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Friday', 2, 'DP-B', 'fac_dp', ROOM_DP);
addEntry('Friday', 2, 'GAI-B', 'fac_gai', ROOM_GAI);
addEntry('Friday', 2, 'RPA-B', 'fac_rpa', ROOM_RPA);

addEntry('Friday', 4, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Friday', 5, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Friday', 7, 'IG-B', 'fac_guide', ROOM_MAIN);
addEntry('Friday', 8, 'MS-B', 'fac_sports', ROOM_MAIN);

// SATURDAY
addEntry('Saturday', 1, 'OB-B', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Saturday', 2, 'DP-B', 'fac_dp', ROOM_DP);
addEntry('Saturday', 2, 'GAI-B', 'fac_gai', ROOM_GAI);
addEntry('Saturday', 2, 'RPA-B', 'fac_rpa', ROOM_RPA);

addEntry('Saturday', 4, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Saturday', 5, 'PW-B', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Saturday', 7, 'LIB-B', 'fac_lib', ROOM_MAIN);
addEntry('Saturday', 8, 'MIG-B', 'fac_minor', ROOM_MAIN);


sql += "  RAISE NOTICE 'CSE-B Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_cse_b.sql', sql);
console.log('SQL Generated: supabase/seed_cse_b.sql');
