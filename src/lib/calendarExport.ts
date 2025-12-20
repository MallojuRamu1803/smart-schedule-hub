import type { TimetableEntry, WorkingDay, TimeSlot } from '@/lib/types';
import { format, addDays, startOfWeek, parse } from 'date-fns';

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  rrule?: string;
}

/**
 * Generate ICS file content for timetable entries
 */
export const generateICS = (
  entries: TimetableEntry[],
  workingDays: WorkingDay[],
  semesterStartDate: Date,
  semesterEndDate: Date
): string => {
  const events: CalendarEvent[] = [];
  
  // Get the start of the first week
  const firstMonday = startOfWeek(semesterStartDate, { weekStartsOn: 1 });

  entries.forEach(entry => {
    if (!entry.working_day || !entry.time_slot || !entry.subject || !entry.faculty || !entry.classroom) {
      return;
    }

    const dayOrder = entry.working_day.day_order;
    const eventDate = addDays(firstMonday, dayOrder - 1);

    // Parse time strings
    const startTime = parse(entry.time_slot.start_time, 'HH:mm:ss', eventDate);
    const endTime = parse(entry.time_slot.end_time, 'HH:mm:ss', eventDate);

    const event: CalendarEvent = {
      title: `${entry.subject.name} (${entry.subject.code})`,
      description: `Faculty: ${entry.faculty.name}\nSection: ${entry.section?.name || 'N/A'}\nType: ${entry.subject.subject_type}`,
      location: entry.classroom.name,
      startDate: startTime,
      endDate: endTime,
      rrule: `FREQ=WEEKLY;UNTIL=${format(semesterEndDate, "yyyyMMdd'T'235959'Z'")}`,
    };

    events.push(event);
  });

  return createICSContent(events);
};

/**
 * Generate ICS file for a specific faculty
 */
export const generateFacultyICS = (
  entries: TimetableEntry[],
  facultyId: string,
  semesterStartDate: Date,
  semesterEndDate: Date
): string => {
  const facultyEntries = entries.filter(e => e.faculty_id === facultyId);
  const workingDays: WorkingDay[] = [];
  
  return generateICS(facultyEntries, workingDays, semesterStartDate, semesterEndDate);
};

/**
 * Generate ICS file for a specific section
 */
export const generateSectionICS = (
  entries: TimetableEntry[],
  sectionId: string,
  semesterStartDate: Date,
  semesterEndDate: Date
): string => {
  const sectionEntries = entries.filter(e => e.section_id === sectionId);
  const workingDays: WorkingDay[] = [];
  
  return generateICS(sectionEntries, workingDays, semesterStartDate, semesterEndDate);
};

/**
 * Create the actual ICS file content
 */
const createICSContent = (events: CalendarEvent[]): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TimetableGen//College Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:College Timetable',
  ];

  events.forEach((event, index) => {
    const uid = `timetable-${index}-${Date.now()}@timetablegen.app`;
    const dtstamp = formatDateToICS(new Date());
    const dtstart = formatDateToICS(event.startDate);
    const dtend = formatDateToICS(event.endDate);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeICSText(event.title)}`);
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
    if (event.rrule) {
      lines.push(`RRULE:${event.rrule}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
};

/**
 * Format date to ICS format
 */
const formatDateToICS = (date: Date): string => {
  return format(date, "yyyyMMdd'T'HHmmss");
};

/**
 * Escape special characters in ICS text
 */
const escapeICSText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Download ICS file
 */
export const downloadICS = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
