
import * as fs from 'fs';

// --- CONFIGURATION ---

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];
const SLOTS = [1, 2, 4, 5, 7, 8];

// Define Subjects
// ONLY Project Work needs continuous blocks (2h).
// DP, GAI, OB, etc. are Theory (Classrooms) -> Single slots allowed.
// But wait, DP+GAI is a parallel block. Is it a lab or theory? 
// User said "only project works are conducted in labs".
// So DP/GAI are theory parallel?
// Usually parallel means groups split. 
// If they are theory, they don't *strictly* need 3h blocks, but parallel constraint means they must appear TOGETHER in same slot.
// Project Work (18h) -> Lab -> Continuous.
// Minor? Usually Theory.
// Library/Sports -> Continuous? Usually not needed strictly if 1h.

// REVISED STRATEGY:
// 1. PROJECT WORK: 18 Hours.
//    MUST be in blocks of 2 hours minimum? User said "continuous".
//    Let's place PW in blocks of 2 (Pairs). 9 Pairs = 18 hours.
//    (1,2), (4,5), (7,8).
// 2. PARALLEL (DP+GAI): 3 Hours.
//    Theory. Single slots allowed. Just need to be same slot.
// 3. OB: 3 Hours. Theory. Single slots.
// 4. Others: 1-2 Hours. Theory. Single slots.

const PW_FACULTY = [
    'Mr. G. Venugopal Rao', 'Mr. Guruvaiah', 'Mrs. T. Pavani',
    'Mr. B. Sanjeev', 'Mrs. Sheshi Rekha', 'Ms. V. Spandana', 'Mrs. Y. Sunitha'
];

const schedule: Record<string, Record<number, any[]>> = {};
DAYS.forEach(d => {
    schedule[d] = {};
    SLOTS.forEach(s => { schedule[d][s] = []; });
});

const isFree = (d: string, s: number) => schedule[d][s].length === 0;
const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

// 1. PLACE PROJECT WORK (18 Hours -> 9 Pairs of 2 Hours)
// Pairs: (1,2), (4,5), (7,8)
const allPairs: { d: string, slots: number[] }[] = [];
DAYS.forEach(d => {
    allPairs.push({ d, slots: [1, 2] });
    allPairs.push({ d, slots: [4, 5] });
    allPairs.push({ d, slots: [7, 8] });
});
shuffle(allPairs);

// Pick 9 pairs for Project Work
let pwCount = 0;
let pwFacIdx = 0;
const usedPairs: Set<string> = new Set(); // Keep track to avoid scheduling others

for (const pair of allPairs) {
    if (pwCount >= 9) break;

    // Schedule PW
    const fac = PW_FACULTY[pwFacIdx++ % PW_FACULTY.length];
    pair.slots.forEach(s => {
        schedule[pair.d][s].push({ name: 'Project Work', code: 'PW-G', room: 'New Cellar', faculty: fac });
    });
    pwCount++;
    usedPairs.add(`${pair.d}_${pair.slots[0]}`);

    // Mark both slots used (though isFree handles it, this is logic tracking)
}

