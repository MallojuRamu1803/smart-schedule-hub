# Smart Schedule Hub - Project Explanation Prompt for ChatGPT

Copy and paste this entire prompt to ChatGPT to explain your project:

---

## Project Overview

**Smart Schedule Hub** (also called **TimetableGen**) is a comprehensive web application designed for managing college/university timetables. It's a full-stack application that helps academic institutions automate the creation, management, and optimization of class schedules.

## Core Purpose

The application solves the complex problem of scheduling classes, faculty, rooms, and time slots while avoiding conflicts. It provides:
- Automated timetable generation
- Faculty availability management
- Room allocation
- Subject-to-faculty mapping
- Swap request system for faculty
- Substitution management for absences
- Analytics and reporting

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Context API + TanStack Query (React Query) 5.83.0
- **Form Handling**: React Hook Form 7.61.1 + Zod 3.25.76 for validation
- **Icons**: Lucide React 0.462.0
- **Charts**: Recharts 2.15.4
- **PDF Export**: jsPDF 3.0.4 + jsPDF-AutoTable 5.0.2
- **Date Handling**: date-fns 3.6.0
- **Notifications**: Sonner 1.7.4

### Backend & Database
- **Backend**: Supabase (PostgreSQL database + Authentication + Real-time)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (email/password)
- **API**: Supabase REST API (auto-generated from database schema)

## Application Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (DashboardLayout)
│   └── ui/             # shadcn/ui components (buttons, forms, dialogs, etc.)
├── contexts/           # React Context providers (AuthContext)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and type definitions
├── lib/                # Utility functions and types
│   ├── types.ts        # TypeScript type definitions
│   ├── utils.ts        # Helper functions
│   ├── calendarExport.ts  # Calendar export functionality
│   └── pdfExport.ts    # PDF export functionality
└── pages/              # Page components (routes)
    ├── Auth.tsx        # Login/Signup page
    ├── Dashboard.tsx   # Main dashboard
    ├── Departments.tsx # Department management
    ├── Faculty.tsx      # Faculty management
    ├── Subjects.tsx    # Subject management
    ├── Rooms.tsx        # Classroom management
    ├── TimeSlots.tsx    # Time slot configuration
    ├── Timetables.tsx   # Timetable generation and viewing
    ├── FacultyMapping.tsx        # Map faculty to subjects
    ├── FacultyAvailability.tsx   # Manage faculty availability
    ├── SwapRequests.tsx          # Faculty swap requests
    ├── Substitutions.tsx         # Substitution management
    ├── Analytics.tsx            # Analytics and reports
    └── Settings.tsx             # System settings
