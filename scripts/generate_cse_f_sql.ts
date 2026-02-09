
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSE-F';
const DEPT_CODE = 'CSE';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Mrs. A. Uma Rani', email: 'a.uma.rani@cvr.ac.in' },
    { name: 'Mrs. R. Sudha Dharani', email: 'r.sudharani.d@cvr.ac.in' }, // Existing
    { name: 'Mrs. G. Shravya', email: 'g.shravya@cvr.ac.in' }, // Existing
    { name: 'Mrs. B. Sindhu', email: 'b.sindhu@cvr.ac.in' }, // Existing
    { name: 'Mrs. B. Divya Jyothi', email: 'b.divya.jyothi@cvr.ac.in' },
    { name: 'Mrs. Sabavath Manjula', email: 's.manjula@cvr.ac.in' },
    { name: 'Mrs. N. Archana', email: 'n.archana@cvr.ac.in' }, // Existing
    { name: 'Mrs. M. Ratna Sirisha', email: 'm.ratnasirisha@cvr.ac.in' }, // Existing
    { name: 'Dr. L. Shrisha', email: 'l.shrisha@cvr.ac.in' }
];

// Placeholder Faculty
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty OB-F', email: 'faculty.ob.f@cvr.ac.in' },
    { name: 'Faculty DP-F', email: 'faculty.dp.f@cvr.ac.in' },
    { name: 'Faculty GAI-F', email: 'faculty.gai.f@cvr.ac.in' },
    { name: 'Faculty RPA-F', email: 'faculty.rpa.f@cvr.ac.in' },
    { name: 'Faculty Guide-F', email: 'faculty.guide.f@cvr.ac.in' },
    { name: 'Faculty Sports-F', email: 'faculty.sports.f@cvr.ac.in' },
    { name: 'Faculty Library-F', email: 'faculty.library.f@cvr.ac.in' },
    { name: 'Faculty Minor-F', email: 'faculty.minor.f@cvr.ac.in' }
];

const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
const PW_TEAM_VARS = ['fac_uma', 'fac_sudhadharani', 'fac_shravya', 'fac_sindhu', 'fac_divya', 'fac_manjula', 'fac_archana'];

// Rooms
const ROOM_MAIN = '306 CB';
const ROOM_PW = '308 CM'; // Primary PW room based on list
// Parallel Rooms
const ROOM_DP = '306 CB';
const ROOM_GAI = '205 CM';
const ROOM_RPA = '206 CM';

const ROOMS_TO_INSERT = [
    { name: '306 CB', capacity: 60, is_lab: false },
    { name: '308 CM', capacity: 60, is_lab: true },
    { name: 'Old Cellar', capacity: 60, is_lab: true },
    { name: '205 CM', capacity: 60, is_lab: false },
    { name: '206 CM', capacity: 60, is_lab: false }
];

// Subjects
const SUBJECTS = [
    { code: 'OB-F', name: 'OB', hours: 3, type: 'theory' },
    { code: 'DP-F', name: 'Design Patterns', hours: 3, type: 'theory' },
    { code: 'GAI-F', name: 'Generative AI', hours: 3, type: 'theory' },
    { code: 'RPA-F', name: 'RPA', hours: 3, type: 'theory' },
    { code: 'PW-F', name: 'Project Work', hours: 18, type: 'lab' },
    { code: 'OE-F', name: 'OE / Mentoring', hours: 1, type: 'theory' },
    { code: 'IG-F', name: 'Interaction with Guide', hours: 1, type: 'theory' },
    { code: 'MS-F', name: 'Minor / Sports', hours: 1, type: 'theory' },
    { code: 'LIB-F', name: 'Library', hours: 1, type: 'theory' },
    { code: 'MIG-F', name: 'Minor / Interaction', hours: 2, type: 'theory' }
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_uma UUID; fac_sudhadharani UUID; fac_shravya UUID; fac_sindhu UUID; fac_divya UUID; fac_manjula UUID; fac_archana UUID;\n';
sql += '  fac_ratna UUID; fac_shrisha UUID;\n';
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
sql += "  SELECT id INTO fac_uma FROM faculty WHERE email = 'a.uma.rani@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sudhadharani FROM faculty WHERE email = 'r.sudharani.d@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_shravya FROM faculty WHERE email = 'g.shravya@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sindhu FROM faculty WHERE email = 'b.sindhu@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_divya FROM faculty WHERE email = 'b.divya.jyothi@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_manjula FROM faculty WHERE email = 's.manjula@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_archana FROM faculty WHERE email = 'n.archana@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_ratna FROM faculty WHERE email = 'm.ratnasirisha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_shrisha FROM faculty WHERE email = 'l.shrisha@cvr.ac.in';\n";

sql += "  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library.f@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor.f@cvr.ac.in';\n";
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
    addEntry('Monday', slot, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);
});

// WEDNESDAY: All PW (6 slots)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Wednesday', slot, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);
});

// TUESDAY
addEntry('Tuesday', 1, 'OB-F', 'fac_ob', ROOM_MAIN);
// Parallel 10-11
addEntry('Tuesday', 2, 'DP-F', 'fac_dp', ROOM_DP);
addEntry('Tuesday', 2, 'GAI-F', 'fac_gai', ROOM_GAI);
addEntry('Tuesday', 2, 'RPA-F', 'fac_rpa', ROOM_RPA);

addEntry('Tuesday', 4, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Tuesday', 5, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Tuesday', 7, 'OE-F', 'fac_ratna', ROOM_MAIN); // Mentoring
addEntry('Tuesday', 8, 'MIG-F', 'fac_minor', ROOM_MAIN);

// FRIDAY
addEntry('Friday', 1, 'OB-F', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Friday', 2, 'DP-F', 'fac_dp', ROOM_DP);
addEntry('Friday', 2, 'GAI-F', 'fac_gai', ROOM_GAI);
addEntry('Friday', 2, 'RPA-F', 'fac_rpa', ROOM_RPA);

addEntry('Friday', 4, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Friday', 5, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Friday', 7, 'IG-F', 'fac_guide', ROOM_MAIN);
addEntry('Friday', 8, 'MS-F', 'fac_sports', ROOM_MAIN);

// SATURDAY
addEntry('Saturday', 1, 'OB-F', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Saturday', 2, 'DP-F', 'fac_dp', ROOM_DP);
addEntry('Saturday', 2, 'GAI-F', 'fac_gai', ROOM_GAI);
addEntry('Saturday', 2, 'RPA-F', 'fac_rpa', ROOM_RPA);

addEntry('Saturday', 4, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);
addEntry('Saturday', 5, 'PW-F', getPwFacVar(pwCounter++), ROOM_PW);

addEntry('Saturday', 7, 'LIB-F', 'fac_lib', ROOM_MAIN);
addEntry('Saturday', 8, 'MIG-F', 'fac_minor', ROOM_MAIN);


sql += "  RAISE NOTICE 'CSE-F Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_cse_f.sql', sql);
console.log('SQL Generated: supabase/seed_cse_f.sql');
