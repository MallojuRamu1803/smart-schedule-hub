# Fix "Email Not Confirmed" Error

This guide helps you resolve the email confirmation issue when logging in.

## Quick Solutions

### Method 1: Disable Email Confirmation (Best for Development)

This is the easiest solution for development/testing:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **Authentication** in the left sidebar
   - Click on **Settings** (under Authentication)

2. **Disable Email Confirmation**
   - Scroll down to **"Email Auth"** section
   - Find **"Enable email confirmations"** toggle
   - **Turn it OFF** (disable it)

3. **Save Changes**
   - Scroll down and click **Save**

4. **Try Logging In Again**
   - You should now be able to log in without email confirmation

---

### Method 2: Manually Confirm Email in Database (Quick Fix)

If you want to keep email confirmation enabled but manually confirm a user:

1. **Go to Supabase Dashboard**
   - Click on **SQL Editor**
   - Click **New query**

2. **Run this SQL query** (replace with your email):
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'your-email@example.com';
   ```

3. **Verify it worked**:
   ```sql
   SELECT email, email_confirmed_at, created_at
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```

   The `email_confirmed_at` should now show a timestamp instead of NULL.

---

### Method 3: Check and Resend Confirmation Email

1. **Go to Supabase Dashboard**
   - Click on **Authentication** → **Users**
   - Find your user account

2. **Check Email Status**
   - Look at the **Email Confirmed** column
   - If it shows "No", the email needs confirmation

3. **Resend Confirmation Email** (if needed)
   - Click on the user
   - Scroll down to find options to resend confirmation email
   - OR use SQL Editor:
     ```sql
     -- This will trigger a new confirmation email
     SELECT auth.users.email
     FROM auth.users
     WHERE email = 'your-email@example.com';
     ```

---

### Method 4: Use Supabase Auth API to Resend

You can also resend the confirmation email programmatically. But the easiest is Method 1 (disable it for development).

---

## Recommended Setup for Development

For development, I recommend **disabling email confirmation**:

### Steps:
1. Supabase Dashboard → Authentication → Settings
2. Scroll to **Email Auth**
3. Disable **"Enable email confirmations"**
4. Save

### Why?
- Faster development workflow
- No need to check emails during testing
- You can still manually verify users if needed
- Can be re-enabled for production

---

## For Production

When deploying to production:
- **Re-enable email confirmation** for security
- Make sure your SMTP settings are configured (if using custom email)
- Or use Supabase's default email service

---

## Troubleshooting

### "Email confirmation is disabled but still getting error"
- **Solution**: Clear browser cache and cookies
- Logout and login again
- Make sure you saved the settings in Supabase

### "Can't find the settings"
- Make sure you're in the correct project
- Check that you have project owner/admin access
- Settings are under: Authentication → Settings (not Users)

### "User still can't login after confirming"
- Check if the user exists: `SELECT * FROM auth.users WHERE email = 'email@example.com';`
- Verify `email_confirmed_at` is not NULL
- Try logging out completely and logging in again

