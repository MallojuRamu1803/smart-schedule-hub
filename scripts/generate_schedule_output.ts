
import * as fs from 'fs';

// --- DATA DEFINITIONS ---

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'];

const SLOTS = [
    { id: 1, time: '09:00 - 10:00', type: 'class' },
    { id: 2, time: '10:00 - 11:00', type: 'class' },
    { id: 3, time: '11:00 - 11:10', type: 'break', name: 'BREAK' },
    { id: 4, time: '11:10 - 12:10', type: 'class' },
    { id: 5, time: '12:10 - 01:10', type: 'class' },
    { id: 6, time: '01:10 - 01:55', type: 'break', name: 'LUNCH' },
    { id: 7, time: '01:55 - 02:55', type: 'class' },
    { id: 8, time: '02:55 - 03:55', type: 'class' },
];

type Cell = {
    subject: string;
    faculty?: string;
    room: string;
};

// Grid: Day -> Slot Index -> Cell[]
const schedule: Record<string, Record<number, Cell[]>> = {};

DAYS.forEach(day => {
    schedule[day] = {};
    SLOTS.forEach((slot, idx) => {
        schedule[day][idx] = [];
    });
});

// --- HARDCODED SCHEDULE FROM IMAGE ---

// MONDAY
schedule['Monday'][0].push({ subject: 'Project Work', faculty: 'Mr. G. Venugopal Rao', room: 'New Cellar' });
// Slot 1 (10-11) is Blank/Break in Image
schedule['Monday'][3].push({ subject: 'Project Work', faculty: 'Mr. G. Venugopal Rao', room: 'New Cellar' }); // 11:10
schedule['Monday'][4].push({ subject: 'Project Work', faculty: 'Mr. Guruvaiah', room: 'New Cellar' }); // 12:10
schedule['Monday'][6].push({ subject: 'Project Work', faculty: 'Mr. Guruvaiah', room: 'New Cellar' }); // 01:55
schedule['Monday'][7].push({ subject: 'Project Work', faculty: 'Mr. Guruvaiah', room: 'New Cellar' }); // 02:55

// TUESDAY
schedule['Tuesday'][0].push({ subject: 'OB', faculty: 'Mr. G. Kalyana Chakravarthy', room: '211 CB' });
schedule['Tuesday'][1].push({ subject: 'DP', faculty: 'Mrs. T. Radhika', room: '211 CB' });
schedule['Tuesday'][1].push({ subject: 'GAI', faculty: 'Mrs. Sheshi Rekha', room: '205 CM' }); // Parallel
schedule['Tuesday'][3].push({ subject: 'Project Work', faculty: 'Mr. G. Kalyana Chakravarthy', room: '112 CB' }); // 11:10
// Slot 4 (12-1) Blank
schedule['Tuesday'][6].push({ subject: 'OE / Interaction', faculty: 'Mrs. Y. Sunitha', room: '211 CB' }); // 01:55
schedule['Tuesday'][7].push({ subject: 'Minor / Sports', faculty: 'Mrs. T. Radhika', room: '211 CB' }); // 02:55

// WEDNESDAY
schedule['Wednesday'][0].push({ subject: 'Project Work', faculty: 'Mrs. T. Pavani', room: 'New Cellar' });
// Slot 1 Blank
schedule['Wednesday'][3].push({ subject: 'Project Work', faculty: 'Mr. B. Sanjeev', room: 'New Cellar' });
schedule['Wednesday'][4].push({ subject: 'Project Work', faculty: 'Mr. B. Sanjeev', room: 'New Cellar' });
schedule['Wednesday'][6].push({ subject: 'Project Work', faculty: 'Mrs. Y. Sunitha', room: 'New Cellar' });
schedule['Wednesday'][7].push({ subject: 'Project Work', faculty: 'Mrs. Y. Sunitha', room: 'New Cellar' });

// FRIDAY
schedule['Friday'][0].push({ subject: 'OB', faculty: 'Mr. G. Kalyana Chakravarthy', room: '211 CB' });
schedule['Friday'][1].push({ subject: 'DP', faculty: 'Mrs. T. Radhika', room: '211 CB' });
schedule['Friday'][1].push({ subject: 'GAI', faculty: 'Mrs. Sheshi Rekha', room: '205 CM' });
schedule['Friday'][3].push({ subject: 'Project Work', faculty: 'Mrs. Sheshi Rekha', room: 'New Cellar' });
// Slot 4 Blank
schedule['Friday'][6].push({ subject: 'Library', faculty: 'Mr. G. Venugopal Rao', room: 'Central Library' });
schedule['Friday'][7].push({ subject: 'Minor / Interaction', faculty: 'Mrs. T. Pavani', room: '211 CB' });

// SATURDAY
schedule['Saturday'][0].push({ subject: 'OB', faculty: 'Mr. G. Kalyana Chakravarthy', room: '211 CB' });
schedule['Saturday'][1].push({ subject: 'DP', faculty: 'Mrs. T. Radhika', room: '211 CB' });
schedule['Saturday'][1].push({ subject: 'GAI', faculty: 'Mrs. Sheshi Rekha', room: '205 CM' });
schedule['Saturday'][3].push({ subject: 'Project Work', faculty: 'Ms. V. Spandana', room: 'New Cellar' });
// Slot 4 Blank
schedule['Saturday'][6].push({ subject: 'Mentoring', faculty: 'Mrs. T. Radhika', room: '211 CB' });
schedule['Saturday'][7].push({ subject: 'Minor / Interaction', faculty: 'Mr. B. Sanjeev', room: '211 CB' });

// --- OUTPUT ---

let output = 'TIMETABLE FOR CSE-G\n';
output += 'Academic Year: 2025-2026\n';
output += '--------------------------------------------------------------------------------\n';

output += '| Day       | ' + SLOTS.map(s => s.time.padEnd(15)).join(' | ') + ' |\n';
output += '|' + '-'.repeat(11) + '|' + SLOTS.map(() => '-'.repeat(17)).join('|') + '|\n';

DAYS.forEach(day => {
    const dayCells = SLOTS.map((slot, i) => {
        if (slot.type === 'break') return slot.name || 'BREAK';
        const entries = schedule[day][i];
        if (entries.length === 0) return '---';
        return entries.map(e => `${e.subject} (${e.room})`).join(' & ');
    });

    const facultyCells = SLOTS.map((slot, i) => {
        if (slot.type === 'break') return '';
        const entries = schedule[day][i];
        if (entries.length === 0) return '';
        const facs = entries.map(e => e.faculty ? `(${e.faculty})` : '').filter(f => f);
        return facs.length > 0 ? facs.join(' & ') : ' ';
    });

    const dayStr = day.padEnd(9);
    output += `| ${dayStr} | ` + dayCells.map(c => c.padEnd(15)).join(' | ') + ' |\n';
    output += `|           | ` + facultyCells.map(c => c.padEnd(15)).join(' | ') + ' |\n';
    output += '|' + '-'.repeat(11) + '|' + SLOTS.map(() => '-'.repeat(17)).join('|') + '|\n';
});

fs.writeFileSync('timetable_output.txt', output);
console.log('Done writing');
