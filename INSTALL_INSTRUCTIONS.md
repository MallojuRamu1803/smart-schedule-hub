# Installation Instructions for Friends/Collaborators

If you're getting an error like:
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

This usually means you're in the wrong directory. Follow these steps:

## Step 1: Navigate to the Correct Directory

The project might be nested in a folder. Check the structure:

```powershell
# List what's in the current directory
ls
# or
dir
```

## Step 2: Find the Correct Folder

You need to find the folder that contains `package.json`. Common scenarios:

### Scenario A: Project is in a nested folder
If you see a folder like `smart-schedule-hub-main` or `smart-schedule-hub` inside:
```powershell
cd smart-schedule-hub-main
# or
cd smart-schedule-hub
```

Then check if package.json exists:
```powershell
ls package.json
```

### Scenario B: Project files are in the current directory
If you can see `package.json` in the current directory listing:
```powershell
ls package.json
```

If it exists, you're in the right place!

## Step 3: Verify You're in the Right Place

Before running `npm install`, verify you can see these files:
- `package.json` ✅
- `src/` folder ✅
- `index.html` ✅
- `vite.config.ts` ✅

## Step 4: Install Dependencies

Once you're in the correct directory:
```powershell
npm install
```

This will install all the dependencies.

## Step 5: Set Up Environment Variables

Create a `.env` file in the project root with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Step 6: Run the Development Server

```powershell
npm run dev
```

---

## Quick Troubleshooting

### If package.json is missing:
1. Check if you extracted/downloaded the project correctly
2. Make sure you have the complete project folder
3. Check if there's a nested folder you need to enter

### If you're unsure of the directory structure:
```powershell
# Find package.json in current and subdirectories
Get-ChildItem -Recurse -Filter package.json | Select-Object FullName
```

This will show you where package.json actually is.

---

## Complete Installation Steps Summary

1. **Navigate to project folder**
   ```powershell
   cd "path\to\smart-schedule-hub"
   ```

2. **Verify package.json exists**
   ```powershell
   Test-Path package.json
   ```
   Should return `True`

3. **Install dependencies**
   ```powershell
   npm install
   ```

4. **Create .env file** (see Step 5 above)

5. **Run the app**
   ```powershell
   npm run dev
   ```

