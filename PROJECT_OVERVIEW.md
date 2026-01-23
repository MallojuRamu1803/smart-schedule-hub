# Smart Schedule Hub - Complete Project Overview

## Project Introduction

**Smart Schedule Hub** (also known as **TimetableGen**) is a comprehensive, full-stack college timetable management system designed to automate and streamline the complex process of creating, managing, and maintaining academic schedules. The system eliminates manual scheduling conflicts, ensures optimal resource utilization, and provides role-based access for administrators, faculty, and students.

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Context API (AuthContext)
- **Data Fetching**: TanStack Query (React Query) 5.83.0
- **Form Handling**: React Hook Form 7.61.1 with Zod validation
- **Charts/Visualization**: Recharts 2.15.4
- **PDF Export**: jsPDF 3.0.4 with jspdf-autotable
- **Date Handling**: date-fns 3.6.0
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Backend & Database
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (email/password with email confirmation)
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies
- **API**: RESTful API via Supabase client library

### Development Tools
- **TypeScript**: 5.8.3
- **ESLint**: 9.32.0
- **PostCSS**: 8.5.6
- **Autoprefixer**: 10.4.21

---

## Core Features

### 1. **Automated Timetable Generation**
- **Constraint-based scheduling algorithm** that automatically generates conflict-free timetables
- Respects multiple constraints simultaneously:
  - Faculty availability (marked unavailable slots)
  - Room capacity and type (theory vs lab)
  - Section conflicts (one section can't have two classes at the same time)
  - Faculty conflicts (one faculty can't teach two classes simultaneously)
  - Room conflicts (one room can't host two classes at the same time)
  - Consecutive lab slots (lab sessions require 2 consecutive hours)
  - Weekly hour requirements per subject
  - **Parallel block scheduling**: Certain subjects (e.g., DP-B1, DP-B2, GAI, RPA) must be scheduled together in the same time slot but in different rooms
  - **One period per day rule**: Non-Project Work subjects appear only once per day
  - **Auto-fill empty slots**: Remaining empty teaching cells are automatically filled with "Project Work"

### 2. **Multi-View Timetable Display**
- **Section View**: Grid showing all classes for a specific section (rows = days, columns = time slots)
- **Faculty View**: Personal schedule for each faculty member
- **Room View**: Room utilization across all sections
- **Color-coded entries**: Different colors for theory, lab, breaks, etc.
- **Interactive cells**: Click to view/edit details, swap requests, substitutions

### 3. **User Role Management**
- **Admin**: Full system access
  - Create/edit/delete departments, sections, subjects, faculty, rooms
  - Generate timetables
  - Manage faculty-subject mappings
  - View all timetables and analytics
  - Approve/reject swap requests and substitutions
- **Faculty**: Limited access
  - View personal schedule
  - Request class swaps with other faculty
  - View substitution requests
  - Set availability preferences
- **Student**: Read-only access
  - View section timetables
  - Export timetable to PDF/Excel

### 4. **Faculty Management**
- Add/edit faculty members with department assignment
- Map faculty to subjects they teach
- Set faculty availability (mark unavailable time slots)
- View faculty workload and schedule conflicts

### 5. **Subject & Section Management**
- Create subjects with:
  - Name and code
  - Type (theory or lab)
  - Weekly hours requirement (1-10 hours)
  - Section assignment
- Manage sections within departments
- Associate subjects with specific sections

### 6. **Room & Resource Management**
- Add classrooms and labs with capacity
- Mark rooms as lab or theory type
- Track room utilization
- Ensure appropriate room type for subject type

### 7. **Swap Requests**
- Faculty can request to swap classes with other faculty
- Request includes:
  - Requester and target faculty
  - Requester and target timetable entries
  - Reason for swap
  - Status tracking (pending, approved, rejected, cancelled)
- Admin can approve/reject with notes

### 8. **Substitutions**
- Handle faculty absences
- Assign substitute faculty for specific classes
- Track substitution status and history
- Date-based substitution management

### 9. **Time Slot & Working Days Management**
- Configure time slots (e.g., 09:00-10:00, 10:00-11:00)
- Mark slots as breaks (tea break, lunch break)
- Set active working days (Monday-Saturday)
- Customize slot order

### 10. **Analytics & Reporting**
- Dashboard statistics:
  - Total departments, subjects, faculty, rooms, timetables
  - Faculty-subject mappings count
- Visual charts for resource utilization
- Export capabilities (PDF, Excel)

### 11. **Export Functionality**
- Export timetables to PDF (jsPDF)
- Export to Excel/CSV format
- Calendar export (iCal format)

---

## Database Schema

### Core Tables

1. **departments**
   - Stores college departments (e.g., Computer Science, Electronics)
   - Fields: id, name, code, created_at

2. **academic_years**
   - Academic year and semester information
   - Fields: id, year, semester (1 or 2), is_active, created_at

3. **sections**
   - Sections within departments (e.g., CSE A, CSE B, CSE C)
   - Fields: id, name, department_id, academic_year_id, year_of_study (1-4), created_at

4. **subjects**
   - Subjects/courses offered
   - Fields: id, name, code (unique), subject_type (theory/lab), weekly_hours (1-10), section_id, created_at

5. **faculty**
   - Faculty members
   - Fields: id, name, email (unique), department_id, created_at

6. **faculty_subjects**
   - Many-to-many mapping between faculty and subjects
   - Fields: id, faculty_id, subject_id, created_at

7. **classrooms**
   - Rooms and labs
   - Fields: id, name (unique), capacity, is_lab (boolean), created_at

8. **time_slots**
   - Time periods (e.g., 09:00-10:00)
   - Fields: id, start_time, end_time, slot_order, is_break, break_name, created_at

9. **working_days**
   - Days of the week
   - Fields: id, day_name (unique), day_order (0-6), is_active, created_at

10. **faculty_availability**
    - Faculty availability/unavailability for specific day-slot combinations
    - Fields: id, faculty_id, working_day_id, time_slot_id, is_available, created_at

11. **timetables**
    - Generated timetable containers
    - Fields: id, name, academic_year_id, generated_at, is_active, generation_status, error_message, created_at

12. **timetable_entries**
    - Individual class entries within a timetable
    - Fields: id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at
    - Unique constraint: (timetable_id, section_id, working_day_id, time_slot_id)

### Supporting Tables

13. **substitutions**
    - Faculty substitution records
    - Fields: id, timetable_entry_id, original_faculty_id, substitute_faculty_id, date, reason, status, created_by, created_at

14. **swap_requests**
    - Faculty swap requests
    - Fields: id, requester_faculty_id, target_faculty_id, requester_entry_id, target_entry_id, reason, status, admin_notes, reviewed_by, reviewed_at, created_at

15. **timetable_versions**
    - Version history for timetables
    - Fields: id, timetable_id, version_number, name, description, snapshot (JSONB), created_by, created_at

16. **timetable_templates**
    - Reusable timetable patterns
    - Fields: id, name, description, template_data (JSONB), created_by, created_at

17. **user_roles**
    - User role assignments
    - Fields: id, user_id (references auth.users), role (admin/faculty/student), created_at

18. **profiles**
    - User profile information
    - Fields: id, user_id (unique), full_name, department_id, faculty_id, created_at

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Policies**:
  - Admin: Full CRUD access
  - Faculty: Read own data, limited write (swap requests, availability)
  - Student: Read-only access to timetables
- **Authentication**: Supabase Auth with email confirmation

---

## Key Algorithms & Logic

### Timetable Generation Algorithm

The generator uses a **multi-pass constraint-based scheduling algorithm**:

1. **First Pass - Core Subjects**:
   - Iterates through all sections and their subjects
   - For each subject, schedules required weekly hours
   - Checks constraints:
     - Faculty availability (not marked unavailable)
     - Faculty not already scheduled in that slot
     - Section not already scheduled in that slot
     - Room available and matches subject type (lab vs theory)
     - For labs: ensures consecutive 2-hour slots
   - Tracks `subjectScheduledPerDay` to ensure non-Project Work subjects appear only once per day

2. **Parallel Block Pass**:
   - Identifies parallel block subjects (e.g., DP-B1, DP-B2, GAI, RPA) by name/code matching
   - Schedules all parallel block subjects together in the same time slot
   - Each subject uses a different room (parallel sessions)
   - Parallel block appears only once per day, but can repeat across multiple days based on weekly hours

3. **Fill Pass**:
   - After core scheduling, fills remaining empty teaching slots
   - Uses "Project Work" subject to fill gaps
   - Respects faculty availability and room constraints

4. **Post-Processing**:
   - Final filter to guarantee no non-Project Work subject appears twice on the same day
   - Removes duplicate entries if any exist

### Constraint Checking

- **Faculty Conflict**: `slotUsage.has('faculty_${facultyId}')`
- **Section Conflict**: `slotUsage.has('section_${sectionId}')`
- **Room Conflict**: `slotUsage.has('room_${roomId}')`
- **Faculty Availability**: Checks `faculty_availability` table for `is_available = false`
- **Lab Consecutive Slots**: Ensures current slot + next slot are both free for lab subjects

---

## User Workflows

### Admin Workflow
1. **Setup Phase**:
   - Create departments
   - Add academic years
   - Create sections within departments
   - Add faculty members
   - Add subjects for each section
   - Add classrooms/labs
   - Map faculty to subjects
   - Set faculty availability (optional)
   - Configure time slots and working days

2. **Generation Phase**:
   - Select academic year
   - Enter timetable name
   - Click "Generate Timetable"
   - System generates conflict-free timetable
   - Review generated timetable
   - Edit manually if needed (lock entries)
   - Activate timetable

3. **Management Phase**:
   - View timetables by section/faculty/room
   - Handle swap requests (approve/reject)
   - Manage substitutions
   - Export timetables
   - View analytics

### Faculty Workflow
1. View personal schedule
2. Set availability preferences (mark unavailable slots)
3. Request class swaps with other faculty
4. View substitution requests
5. Export personal schedule

### Student Workflow
1. View section timetable
2. Filter by day/week
3. Export timetable to PDF/Excel

---

## File Structure

```
smart-schedule-hub/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx
│   │   ├── ui/          # shadcn/ui components
│   │   └── NavLink.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── calendarExport.ts
│   │   ├── pdfExport.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Analytics.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Departments.tsx
│   │   ├── Faculty.tsx
│   │   ├── FacultyAvailability.tsx
│   │   ├── FacultyMapping.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   ├── Rooms.tsx
│   │   ├── Settings.tsx
│   │   ├── Subjects.tsx
│   │   ├── Substitutions.tsx
│   │   ├── SwapRequests.tsx
│   │   ├── TimeSlots.tsx
│   │   └── Timetables.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 20251217170922_*.sql  # Core schema
│   │   └── 20251220111402_*.sql  # Substitutions, swaps, versions
│   ├── seed.sql                  # Seed data for CSE-C section
│   └── config.toml
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Current Implementation Status

### ✅ Completed Features
- User authentication (signup, login, email confirmation)
- Role-based access control (admin, faculty, student)
- Department, section, subject, faculty, room management
- Faculty-subject mapping
- Faculty availability management
- Time slot and working day configuration
- Automated timetable generation with constraint-based algorithm
- Parallel block scheduling (DP-B1, DP-B2, GAI, RPA together)
- One period per day rule for non-Project Work subjects
- Auto-fill empty slots with Project Work
- Multi-view timetable display (section, faculty, room views)
- Swap request system
- Substitution management
- PDF/Excel export
- Analytics dashboard
- Delete timetable functionality
- Seed data for CSE-C section with real college timetable

### 🔧 Technical Details

**Timetable Generation Logic** (`src/pages/Timetables.tsx`):
- Multi-pass algorithm with constraint checking
- Parallel block detection and scheduling
- Post-processing to ensure rule compliance
- Error handling and status tracking

**Database Constraints**:
- Foreign key relationships with CASCADE deletes
- Unique constraints on codes, emails, combinations
- Check constraints (weekly_hours: 1-10, semester: 1-2, year_of_study: 1-4)
- RLS policies for security

**UI/UX**:
- Responsive design with Tailwind CSS
- Gradient themes and animations
- Toast notifications for user feedback
- Loading states and error handling
- Modal dialogs for forms
- Data tables with sorting/filtering

---

## Real-World Usage

The system is currently configured with **real college data** for:
- **Department**: Computer Science (CSE)
- **Academic Year**: 2025-2026, Semester 2
- **Section**: CSE-C (4th Year)
- **Timetable**: Complete weekly schedule with:
  - Project Work (New Cellar) - multiple faculty
  - OB (Organizational Behavior)
  - DP (Design Patterns) - B1 and B2 batches
  - GAI (Generative Artificial Intelligence)
  - RPA (Robotic Process Automation)
  - OE / Library
  - Mentoring sessions
  - Minor project / Guide interaction
  - Sports / Library hours

All timetable entries match the actual college timetable with exact faculty assignments, rooms, and time slots.

---

## Future Enhancements (Potential)

- Calendar integration (Google Calendar, Outlook)
- Mobile app (React Native)
- Notification system for schedule changes
- Conflict resolution suggestions
- Bulk import/export (Excel templates)
- Advanced analytics (workload distribution, room utilization trends)
- Multi-language support
- Dark mode toggle
- Timetable comparison (before/after changes)
- Automated email notifications

---

## Deployment

- **Frontend**: Can be deployed to Vercel, Netlify, or any static hosting
- **Backend**: Supabase (hosted PostgreSQL + Auth + Storage)
- **Environment Variables**: 
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## Key Differentiators

1. **Intelligent Constraint-Based Generation**: Not just random assignment, but respects all real-world constraints
2. **Parallel Block Support**: Handles complex scenarios where multiple subjects must run simultaneously
3. **One Period Per Day Rule**: Ensures balanced distribution of subjects
4. **Auto-Fill Logic**: Automatically fills gaps with appropriate subjects
5. **Role-Based Access**: Different views and permissions for different user types
6. **Real-Time Updates**: Supabase Realtime for live changes
7. **Export Capabilities**: PDF, Excel, Calendar formats
8. **Production-Ready**: Used with real college data and schedules

---

This system is designed to handle the complexity of college timetable management while providing an intuitive interface for all stakeholders.