```

## Database Schema

### Core Tables

1. **departments** - Academic departments (e.g., Computer Science, Mathematics)
   - Fields: id, name, code, created_at

2. **academic_years** - Academic year and semester information
   - Fields: id, year, semester (1 or 2), is_active, created_at

3. **sections** - Class sections within departments
   - Fields: id, name, department_id, academic_year_id, year_of_study (1-4), created_at

4. **subjects** - Courses/subjects offered
   - Fields: id, name, code, subject_type ('theory' or 'lab'), weekly_hours, section_id, created_at

5. **faculty** - Teaching staff
   - Fields: id, name, email, department_id, created_at

6. **faculty_subjects** - Many-to-many mapping of faculty to subjects they can teach
   - Fields: id, faculty_id, subject_id, created_at

7. **classrooms** - Physical rooms/classrooms
   - Fields: id, name, capacity, is_lab (boolean), created_at

8. **time_slots** - Time periods in a day (e.g., 9:00-9:50 AM)
   - Fields: id, start_time, end_time, slot_order, is_break, break_name, created_at

9. **working_days** - Days of the week (Monday-Sunday)
   - Fields: id, day_name, day_order (0-6), is_active, created_at

10. **faculty_availability** - Faculty availability matrix (day × time slot)
    - Fields: id, faculty_id, working_day_id, time_slot_id, is_available, created_at

11. **timetables** - Generated timetable instances
    - Fields: id, name, academic_year_id, generated_at, is_active, generation_status, error_message, created_at

12. **timetable_entries** - Individual class entries in a timetable
    - Fields: id, timetable_id, section_id, subject_id, faculty_id, classroom_id, working_day_id, time_slot_id, is_locked, created_at

### Advanced Features Tables

13. **substitutions** - Faculty substitution requests (for absences)
    - Fields: id, timetable_entry_id, original_faculty_id, substitute_faculty_id, date, reason, status, created_by, created_at

14. **swap_requests** - Faculty requests to swap class timings
    - Fields: id, requester_faculty_id, target_faculty_id, requester_entry_id, target_entry_id, reason, status, admin_notes, reviewed_by, reviewed_at, created_at

15. **timetable_versions** - Version history of timetables
    - Fields: id, timetable_id, version_number, name, description, snapshot (JSONB), created_by, created_at

16. **timetable_templates** - Reusable timetable templates
    - Fields: id, name, description, template_data (JSONB), department_id, is_public, created_by, created_at

### User Management Tables

17. **auth.users** - Supabase authentication table (managed by Supabase)
    - Stores: email, password hash, user metadata

18. **profiles** - User profile information
    - Fields: id, user_id, full_name, department_id, faculty_id, created_at

19. **user_roles** - Role-based access control
    - Fields: id, user_id, role ('admin', 'faculty', 'student'), created_at

## User Roles & Permissions

### Admin Role
- **Full access** to all features
- Can create, read, update, delete all data
- Can manage departments, faculty, subjects, rooms, time slots
- Can generate timetables
- Can approve/reject swap requests
- Can manage substitutions
- Can view analytics
- Can manage system settings

### Faculty Role
- **Limited access** - read-only for most data
- Can view timetables
- Can create swap requests (to exchange classes with other faculty)
- Can view their own schedule
- Cannot modify departments, subjects, rooms
- Cannot generate timetables
- Cannot approve swap requests

### Student Role (Default)
- **Read-only access**
- Can view timetables
- Can view their own schedule
- Cannot modify any data
- Cannot create swap requests

### Security Implementation
- **Row Level Security (RLS)** enabled on all tables
- Policies enforce role-based access at the database level
- Admin-only operations use `has_role()` function to check permissions
- Authentication handled by Supabase Auth with secure password hashing

## Key Features

### 1. Department & Academic Structure Management
- Create and manage departments
- Set up academic years and semesters
- Create sections (classes) within departments
- Organize by year of study (1st year, 2nd year, etc.)

### 2. Subject Management
- Add subjects with codes and types (theory/lab)
- Assign weekly hours
- Link subjects to specific sections

### 3. Faculty Management
- Add faculty members with email and department
- Map faculty to subjects they can teach (many-to-many)
- Manage faculty availability (which days/times they're available)

### 4. Resource Management
- Manage classrooms with capacity
- Mark rooms as labs or regular classrooms
- Configure time slots (class periods)
- Set working days (Monday-Friday typically)

### 5. Timetable Generation
- Generate timetables automatically based on:
  - Subject requirements
  - Faculty availability
  - Room capacity and type (lab vs theory)
  - Time slot constraints
- Avoid conflicts (same faculty, same room, same section at same time)
- Support for multiple timetables per academic year
- Status tracking (pending, completed, error)

### 6. Timetable Viewing & Management
- View timetables in calendar/grid format
- Filter by section, faculty, or room
- Lock/unlock specific entries
- Export to PDF or calendar format (iCal)

### 7. Swap Requests System
- Faculty can request to swap class timings with other faculty
- Admins can approve/reject swap requests
- Status tracking (pending, approved, rejected, cancelled)

### 8. Substitution Management
- Handle faculty absences
- Assign substitute faculty
- Track substitution status and dates

### 9. Analytics & Reporting
- View statistics and insights
- Generate reports
- Track timetable usage

### 10. Settings
- System configuration
- Manage default values
- User preferences

## Authentication Flow

1. **Sign Up**: Users register with email, password, and full name
   - Default role: 'student'
   - Profile automatically created via database trigger
   - Email confirmation can be enabled/disabled

2. **Sign In**: Email/password authentication via Supabase Auth
   - Session stored in localStorage
   - Auto-refresh tokens
   - Role fetched from `user_roles` table

3. **Protected Routes**: 
   - All routes except `/` and `/auth` require authentication
   - Admin-only routes check `isAdmin` flag
   - Unauthorized users redirected to login

## Data Flow

1. **Frontend** (React) makes API calls via Supabase client
2. **Supabase** handles authentication and validates RLS policies
3. **PostgreSQL** database stores all data
4. **RLS Policies** enforce access control at database level
5. **Triggers** automatically create profiles and assign default roles on signup

## Export Capabilities

- **PDF Export**: Generate PDF timetables using jsPDF
- **Calendar Export**: Export to iCal format for calendar apps
- **Print**: Print-friendly views

## Development Setup

- **Node.js**: v18+ required
- **Package Manager**: npm
- **Environment Variables**: 
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- **Database Migrations**: Located in `supabase/migrations/`
- **Development Server**: `npm run dev` (runs on port 8080)

## Key Design Patterns

- **Component-based architecture** (React)
- **Context API** for global state (authentication)
- **React Query** for server state management
- **TypeScript** for type safety
- **Zod** for runtime validation
- **Row Level Security** for database-level security
- **Database triggers** for automatic data creation

## Business Logic Highlights

1. **Conflict Prevention**: Timetable generation ensures no double-booking
2. **Availability Matching**: Only schedules classes when faculty are available
3. **Room Type Matching**: Labs only for lab subjects, regular rooms for theory
4. **Capacity Management**: Ensures room capacity meets section size
5. **Role-Based Workflows**: Different features available based on user role

## Future Enhancement Areas

- Timetable versioning (schema exists, implementation may be partial)
- Template system (schema exists, implementation may be partial)
- Advanced conflict resolution algorithms
- Multi-semester planning
- Integration with external calendar systems

---

**This is a production-ready college timetable management system with comprehensive features for managing academic scheduling, faculty, resources, and student access.**
