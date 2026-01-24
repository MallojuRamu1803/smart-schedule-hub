
import * as fs from 'fs';

// --- CONFIGURATION ---

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];

// 6 Slots per day (Total 30 slots)
const SLOTS = [
    { id: 1, time: '09:00 - 10:00', type: 'class' },
    { id: 2, time: '10:00 - 11:00', type: 'class' },
    // Break 11:00-11:10
    { id: 4, time: '11:10 - 12:10', type: 'class' },
    { id: 5, time: '12:10 - 01:10', type: 'class' },
    // Lunch 01:10-01:55
    { id: 7, time: '01:55 - 02:55', type: 'class' },
    { id: 8, time: '02:55 - 03:55', type: 'class' },
];

const PW_FACULTY = [
    'Mr. G. Venugopal Rao',
    'Mr. Guruvaiah',
    'Mrs. T. Pavani',
    'Mr. B. Sanjeev',
    'Mrs. Sheshi Rekha',
    'Ms. V. Spandana',
    'Mrs. Y. Sunitha'
];

interface Subject {
    code: string;
    name: string;
    room: string;
    faculty: string | string[];
    hours: number;
    isParallel?: boolean;
}

const SUBJECTS: Subject[] = [
    { code: 'DP', name: 'Design Patterns', room: 'Room No. 211 CB', faculty: 'Mrs. T. Radhika', hours: 3, isParallel: true },
    { code: 'GAI', name: 'Generative AI', room: 'Room No. 205 CM', faculty: 'Mrs. Sheshi Rekha', hours: 3, isParallel: true },
    { code: 'OB', name: 'Organizational Behavior', room: 'Room No. 211 CB', faculty: 'Mr. G. Kalyana Chakravarthy', hours: 3 },
    { code: 'OE', name: 'OE / Interaction', room: 'Dep. Library', faculty: 'Mrs. Y. Sunitha', hours: 1 },
    { code: 'OELib', name: 'OE / Library', room: 'Central Library', faculty: 'Mr. G. Venugopal Rao', hours: 1 },
    { code: 'MinorInt', name: 'Minor / Interaction', room: 'Room No. 112 CB', faculty: 'Mrs. T. Pavani', hours: 2 },
    { code: 'IntGuide', name: 'Interaction with Guide', room: 'Room No. 211 CB', faculty: 'Mrs. Y. Sunitha', hours: 1 },
    { code: 'MinorSports', name: 'Minor / Sports', room: 'Sports Complex', faculty: 'Mrs. T. Radhika', hours: 1 },
    { code: 'Mentoring', name: 'Mentoring', room: 'Faculty Cabin', faculty: 'Mrs. T. Radhika', hours: 1 },
];

type ScheduleEntry = {
    subject: Subject;
    faculty: string;
    room: string;
};

// Grid
const schedule: Record<string, Record<number, ScheduleEntry[]>> = {};
DAYS.forEach(d => {
    schedule[d] = {};
    SLOTS.forEach(s => schedule[d][s.id] = []);
});

const isSlotFree = (day: string, slotId: number) => schedule[day][slotId].length === 0;

// --- ALGORITHM ---

// 1. Parallel Block
let pbHours = 3;
let pbScheduled = 0;
const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);

for (const day of shuffledDays) {
    if (pbScheduled >= pbHours) break;
    const shuffledSlots = [...SLOTS].sort(() => Math.random() - 0.5);
    for (const slot of shuffledSlots) {
        if (isSlotFree(day, slot.id)) {
            schedule[day][slot.id].push({ subject: SUBJECTS[0], faculty: SUBJECTS[0].faculty as string, room: SUBJECTS[0].room });
            schedule[day][slot.id].push({ subject: SUBJECTS[1], faculty: SUBJECTS[1].faculty as string, room: SUBJECTS[1].room });
            pbScheduled++;
            break;
        }
    }
}