// 2. FILL REMAINING SLOTS WITH THEORY (Singles)
// Available slots = Total 30 - 18 (PW) = 12 Slots.
// Subjects to fill:
// DP+GAI (3h) -> 3 slots (Parallel)
// OB (3h) -> 3 slots
// Minor (2h) -> 2 slots (Can be separate now)
// OE (1h), OELib (1h), IG (1h), MS (1h), Mentoring (1h) -> 5 slots
// Total Theory Needed = 3 + 3 + 2 + 5 = 13 Hours?
// Wait. 30 total slots. 18 PW. 12 Remaining.
// Requirements:
// DP+GAI: 3
// OB: 3
// Minor: 2
// OE: 1
// OELib: 1
// IG: 1
// MS: 1
// Men: 1
// Total = 13.
// We are SHORT 1 slot!
// 30 slots available per week.
// Project Work 18?
// User said "Project Work: 18 hours/week" (Output of shuffle was valid).
// Let's re-verify image.
// Image: Mon (5), Tue (2), Wed (5), Fri (3), Sat (1) = 16 Hours?
// Rows 1-3, 5-8?
// Image Slots: 9-10, 10-11, 11:10-12:10, 12:10-1:10, 1:55-2:55, 2:55-3:55 (6 slots)
// 5 Days * 6 Slots = 30 Slots.
// Prompt said: "Project Work: 18 hours"
// OB: 3
// DP: 3
// OE/Lib: 1
// Minor/Interact: 2
// Interact: 1
// Minor/Sports: 1
// Mentoring: 1
// Total = 18 + 3 + 3 + 1 + 2 + 1 + 1 + 1 = 30.
// EXACTLY 30.
// So we just need to fill the remaining 12 slots exactly.

const theorySubjects = [
    ...Array(3).fill({ name: 'DP', code: 'DP-G', room: 'Room No. 211 CB', faculty: 'Mrs. T. Radhika', isParallel: true }),
    ...Array(3).fill({ name: 'OB', code: 'OB-G', room: 'Room No. 211 CB', faculty: 'Mr. G. Kalyana Chakravarthy' }),
    ...Array(2).fill({ name: 'Minor / Interaction', code: 'MIG-G', room: 'Room No. 112 CB', faculty: 'Mrs. T. Pavani' }),
    { name: 'OE / Interaction', code: 'OE-G', room: 'Dep. Library', faculty: 'Mrs. Y. Sunitha' },
    { name: 'OE / Library', code: 'OELIB-G', room: 'Central Library', faculty: 'Mr. G. Venugopal Rao' },
    { name: 'Interaction with Guide', code: 'IG-G', room: 'Room No. 211 CB', faculty: 'Mrs. Y. Sunitha' },
    { name: 'Minor / Sports', code: 'MS-G', room: 'Sports Complex', faculty: 'Mrs. T. Radhika' },
    { name: 'Mentoring', code: 'MEN-G', room: 'Faculty Cabin', faculty: 'Mrs. T. Radhika' }
];

shuffle(theorySubjects);

// Place Theory in empty slots
let theoryIdx = 0;
const randDays = shuffle([...DAYS]);

for (const d of randDays) {
    const randSlots = shuffle([...SLOTS]);
    for (const s of randSlots) {
        if (isFree(d, s) && theoryIdx < theorySubjects.length) {
            const subj = theorySubjects[theoryIdx++];
            schedule[d][s].push({ name: subj.name, code: subj.code, room: subj.room, faculty: subj.faculty });
            // If parallel, no need to push second entry here, we handle in SQL generation
            // But for logic, slot is filled.
        }
    }
}

// --- SQL GENERATION ---

