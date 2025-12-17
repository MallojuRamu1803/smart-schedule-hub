export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  semester: number;
  is_active: boolean;
  created_at: string;
}

export interface Section {
  id: string;
  name: string;
  department_id: string;
  academic_year_id: string;
  year_of_study: number;
  created_at: string;
  department?: Department;
  academic_year?: AcademicYear;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  subject_type: 'theory' | 'lab';
  weekly_hours: number;
  section_id: string;
  created_at: string;
  section?: Section;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department_id: string;
  created_at: string;
  department?: Department;
}

export interface FacultySubject {
  id: string;
  faculty_id: string;
  subject_id: string;
  created_at: string;
  faculty?: Faculty;
  subject?: Subject;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  is_lab: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  slot_order: number;
  is_break: boolean;
  break_name: string | null;
  created_at: string;
}

export interface WorkingDay {
  id: string;
  day_name: string;
  day_order: number;
  is_active: boolean;
  created_at: string;
}

export interface FacultyAvailability {
  id: string;
  faculty_id: string;
  working_day_id: string;
  time_slot_id: string;
  is_available: boolean;
  created_at: string;
}

export interface Timetable {
  id: string;
  name: string;
  academic_year_id: string;
  generated_at: string;
  is_active: boolean;
  generation_status: string;
  error_message: string | null;
  created_at: string;
  academic_year?: AcademicYear;
}

export interface TimetableEntry {
  id: string;
  timetable_id: string;
  section_id: string;
  subject_id: string;
  faculty_id: string;
  classroom_id: string;
  working_day_id: string;
  time_slot_id: string;
  is_locked: boolean;
  created_at: string;
  section?: Section;
  subject?: Subject;
  faculty?: Faculty;
  classroom?: Classroom;
  working_day?: WorkingDay;
  time_slot?: TimeSlot;
}

export type AppRole = 'admin' | 'faculty' | 'student';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  department_id: string | null;
  faculty_id: string | null;
  created_at: string;
}