// 2. OB
let obHours = 3;
let obScheduled = 0;
for (const day of [...DAYS].sort(() => Math.random() - 0.5)) {
    if (obScheduled >= obHours) break;
    for (const slot of [...SLOTS].sort(() => Math.random() - 0.5)) {
        if (isSlotFree(day, slot.id)) {
            schedule[day][slot.id].push({ subject: SUBJECTS[2], faculty: SUBJECTS[2].faculty as string, room: SUBJECTS[2].room });
            obScheduled++;
            break;
        }
    }
}

// 3. Activities
const activities = SUBJECTS.slice(3);
for (const subj of activities) {
    let needed = subj.hours;
    let placed = 0;
    while (placed < needed) {
        const d = DAYS[Math.floor(Math.random() * DAYS.length)];
        const s = SLOTS[Math.floor(Math.random() * SLOTS.length)];
        if (isSlotFree(d, s.id)) {
            schedule[d][s.id].push({
                subject: subj,
                faculty: Array.isArray(subj.faculty) ? subj.faculty[0] : subj.faculty as string,
                room: subj.room
            });
            placed++;
        }
    }
}

// 4. Project Work
let pwFacultyIdx = 0;
DAYS.forEach(day => {
    SLOTS.forEach(slot => {
        if (isSlotFree(day, slot.id)) {
            const fac = PW_FACULTY[pwFacultyIdx % PW_FACULTY.length];
            pwFacultyIdx++;
            schedule[day][slot.id].push({
                subject: { code: 'PW', name: 'Project Work' } as Subject, // Dummy subj
                faculty: fac,
                room: 'New Cellar'
            });
        }
    });
});

// --- GENERATE SQL ---

let sql = `
DO $$
DECLARE
  dept_id UUID;
  acad_year_id UUID;
  v_section_id UUID;
  timetable_id UUID;
  
  -- Faculty IDs
  venugopal_id UUID;
  guruvaiah_id UUID;
  kalyana_id UUID;
  pavani_id UUID;
  sanjeev_id UUID;
  sheshi_id UUID;
  spandana_id UUID;
  sunitha_id UUID;
  radhika_id UUID;
  gamidelli_id UUID;
  
  -- Use dynamic lookups for Rooms/Days/Slots
  
  mon_id UUID; tue_id UUID; wed_id UUID; fri_id UUID; sat_id UUID;
  
  slot_1 UUID; slot_2 UUID; slot_4 UUID; slot_5 UUID; slot_7 UUID; slot_8 UUID;

  -- Subject IDs
  ob_id UUID; dp_id UUID; gai_id UUID; pw_id UUID;
  oe_id UUID; mig_id UUID; lib_id UUID; sports_id UUID; men_id UUID;
  
BEGIN
  -- Cleanup
  DELETE FROM timetable_entries WHERE section_id IN (SELECT id FROM sections WHERE name = 'CSE-G');
  DELETE FROM timetables WHERE name = 'CSE-G Shuffled';

  -- Fetch IDs
  SELECT id INTO dept_id FROM departments WHERE code = 'CSE';
  SELECT id INTO acad_year_id FROM academic_years WHERE year = '2025-2026' AND semester = 2;
  SELECT id INTO v_section_id FROM sections WHERE name = 'CSE-G';

  -- Faculty Lookups
  SELECT id INTO venugopal_id FROM faculty WHERE email = 'g.venugopal@cvr.ac.in';
  SELECT id INTO guruvaiah_id FROM faculty WHERE email = 'guruvaiah@cvr.ac.in';
  SELECT id INTO kalyana_id FROM faculty WHERE email = 'kalyana@cvr.ac.in';
  SELECT id INTO pavani_id FROM faculty WHERE email = 't.pavani@cvr.ac.in';
  SELECT id INTO sanjeev_id FROM faculty WHERE email = 'b.sanjeev@cvr.ac.in';
  SELECT id INTO sheshi_id FROM faculty WHERE email = 'sheshi@cvr.ac.in';
  SELECT id INTO spandana_id FROM faculty WHERE email = 'v.spandana@cvr.ac.in';
  SELECT id INTO sunitha_id FROM faculty WHERE email = 'y.sunitha@cvr.ac.in';
  SELECT id INTO radhika_id FROM faculty WHERE email = 't.radhika@cvr.ac.in';
  SELECT id INTO gamidelli_id FROM faculty WHERE email = 'gamidelli@cvr.ac.in';

  -- Subject Lookups / Creates
    -- Ensure Activity Subjects exist
  INSERT INTO subjects (id, name, code, subject_type, weekly_hours, section_id, created_at) VALUES
  (gen_random_uuid(), 'OE / Interaction', 'OE-G', 'theory', 1, v_section_id, now()),
  (gen_random_uuid(), 'OE / Library', 'OELIB-G', 'theory', 1, v_section_id, now()),
  (gen_random_uuid(), 'Minor / Interaction', 'MIG-G', 'theory', 1, v_section_id, now()),
  (gen_random_uuid(), 'Interaction with Guide', 'IG-G', 'theory', 1, v_section_id, now()),
  (gen_random_uuid(), 'Minor / Sports', 'MS-G', 'theory', 1, v_section_id, now()),
  (gen_random_uuid(), 'Mentoring', 'MEN-G', 'theory', 1, v_section_id, now()),
  (gen_random_uuid(), 'Project Work', 'PW-G', 'lab', 18, v_section_id, now())
  ON CONFLICT (code) DO UPDATE SET weekly_hours = EXCLUDED.weekly_hours;

  SELECT id INTO ob_id FROM subjects WHERE code = 'OB-G';
  SELECT id INTO dp_id FROM subjects WHERE code = 'DP-G';
  SELECT id INTO gai_id FROM subjects WHERE code = 'GAI-G';
  SELECT id INTO pw_id FROM subjects WHERE code = 'PW-G';
  
  -- Create Timetable
  INSERT INTO timetables (name, academic_year_id, generated_at, is_active, generation_status)
  VALUES ('CSE-G Shuffled', acad_year_id, now(), true, 'completed')
  RETURNING id INTO timetable_id;

`;

