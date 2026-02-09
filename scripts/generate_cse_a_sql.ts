
import * as fs from 'fs';

// --- CONFIGURATION ---

const SECTION_NAME = 'CSE-A';
const DEPT_CODE = 'CSE';
const ACAD_YEAR = '2025-2026';

// Faculty Data
const NEW_FACULTY = [
    { name: 'Mr. G. Krishna Kishore', email: 'g.krishna@cvr.ac.in' },
    { name: 'Mrs. Ch. Lavanya', email: 'ch.lavanya@cvr.ac.in' },
    { name: 'Ms. M. Ratna Sirisha', email: 'm.ratnasirisha@cvr.ac.in' },
    { name: 'Mrs. K. Anusha', email: 'k.anusha@cvr.ac.in' },
    { name: 'Mrs. M. Nagamani', email: 'm.nagamani@cvr.ac.in' },
    { name: 'Dr. P. Sampoorna', email: 'p.sampoorna@cvr.ac.in' },
    { name: 'Mrs. D. Sriveni', email: 'd.sriveni@cvr.ac.in' },
    { name: 'Dr. V. Ramakrishna', email: 'v.ramakrishna@cvr.ac.in' }
];

// Placeholder Faculty for missing names
const PLACEHOLDER_FACULTY = [
    { name: 'Faculty OB', email: 'faculty.ob@cvr.ac.in' },
    { name: 'Faculty DP', email: 'faculty.dp@cvr.ac.in' },
    { name: 'Faculty GAI', email: 'faculty.gai@cvr.ac.in' },
    { name: 'Faculty RPA', email: 'faculty.rpa@cvr.ac.in' },
    { name: 'Faculty Guide', email: 'faculty.guide@cvr.ac.in' },
    { name: 'Faculty Sports', email: 'faculty.sports@cvr.ac.in' },
    { name: 'Faculty Library', email: 'faculty.library@cvr.ac.in' },
    { name: 'Faculty Minor', email: 'faculty.minor@cvr.ac.in' }
];

// Combine all faculty to ensure they exist
const ALL_FACULTY_TO_INSERT = [...NEW_FACULTY, ...PLACEHOLDER_FACULTY];

// Project Work Team
const PW_TEAM = [
    'Mr. G. Krishna Kishore',
    'Mrs. Ch. Lavanya',
    'Ms. M. Ratna Sirisha',
    'Mrs. K. Anusha',
    'Mrs. T. Radhika', // Existing
    'Mrs. M. Nagamani'
];

// OE / Mentoring Team (We'll pick one main or rotate?)
// Prompt: "Dr. P. Sampoorna, Mrs. D. Sriveni, Dr. V. Ramakrishna"
const OE_MENTORING_FACULTY = 'Dr. P. Sampoorna';

// Rooms
const ROOM_MAIN = '101 CM';
const ROOM_DP = '302 CB';
const ROOM_GAI = '303 CB';
const ROOM_RPA = '101 CM'; // Same as main

const ROOMS_TO_INSERT = [
    { name: '101 CM', capacity: 60, is_lab: false },
    { name: '302 CB', capacity: 60, is_lab: false },
    { name: '303 CB', capacity: 60, is_lab: false },
    { name: '206 CM', capacity: 60, is_lab: false } // Mentioned in MD for RPA, but prompt says 101 CM. Prompt supercedes MD.
    // Wait, Prompt says: "RPA -> 101 CM". 
    // MD said "206 CM". 
    // I will use 101 CM as per Prompt.
];

// Subjects
const SUBJECTS = [
    { code: 'OB-A', name: 'OB', hours: 3, type: 'theory' },
    { code: 'DP-A', name: 'Design Patterns', hours: 3, type: 'theory' },
    { code: 'GAI-A', name: 'Generative AI', hours: 3, type: 'theory' },
    { code: 'RPA-A', name: 'RPA', hours: 3, type: 'theory' },
    { code: 'PW-A', name: 'Project Work', hours: 18, type: 'lab' },
    { code: 'OE-A', name: 'OE / Mentoring', hours: 1, type: 'theory' },
    { code: 'IG-A', name: 'Interaction with Guide', hours: 1, type: 'theory' },
    { code: 'MS-A', name: 'Minor / Sports', hours: 1, type: 'theory' },
    { code: 'LIB-A', name: 'Library', hours: 1, type: 'theory' },
    { code: 'MIG-A', name: 'Minor / Interaction', hours: 2, type: 'theory' } // Tue & Sat
];

// --- SQL GENERATION ---

