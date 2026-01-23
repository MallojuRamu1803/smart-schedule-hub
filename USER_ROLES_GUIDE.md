# User Roles Guide

The Smart Schedule Hub application has **three user roles**:

## Available Roles

1. **`admin`** - Administrator
2. **`faculty`** - Faculty Member  
3. **`student`** - Student (Default)

---

## Role Definitions

### 1. Admin (`admin`)

**Default Permissions:**
- ✅ Full access to all features
- ✅ Create, read, update, delete all data
- ✅ Manage departments, faculty, subjects, rooms
- ✅ Generate and manage timetables
- ✅ Handle swap requests and substitutions
- ✅ View analytics
- ✅ Manage system settings

**Use Cases:**
- System administrators
- Academic coordinators
- Department heads who need full access

---

### 2. Faculty (`faculty`)

**Default Permissions:**
- ✅ View timetables
- ✅ Create swap requests (request to swap classes with other faculty)
- ✅ View their own schedule
- ✅ View faculty availability
- ❌ Cannot modify departments, subjects, or rooms (admin only)
- ❌ Cannot generate timetables (admin only)
- ❌ Cannot approve swap requests (admin only)

**Use Cases:**
- Professors/lecturers
- Teaching staff who need to request schedule changes

**Special Feature:**
- Faculty members can create swap requests to exchange class timings with other faculty members

---

### 3. Student (`student`)

**Default Permissions:**
- ✅ View timetables (read-only)
- ✅ View their own schedule
- ❌ Cannot modify any data
- ❌ Cannot create swap requests
- ❌ Read-only access to most features

**Use Cases:**
- Students viewing class schedules
- Default role for new user registrations

---

## How to Assign Roles

### Make a User Admin

```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Make a User Faculty

```sql
UPDATE public.user_roles
SET role = 'faculty'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

### Make a User Student (or keep default)

```sql
UPDATE public.user_roles
SET role = 'student'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

---

## Role Assignment on Signup

When a new user signs up, they automatically get the **`student`** role (default).

This is handled by the database trigger `handle_new_user()` in the migration file.

---

## Check User's Current Role

To see what role a user has:

```sql
SELECT 
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';
```

---

## View All Users and Their Roles

```sql
SELECT 
  u.email,
  u.created_at as user_created,
  ur.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;
```

---

## Database Schema

Roles are stored in the `user_roles` table:

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);
```

The `app_role` type is defined as:
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'student');
```

---

## Role-Based Access Control (RLS)

The application uses Row Level Security (RLS) policies to control access:

- **Admin**: Can insert, update, delete on most tables
- **Faculty**: Can create swap requests, view data
- **Student**: Read-only access to most tables

Example from swap_requests table:
- Faculty can create swap requests
- Only admins can approve/reject them

---

## Changing Roles

**Important:** After changing a user's role, they should:
1. Logout from the application
2. Login again for the role change to take effect

---

## Summary

| Role   | Create/Edit Data | Generate Timetables | Swap Requests | View Only |
|--------|------------------|---------------------|---------------|-----------|
| Admin  | ✅ All           | ✅ Yes              | ✅ Approve    | ✅ All    |
| Faculty| ❌ No            | ❌ No               | ✅ Create     | ✅ Limited|
| Student| ❌ No            | ❌ No               | ❌ No         | ✅ Limited|