// Map names to SQL variables
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
    return 'venugopal_id'; // Fallback
};

const getSubjectCode = (name: string, code?: string) => {
    if (code === 'DP') return 'DP-G';
    if (code === 'GAI') return 'GAI-G';
    if (code === 'OB') return 'OB-G';
    if (code === 'PW') return 'PW-G';
    if (name.includes('OE / Interaction')) return 'OE-G';
    if (name.includes('Library')) return 'OELIB-G'; // Or LIB-G
    if (name === 'Minor / Interaction' || name === 'Minor / Interaction with Guide') return 'MIG-G';
    if (name.includes('Interaction with Guide') && !name.includes('OE')) return 'IG-G';
    if (name.includes('Sports')) return 'MS-G';
    if (name.includes('Mentoring')) return 'MEN-G';
    if (name.includes('Project Work')) return 'PW-G';
    return 'PW-G';
};

// Generate Inserts
DAYS.forEach(day => {
    SLOTS.forEach(slot => {
        const entries = schedule[day][slot.id];
        entries.forEach(entry => {
            const facVar = getFacultyVar(entry.faculty);
            const subjCode = getSubjectCode(entry.subject.name, (entry.subject as any).code);
            const roomName = entry.room; // Need to fetch ID or simplified

            // SQL for this entry
            sql += `
  INSERT INTO timetable_entries (timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id)
  SELECT 
    timetable_id, 
    v_section_id, 
    (SELECT id FROM subjects WHERE code = '${subjCode}'), 
    ${facVar}, 
    (SELECT id FROM classrooms WHERE name = '${roomName}'), 
    (SELECT id FROM working_days WHERE day_name = '${day}'), 
    (SELECT id FROM time_slots WHERE slot_order = ${slot.id});
      `;
        });
    });
});

sql += `
  RAISE NOTICE 'Shuffled Data Injected';
END $$;
`;

fs.writeFileSync('supabase/seed_cse_g_shuffled.sql', sql);
console.log('SQL generated');
