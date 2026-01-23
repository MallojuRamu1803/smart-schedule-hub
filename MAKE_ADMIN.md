# How to Make a User an Admin

After creating a user account, you need to update their role in the database to grant admin access.

## Method 1: Using Supabase Dashboard SQL Editor (Easiest)

### Step 1: Access SQL Editor
1. Go to your Supabase Dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"**

### Step 2: Run the SQL Query

Copy and paste this SQL query, replacing `your-email@example.com` with the email address of the user you want to make admin:

```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

**Example:**
```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'john.doe@university.edu'
);
```

### Step 3: Execute
1. Click the **"Run"** button (or press Ctrl+Enter)
2. You should see: "Success. No rows returned" or "UPDATE 1" (if successful)

### Step 4: Verify
To verify the user is now an admin, run this query:

```sql
SELECT 
  u.email,
  ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

This should show the user with role = 'admin'.

---

## Method 2: Find User ID First, Then Update

If you're not sure of the email, you can first find the user:

### Step 1: List All Users
```sql
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Step 2: Update by User ID
```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = 'paste-user-id-here';
```

---

## Method 3: Check Current Role First

To see what role a user currently has:

```sql
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

---

## Method 4: Make Multiple Users Admin

If you need to make multiple users admin:

```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('user1@example.com', 'user2@example.com', 'user3@example.com')
);
```

---

## Important Notes

1. **Default Role**: When a user signs up, they automatically get the 'student' role (as defined in the `handle_new_user()` trigger in the migration).

2. **Available Roles**: 
   - `'admin'` - Full access to all features
   - `'faculty'` - Faculty-specific access
   - `'student'` - Student-level access (default)

3. **RLS Policies**: The admin role is checked in Row Level Security (RLS) policies to control who can insert/update/delete data.

4. **Logout and Login**: After updating the role, the user should **logout and login again** for the changes to take effect in the frontend application.

---

## Troubleshooting

### "No rows returned" but user exists
- Check that you typed the email correctly (case-sensitive in some databases)
- Verify the user exists: `SELECT * FROM auth.users WHERE email = 'email@example.com';`

### "User has no role entry"
If a user doesn't have an entry in `user_roles` table (shouldn't happen due to trigger, but just in case):

```sql
-- First, get the user ID
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert the admin role (replace USER_ID_HERE with actual ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

### Role not updating in app
- User needs to logout and login again
- Clear browser localStorage
- Check that the frontend is correctly reading the role from `user_roles` table

---

## Quick One-Liner

Replace `your-email@example.com` with your email:

```sql
UPDATE public.user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