// (Standard SQL Header from previous steps...)
let sql = '';
sql += 'DO $$\n';
sql += 'DECLARE\n';
sql += '  dept_id UUID; acad_year_id UUID; v_section_id UUID; timetable_id UUID;\n';
sql += '  venugopal_id UUID; guruvaiah_id UUID; kalyana_id UUID; pavani_id UUID; sanjeev_id UUID;\n';
sql += '  sheshi_id UUID; spandana_id UUID; sunitha_id UUID; radhika_id UUID; gamidelli_id UUID;\n';
sql += 'BEGIN\n';
sql += "  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-G');\n";
sql += "  DELETE FROM timetables WHERE name = 'CSE-G Final Shuffled';\n";
sql += "\n";
sql += "  INSERT INTO departments (name, code) VALUES ('Computer Science and Engineering', 'CSE') ON CONFLICT (code) DO NOTHING;\n";
sql += "  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';\n";
sql += "  INSERT INTO academic_years (year, semester, is_active) VALUES ('2025-2026', 2, true) ON CONFLICT (year, semester) DO UPDATE SET is_active = true;\n";
sql += "  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;\n";
sql += "  INSERT INTO sections (id, name, department_id, academic_year_id, year_of_study) VALUES (gen_random_uuid(), 'CSE-G', dept_id, acad_year_id, 4) ON CONFLICT (name, department_id, academic_year_id) DO NOTHING;\n";
sql += "  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-G';\n";
sql += "\n";
sql += "  INSERT INTO faculty (name, email, department_id) VALUES \n";
sql += "  ('Mr. G. Venugopal Rao', 'g.venugopal@cvr.ac.in', dept_id), ('Mr. Guruvaiah', 'guruvaiah@cvr.ac.in', dept_id),\n";
sql += "  ('Mr. G. Kalyana Chakravarthy', 'kalyana@cvr.ac.in', dept_id), ('Mrs. T. Pavani', 't.pavani@cvr.ac.in', dept_id),\n";
sql += "  ('Mr. B. Sanjeev', 'b.sanjeev@cvr.ac.in', dept_id), ('Mrs. Sheshi Rekha', 'sheshi@cvr.ac.in', dept_id),\n";
sql += "  ('Ms. V. Spandana', 'v.spandana@cvr.ac.in', dept_id), ('Mrs. Y. Sunitha', 'y.sunitha@cvr.ac.in', dept_id),\n";
sql += "  ('Mrs. T. Radhika', 't.radhika@cvr.ac.in', dept_id), ('Mr. Gamidelli Yedukondalu', 'gamidelli@cvr.ac.in', dept_id)\n";
sql += "  ON CONFLICT (email) DO NOTHING;\n";
sql += "\n";
sql += "  SELECT id INTO venugopal_id FROM faculty WHERE email = 'g.venugopal@cvr.ac.in';\n";
sql += "  SELECT id INTO guruvaiah_id FROM faculty WHERE email = 'guruvaiah@cvr.ac.in';\n";
sql += "  SELECT id INTO kalyana_id FROM faculty WHERE email = 'kalyana@cvr.ac.in';\n";
sql += "  SELECT id INTO pavani_id FROM faculty WHERE email = 't.pavani@cvr.ac.in';\n";
sql += "  SELECT id INTO sanjeev_id FROM faculty WHERE email = 'b.sanjeev@cvr.ac.in';\n";
sql += "  SELECT id INTO sheshi_id FROM faculty WHERE email = 'sheshi@cvr.ac.in';\n";
sql += "  SELECT id INTO spandana_id FROM faculty WHERE email = 'v.spandana@cvr.ac.in';\n";
sql += "  SELECT id INTO sunitha_id FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';\n";
sql += "  SELECT id INTO radhika_id FROM faculty WHERE email = 't.radhika@cvr.ac.in';\n";
sql += "  SELECT id INTO gamidelli_id FROM faculty WHERE email = 'gamidelli@cvr.ac.in';\n";
sql += "\n";
sql += "  INSERT INTO classrooms (name, capacity, is_lab) VALUES \n";
sql += "  ('Room No. 211 CB', 60, false), ('Room No. 205 CM', 60, false), ('Room No. 112 CB', 60, false),\n";
sql += "  ('New Cellar', 60, true), ('Dep. Library', 30, false), ('Central Library', 100, false),\n";
sql += "  ('Sports Complex', 100, false), ('Faculty Cabin', 10, false)\n";
sql += "  ON CONFLICT (name) DO NOTHING;\n";
sql += "\n";
sql += "  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id) VALUES\n";
sql += "  (gen_random_uuid(), 'OB', 'OB-G', 'theory', 3, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Design Patterns', 'DP-G', 'theory', 3, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Generative AI', 'GAI-G', 'theory', 3, v_section_id),\n";
sql += "  (gen_random_uuid(), 'OE / Interaction', 'OE-G', 'theory', 1, v_section_id),\n";
sql += "  (gen_random_uuid(), 'OE / Library', 'OELIB-G', 'theory', 1, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Minor / Interaction', 'MIG-G', 'theory', 1, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Interaction with Guide', 'IG-G', 'theory', 1, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Minor / Sports', 'MS-G', 'theory', 1, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Mentoring', 'MEN-G', 'theory', 1, v_section_id),\n";
sql += "  (gen_random_uuid(), 'Project Work', 'PW-G', 'lab', 18, v_section_id)\n";
sql += "  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;\n";
sql += "\n";
sql += "  INSERT INTO working_days (day_name, day_order, is_active) VALUES ('Monday', 0, true), ('Tuesday', 1, true), ('Wednesday', 2, true), ('Thursday', 3, false), ('Friday', 4, true), ('Saturday', 5, true), ('Sunday', 6, false) ON CONFLICT (day_name) DO NOTHING;\n";
sql += "  INSERT INTO time_slots (start_time, end_time, slot_order, is_break, break_name) VALUES ('09:00', '10:00', 1, false, NULL), ('10:00', '11:00', 2, false, NULL), ('11:00', '11:10', 3, true, 'Break'), ('11:10', '12:10', 4, false, NULL), ('12:10', '13:10', 5, false, NULL), ('13:10', '13:55', 6, true, 'Lunch'), ('13:55', '14:55', 7, false, NULL), ('14:55', '15:55', 8, false, NULL) ON CONFLICT (start_time, end_time) DO NOTHING;\n";
sql += "\n";
sql += "  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status)\n";
sql += "  VALUES ('CSE-G Final Shuffled', acad_year_id, now(), true, 'completed') RETURNING id INTO timetable_id;\n";
sql += "\n";

