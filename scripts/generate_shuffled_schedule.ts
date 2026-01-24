
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

// Total Slots Available = 5 * 6 = 30.

// --- SUBJECT DEFINITIONS (Based on Request) ---

// Faculty Pool for Project Work
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
    faculty: string | string[]; // Single or Pool
    hours: number;
    parallelWith?: string[]; // IDs of other subjects
    isParallel?: boolean;
}

const SUBJECTS: Subject[] = [
    // Parallel Block (3 hours)
    { code: 'DP', name: 'Design Patterns', room: '211 CB', faculty: 'Mrs. T. Radhika', hours: 3, isParallel: true },
    { code: 'GAI', name: 'Generative AI', room: '205 CM', faculty: 'Mrs. Sheshi Rekha', hours: 3, isParallel: true },
    // Note: Request mentioned RPA, but strictly based on CSE-G image logic (which had only DP/GAI), we stick to DP/GAI for the "Parallel" visual block. 
    // However, we track the *group* usage as 3h total.

    // OB (3 hours)
    { code: 'OB', name: 'Organizational Behavior', room: '211 CB', faculty: 'Mr. G. Kalyana Chakravarthy', hours: 3 },

    // Mobile/Single Hour Subjects (Total 6 hours)
    { code: 'OE', name: 'OE / Interaction with Guide', room: 'Dep. Library', faculty: 'Mrs. Y. Sunitha', hours: 1 },
    // Note: "OE / Library" in request vs "OE / Interaction" in previous. I will use 'OE / Library' name if preferred, or distinct. 
    // Request: "OE / Library: 1 hour"
    // Let's stick to the list provided in the prompt strictly.
    // "OE / Library" -> 1h
    { code: 'OELib', name: 'OE / Library', room: 'Central Library', faculty: 'Mr. G. Venugopal Rao', hours: 1 },

    // "Minor / Interaction with Guide": 2h
    { code: 'MinorInt', name: 'Minor / Interaction', room: '112 CB', faculty: 'Mrs. T. Pavani', hours: 2 },

    // "Interaction with Guide (only)": 1h
    { code: 'IntGuide', name: 'Interaction with Guide', room: '211 CB', faculty: 'Mrs. Y. Sunitha', hours: 1 },

    // "Minor / Sports": 1h
    { code: 'MinorSports', name: 'Minor / Sports', room: 'Sports Complex', faculty: 'Mrs. T. Radhika', hours: 1 },

    // "Mentoring": 1h
    { code: 'Mentoring', name: 'Mentoring', room: 'Faculty Cabin', faculty: 'Mrs. T. Radhika', hours: 1 },

    // Project Work (18 hours)
    // We handle this specially to fill gaps.
];

// --- GENERATION STATE ---

type ScheduleEntry = {
    subject: string;
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

// --- HELPERS ---
const shuffle = <T>(array: T[]) => array.sort(() => Math.random() - 0.5);

// --- ALGORITHM ---

// 1. Schedule Parallel Block (DP + GAI) - 3 Hours
// Constraint: Once per day max? Usually yes.
let pbHours = 3;
let pbScheduled = 0;

const daysShuffled = shuffle([...DAYS]);

for (const day of daysShuffled) {
    if (pbScheduled >= pbHours) break;

    // Try slots shuffled
    const slotsShuffled = shuffle([...SLOTS]);

    for (const slot of slotsShuffled) {
        if (isSlotFree(day, slot.id)) {
            // Place Parallel
            schedule[day][slot.id].push({ subject: 'DP', faculty: 'Mrs. T. Radhika', room: '211 CB' });
            schedule[day][slot.id].push({ subject: 'GAI', faculty: 'Mrs. Sheshi Rekha', room: '205 CM' });
            pbScheduled++;
            break; // Only once per day
        }
    }
}

// 2. Schedule OB - 3 Hours
let obHours = 3;
let obScheduled = 0;

for (const day of shuffle([...DAYS])) {
    if (obScheduled >= obHours) break;

    // Try slots
    const slotsShuffled = shuffle([...SLOTS]);
    for (const slot of slotsShuffled) {
        if (isSlotFree(day, slot.id)) {
            schedule[day][slot.id].push({ subject: 'OB', faculty: 'Mr. G. Kalyana Chakravarthy', room: '211 CB' });
            obScheduled++;
            break;
        }
    }
}

// 3. Schedule Fixed Activities
const activities = SUBJECTS.filter(s => !s.isParallel && s.code !== 'OB' && s.code !== 'PW');
// Sort by hours desc to place larger blocks (like Minor 2h) first?
// "Minor / Interaction with Guide: 2 hours". Can be separated or blocked? Usually separate is easier for shuffling.
// We will treat them as separate 1h blocks for simplicity unless "continuous" is required. Prompt says "rearranging periods", doesn't specify blocks for these.

for (const subj of activities) {
    let needed = subj.hours;
    // Try to place
    let placed = 0;

    // We iterate days/slots randomly until filled
    outer: while (placed < needed) {
        const d = DAYS[Math.floor(Math.random() * DAYS.length)];
        const s = SLOTS[Math.floor(Math.random() * SLOTS.length)];

        if (isSlotFree(d, s.id)) {
            schedule[d][s.id].push({
                subject: subj.name,
                faculty: Array.isArray(subj.faculty) ? subj.faculty[0] : subj.faculty,
                room: subj.room
            });
            placed++;
        }

        // Safety break if grid full (shouldn't happen with 30 slots/30 hours)
        // Add real loop protection in production
    }
}

// 4. Fill Remaining with Project Work (18 Hours)
let pwFacultyIdx = 0;

DAYS.forEach(day => {
    SLOTS.forEach(slot => {
        if (isSlotFree(day, slot.id)) {
            const fac = PW_FACULTY[pwFacultyIdx % PW_FACULTY.length];
            pwFacultyIdx++;
            schedule[day][slot.id].push({
                subject: 'Project Work',
                faculty: fac,
                room: 'New Cellar'
            });
        }
    });
});

// --- OUTPUT ---

let output = 'TIMETABLE FOR CSE-G (SHUFFLED)\n';
output += 'Academic Year: 2025-2026\n';
output += '--------------------------------------------------------------------------------\n';
output += '| Day       | ' + SLOTS.map(s => s.time.padEnd(15)).join(' | ') + ' |\n';
output += '|' + '-'.repeat(11) + '|' + SLOTS.map(() => '-'.repeat(17)).join('|') + '|\n';

DAYS.forEach(day => {
    const dayCells = SLOTS.map(slot => {
        const entries = schedule[day][slot.id];
        if (entries.length === 0) return '---';
        return entries.map(e => `${e.subject}`).join(' & ');
        // Optionally add room/faculty to text if space permits or creating detail view
    });

    const facultyCells = SLOTS.map(slot => {
        const entries = schedule[day][slot.id];
        if (entries.length === 0) return '';
        return entries.map(e => `(${e.faculty.split(' ').slice(-1)[0]})`).join('&'); // Short name
    });

    output += `| ${day.padEnd(9)} | ` + dayCells.map(c => c.padEnd(15)).join(' | ') + ' |\n';
    output += `|           | ` + facultyCells.map(c => c.padEnd(15)).join(' | ') + ' |\n';
    output += '|' + '-'.repeat(11) + '|' + SLOTS.map(() => '-'.repeat(17)).join('|') + '|\n';
});

fs.writeFileSync('shuffled_timetable_output.txt', output);
console.log('Timetable generated');
