# Smart Schedule Hub - Setup Guide

This is a comprehensive guide to set up and run the Smart Schedule Hub project locally.

## Project Overview

Smart Schedule Hub is a timetable management system built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL database + Authentication)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Additional**: React Router, React Query, Recharts for analytics

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js and npm
- **Node.js**: Version 18.x or higher
- **npm**: Comes with Node.js (version 9.x or higher)

**Installation:**
- Download and install from [nodejs.org](https://nodejs.org/)
- Or use a version manager like [nvm for Windows](https://github.com/coreybutler/nvm-windows)

**Verify installation:**
```bash
node --version
npm --version
```

### 2. Supabase Account (Optional - for local development)
You have two options:
- **Option A**: Use a remote Supabase project (recommended for quick start)
- **Option B**: Run Supabase locally using Docker (for full local development)

## Step-by-Step Setup

### Step 1: Install Dependencies

Navigate to the project directory and install all dependencies:

```bash
cd smart-schedule-hub
npm install
```

This will install all required packages listed in `package.json`.

### Step 2: Set Up Supabase

#### Option A: Using Remote Supabase (Easiest)

1. **Create a Supabase Account** (if you don't have one)
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Fill in project details
   - Wait for the project to be provisioned (takes 1-2 minutes)

3. **Get Your Supabase Credentials**
   - Go to Project Settings → API
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (under "Project API keys")

4. **Run Database Migrations**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/20251217170922_66949a57-a167-489c-ae16-e18a93f29aaa.sql`
   - Paste and run it in the SQL Editor
   - Then copy and run `supabase/migrations/20251220111402_c39e2317-65b2-4a89-829a-b20244105993.sql`

   Or use the Supabase CLI (if installed):
   ```bash
   supabase db push
   ```

#### Option B: Using Local Supabase (Advanced)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Start Local Supabase**
   ```bash
   supabase start
   ```

4. **Link to Your Project** (if using remote)
   ```bash
   supabase link --project-ref xfkyrzvdjoysygfbfvtr
   ```

5. **Apply Migrations**
   ```bash
   supabase db reset
   ```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the project:

```bash
# Create .env file (Windows PowerShell)
New-Item -Path .env -ItemType File
```

Add the following environment variables to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Example:**
```env
VITE_SUPABASE_URL=https://xfkyrzvdjoysygfbfvtr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Notes:**
- Replace `your_supabase_project_url` with your actual Supabase project URL
- Replace `your_supabase_anon_key` with your actual anon/public key
- Never commit the `.env` file to version control (it's already in `.gitignore`)
- For local Supabase, the URL would be `http://localhost:54321` and key from `supabase status`

### Step 4: Start the Development Server

Run the following command to start the development server:

```bash
npm run dev
```

The application will be available at:
- **Local**: `http://localhost:8080`
- **Network**: The terminal will show the network URL

The server will automatically reload when you make changes to the code.

### Step 5: Create Your First User

1. Open the application in your browser
2. You'll see the authentication page
3. Click on "Sign Up" tab
4. Create an account with:
   - Full Name
   - Email
   - Password (minimum 6 characters)

**Note**: The first user will have the default role of "student". To get admin access:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Run this query (replace `your-email@example.com` with your email):
  ```sql
  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'your-email@example.com'
  );
  ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
smart-schedule-hub/
├── src/
│   ├── components/     # React components (UI, layout)
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # External service integrations (Supabase)
│   ├── lib/            # Utility functions and types
│   ├── pages/          # Page components
│   └── main.tsx        # Application entry point
├── supabase/
│   ├── migrations/     # Database migrations
│   └── config.toml     # Supabase configuration
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Features

The application includes:
- **Authentication**: User sign up/login with Supabase Auth
- **Dashboard**: Overview of the system
- **Departments**: Manage academic departments
- **Faculty**: Manage faculty members
- **Subjects**: Manage subjects and courses
- **Rooms**: Manage classrooms and labs
- **Time Slots**: Configure time slots for scheduling
- **Timetables**: Generate and manage timetables
- **Faculty Availability**: Set faculty availability
- **Swap Requests**: Faculty can request schedule swaps
- **Analytics**: View scheduling analytics
- **Settings**: System settings

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Environment variables not working
**Solution**: 
- Make sure `.env` file is in the root directory
- Restart the development server after creating/modifying `.env`
- Verify variable names start with `VITE_`

### Issue: Supabase connection errors
**Solution**:
- Verify your Supabase URL and key are correct
- Check if your Supabase project is active
- Ensure you've run the database migrations

### Issue: Port 8080 already in use
**Solution**: 
- Change the port in `vite.config.ts` (line 10)
- Or kill the process using port 8080:
  ```bash
  # Windows PowerShell
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```

### Issue: Database errors or missing tables
**Solution**: Ensure all migrations have been run in the correct order:
1. `20251217170922_66949a57-a167-489c-ae16-e18a93f29aaa.sql`
2. `20251220111402_c39e2317-65b2-4a89-829a-b20244105993.sql`

## Next Steps

Once the application is running:
1. Create an admin user (see Step 5)
2. Set up departments
3. Add faculty members
4. Configure subjects and sections
5. Set up time slots and working days
6. Generate your first timetable!

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Vite Documentation](https://vitejs.dev)
- Check the [React Documentation](https://react.dev)

## Database Schema

The application uses the following main tables:
- `departments` - Academic departments
- `academic_years` - Academic year and semester info
- `sections` - Student sections
- `subjects` - Course subjects
- `faculty` - Faculty members
- `faculty_subjects` - Faculty-subject mappings
- `classrooms` - Rooms and labs
- `time_slots` - Available time slots
- `working_days` - Working days configuration
- `faculty_availability` - Faculty availability matrix
- `timetables` - Generated timetables
- `timetable_entries` - Individual timetable entries
- `user_roles` - User role management
- `profiles` - User profiles

