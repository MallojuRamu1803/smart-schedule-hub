
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSE-E';
const DEPT_CODE = 'CSE';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Ms. U. Pranitha', email: 'u.pranitha@cvr.ac.in' }, // Existing
    { name: 'Mr. Kranthi Kumar', email: 'kranthi.kumar@cvr.ac.in' },
    { name: 'Mrs. B. Sindhu', email: 'b.sindhu@cvr.ac.in' }, // distinct from Smidhu?
    { name: 'Ms. Y. Sunitha', email: 'y.sunitha@cvr.ac.in' }, // Existing
    { name: 'Mr. B. Sanjeev', email: 'b.sanjeev@cvr.ac.in' },
    { name: 'Mrs. B. Sharmila', email: 'b.sharmila@cvr.ac.in' },
    { name: 'Dr. P. Venkateshwar Rao', email: 'p.venkateshwar@cvr.ac.in' }
];

// Placeholder Faculty
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty OB-E', email: 'faculty.ob.e@cvr.ac.in' },
    { name: 'Faculty DP-E', email: 'faculty.dp.e@cvr.ac.in' },
    { name: 'Faculty GAI-E', email: 'faculty.gai.e@cvr.ac.in' },
    // No RPA
    { name: 'Faculty Guide-E', email: 'faculty.guide.e@cvr.ac.in' },
    { name: 'Faculty Sports-E', email: 'faculty.sports.e@cvr.ac.in' },
    { name: 'Faculty Library-E', email: 'faculty.library.e@cvr.ac.in' },
    { name: 'Faculty Minor-E', email: 'faculty.minor.e@cvr.ac.in' }
];

const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
const PW_TEAM_VARS = ['fac_pranitha', 'fac_kranthi', 'fac_sindhu', 'fac_sunitha', 'fac_sanjeev'];

// Rooms
const ROOM_MAIN = '305 CB';
const ROOM_PW = '204 CM'; // Primary PW Room
// Parallel Rooms
const ROOM_DP = '305 CB';
const ROOM_GAI = '205 CM';

const ROOMS_TO_INSERT = [
    { name: '305 CB', capacity: 60, is_lab: false },
    { name: '204 CM', capacity: 60, is_lab: true },
    { name: 'New Cellar', capacity: 60, is_lab: true },
    { name: '205 CM', capacity: 60, is_lab: false }
];

// Subjects
const SUBJECTS = [
    { code: 'OB-E', name: 'OB', hours: 3, type: 'theory' },
    { code: 'DP-E', name: 'Design Patterns', hours: 3, type: 'theory' },
    { code: 'GAI-E', name: 'Generative AI', hours: 3, type: 'theory' },
    // No RPA
    { code: 'PW-E', name: 'Project Work', hours: 18, type: 'lab' },
    { code: 'OE-E', name: 'OE / Mentoring', hours: 1, type: 'theory' },
    { code: 'IG-E', name: 'Interaction with Guide', hours: 1, type: 'theory' },
    { code: 'MS-E', name: 'Minor / Sports', hours: 1, type: 'theory' },
    { code: 'LIB-E', name: 'Library', hours: 1, type: 'theory' },
    { code: 'MIG-E', name: 'Minor / Interaction', hours: 2, type: 'theory' }
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_pranitha UUID; fac_kranthi UUID; fac_sindhu UUID; fac_sunitha UUID; fac_sanjeev UUID;\n';
sql += '  fac_sharmila UUID; fac_venkateshwar UUID;\n';
sql += '  fac_ob UUID; fac_dp UUID; fac_gai UUID; fac_guide UUID; fac_sports UUID; fac_lib UUID; fac_minor UUID;\n';
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
sql += "  SELECT id INTO fac_pranitha FROM faculty WHERE email = 'u.pranitha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_kranthi FROM faculty WHERE email = 'kranthi.kumar@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sindhu FROM faculty WHERE email = 'b.sindhu@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sunitha FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sanjeev FROM faculty WHERE email = 'b.sanjeev@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sharmila FROM faculty WHERE email = 'b.sharmila@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_venkateshwar FROM faculty WHERE email = 'p.venkateshwar@cvr.ac.in';\n";

sql += "  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.e@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.e@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.e@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.e@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.e@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.e@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.e@cvr.ac.in';\n";
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

// 2. Schedule Logic

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
    addEntry('Monday', slot, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);
});

// WEDNESDAY: All PW (6 slots)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Wednesday', slot, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);
});

// TUESDAY
addEntry('Tuesday', 1, 'OB-E', 'fac_ob', ROOM_MAIN);
// Parallel 10-11 (Slot 2) - Only DP & GAI
addEntry('Tuesday', 2, 'DP-E', 'fac_dp', ROOM_DP);
addEntry('Tuesday', 2, 'GAI-E', 'fac_gai', ROOM_GAI);

addEntry('Tuesday', 4, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Tuesday', 5, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Tuesday', 7, 'OE-E', 'fac_sharmila', ROOM_MAIN); // Mentoring
addEntry('Tuesday', 8, 'MIG-E', 'fac_minor', ROOM_MAIN);

// FRIDAY
addEntry('Friday', 1, 'OB-E', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Friday', 2, 'DP-E', 'fac_dp', ROOM_DP);
addEntry('Friday', 2, 'GAI-E', 'fac_gai', ROOM_GAI);

addEntry('Friday', 4, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Friday', 5, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Friday', 7, 'IG-E', 'fac_guide', ROOM_MAIN);
addEntry('Friday', 8, 'MS-E', 'fac_sports', ROOM_MAIN);

// SATURDAY
addEntry('Saturday', 1, 'OB-E', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Saturday', 2, 'DP-E', 'fac_dp', ROOM_DP);
addEntry('Saturday', 2, 'GAI-E', 'fac_gai', ROOM_GAI);

addEntry('Saturday', 4, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Saturday', 5, 'PW-E', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Saturday', 7, 'LIB-E', 'fac_lib', ROOM_MAIN);
addEntry('Saturday', 8, 'MIG-E', 'fac_minor', ROOM_MAIN);


sql += "  RAISE NOTICE 'CSE-E Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_cse_e.sql', sql);
console.log('SQL Generated: supabase/seed_cse_e.sql');