let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
// Faculty Vars
sql += '  fac_krishna UUID; fac_lavanya UUID; fac_ratna UUID; fac_anusha UUID; fac_nagamani UUID;\n';
sql += '  fac_sampoorna UUID; fac_sriveni UUID; fac_ramakrishna UUID; fac_radhika UUID;\n';
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
sql += "  SELECT id INTO fac_krishna FROM faculty WHERE email = 'g.krishna@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lavanya FROM faculty WHERE email = 'ch.lavanya@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_ratna FROM faculty WHERE email = 'm.ratnasirisha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_anusha FROM faculty WHERE email = 'k.anusha@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_nagamani FROM faculty WHERE email = 'm.nagamani@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sampoorna FROM faculty WHERE email = 'p.sampoorna@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_radhika FROM faculty WHERE email = 't.radhika@cvr.ac.in';\n"; // Existing
sql += "  SELECT id INTO fac_ob FROM faculty WHERE email = 'faculty.ob@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_dp FROM faculty WHERE email = 'faculty.dp@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_gai FROM faculty WHERE email = 'faculty.gai@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_rpa FROM faculty WHERE email = 'faculty.rpa@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_guide FROM faculty WHERE email = 'faculty.guide@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_sports FROM faculty WHERE email = 'faculty.sports@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_lib FROM faculty WHERE email = 'faculty.library@cvr.ac.in';\n";
sql += "  SELECT id INTO fac_minor FROM faculty WHERE email = 'faculty.minor@cvr.ac.in';\n";
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

// 2. Schedule Logic (Manual Mapping)
// Helper to get PW Faculty Var Name based on name
const getPwFacVar = (index: number) => {
    // Round robin the 6 PW faculty
    const teamVars = ['fac_krishna', 'fac_lavanya', 'fac_ratna', 'fac_anusha', 'fac_radhika', 'fac_nagamani'];
    return teamVars[index % teamVars.length];
};

let pwCounter = 0;
const addEntry = (day: string, slot: number, subjectCode: string, facVar: string, room: string) => {
    sql += `  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES\n`;
    sql += `  (timetable_id, v_section_id, ${facVar}, (SELECT id FROM classrooms WHERE name='${room}'), (SELECT id FROM working_days WHERE day_name='${day}'), (SELECT id FROM time_slots WHERE slot_order=${slot}), (SELECT id FROM subjects WHERE code='${subjectCode}'));\n`;
};

// MONDAY: All PW (6 slots: 1,2, 4,5, 7,8)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Monday', slot, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);
});

// WEDNESDAY: All PW (6 slots)
[1, 2, 4, 5, 7, 8].forEach(slot => {
    addEntry('Wednesday', slot, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);
});

// TUESDAY
addEntry('Tuesday', 1, 'OB-A', 'fac_ob', ROOM_MAIN);
// Parallel 10-11
addEntry('Tuesday', 2, 'DP-A', 'fac_dp', ROOM_DP);
addEntry('Tuesday', 2, 'GAI-A', 'fac_gai', ROOM_GAI);
addEntry('Tuesday', 2, 'RPA-A', 'fac_rpa', ROOM_RPA);

addEntry('Tuesday', 4, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);
addEntry('Tuesday', 5, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);

addEntry('Tuesday', 7, 'OE-A', 'fac_sampoorna', ROOM_MAIN);
addEntry('Tuesday', 8, 'MIG-A', 'fac_minor', ROOM_MAIN);

// FRIDAY
addEntry('Friday', 1, 'OB-A', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Friday', 2, 'DP-A', 'fac_dp', ROOM_DP);
addEntry('Friday', 2, 'GAI-A', 'fac_gai', ROOM_GAI);
addEntry('Friday', 2, 'RPA-A', 'fac_rpa', ROOM_RPA);

addEntry('Friday', 4, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);
addEntry('Friday', 5, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);

addEntry('Friday', 7, 'IG-A', 'fac_guide', ROOM_MAIN);
addEntry('Friday', 8, 'MS-A', 'fac_sports', ROOM_MAIN);

// SATURDAY
addEntry('Saturday', 1, 'OB-A', 'fac_ob', ROOM_MAIN);
// Parallel
addEntry('Saturday', 2, 'DP-A', 'fac_dp', ROOM_DP);
addEntry('Saturday', 2, 'GAI-A', 'fac_gai', ROOM_GAI);
addEntry('Saturday', 2, 'RPA-A', 'fac_rpa', ROOM_RPA);

addEntry('Saturday', 4, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);
addEntry('Saturday', 5, 'PW-A', getPwFacVar(pwCounter++), ROOM_MAIN);

addEntry('Saturday', 7, 'LIB-A', 'fac_lib', ROOM_MAIN);
addEntry('Saturday', 8, 'MIG-A', 'fac_minor', ROOM_MAIN);


sql += "  RAISE NOTICE 'CSE-A Timetable Generated Successfully!';\n";
sql += 'END $$;\n';

fs.writeFileSync('supabase/seed_cse_a.sql', sql);
console.log('SQL Generated: supabase/seed_cse_a.sql');
