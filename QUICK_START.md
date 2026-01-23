# Quick Start Checklist

Follow these steps in order to get the project running:

## ✅ Prerequisites Check

- [ ] **Node.js installed** (v18+)
  - Check: `node --version`
  - Install: [nodejs.org](https://nodejs.org/)

- [ ] **npm installed** (comes with Node.js)
  - Check: `npm --version`

## ✅ Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

**Option A: Remote Supabase (Recommended)**
- [ ] Create account at [supabase.com](https://supabase.com)
- [ ] Create a new project
- [ ] Copy Project URL and anon key from Settings → API
- [ ] Run migrations in SQL Editor:
  - [ ] Run `supabase/migrations/20251217170922_66949a57-a167-489c-ae16-e18a93f29aaa.sql`
  - [ ] Run `supabase/migrations/20251220111402_c39e2317-65b2-4a89-829a-b20244105993.sql`

**Option B: Local Supabase**
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Start: `supabase start`
- [ ] Apply migrations: `supabase db reset`

### 3. Create Environment File
- [ ] Create `.env` in project root
- [ ] Add your Supabase credentials:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
  ```

### 4. Start Development Server
```bash
npm run dev
```

- [ ] Application opens at `http://localhost:8080`
- [ ] Create your first user account
- [ ] (Optional) Upgrade your user to admin via SQL Editor

## 🎉 You're Done!

The app should now be running. See `SETUP.md` for detailed instructions and troubleshooting.