const getFacultyVar = (name: string) => {
    if (name.includes('Venugopal')) return 'venugopal_id';
    if (name.includes('Guruvaiah')) return 'guruvaiah_id';
    if (name.includes('Kalyana')) return 'kalyana_id';
    if (name.includes('Pavani')) return 'pavani_id';
    if (name.includes('Sanjeev')) return 'sanjeev_id';
    if (name.includes('Sheshi')) return 'sheshi_id';
    if (name.includes('Spandana')) return 'spandana_id';
    if (name.includes('Sunitha')) return 'sunitha_id';
    if (name.includes('Radhika')) return 'radhika_id';
    if (name.includes('Gamidelli')) return 'gamidelli_id';
    return 'venugopal_id';
};

DAYS.forEach(day => {
    SLOTS.forEach(slot => {
        const entries = schedule[day][slot];
        entries.forEach(e => {
            const facVar = getFacultyVar(e.faculty);
            sql += "  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES\n";
            sql += `  (timetable_id, v_section_id, ${facVar}, (SELECT id FROM classrooms WHERE name='${e.room}'), (SELECT id FROM working_days WHERE day_name='${day}'), (SELECT id FROM time_slots WHERE slot_order=${slot}), (SELECT id FROM subjects WHERE code='${e.code}'));\n`;

            if (e.code === 'DP-G') {
                sql += "  INSERT INTO timetable_entries (timetable_id, section_id, faculty_id, classroom_id, working_day_id, time_slot_id, subject_id) VALUES\n";
                sql += `  (timetable_id, v_section_id, sheshi_id, (SELECT id FROM classrooms WHERE name='Room No. 205 CM'), (SELECT id FROM working_days WHERE day_name='${day}'), (SELECT id FROM time_slots WHERE slot_order=${slot}), (SELECT id FROM subjects WHERE code='GAI-G'));\n`;
            }
        });
    });
});

sql += "  RAISE NOTICE 'Shuffled with Continuous PW Only Generated!';\n";
sql += "END $$;\n";

fs.writeFileSync('supabase/seed_cse_g_resuffled.sql', sql);
console.log('SQL Generated: supabase/seed_cse_g_resuffled.sql');
