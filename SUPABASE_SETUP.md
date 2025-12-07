# Supabase Setup Instructions for Prosperly

## Step 1: Run Database Schema

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/nsrwbxsuqucvvstdrbkv
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/app/frontend/supabase-schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create:
- `profiles` table (user data)
- `transactions` table (lending/borrowing records)
- `notifications_log` table
- `early_access_signups` table (for landing page)
- `user-content` storage bucket (for avatars)
- Row Level Security policies
- Indexes for performance

## Step 2: Verify Setup

After running the SQL, verify the tables were created:
1. Click **Table Editor** in the left sidebar
2. You should see: `profiles`, `transactions`, `notifications_log`, `early_access_signups`

## Step 3: Storage Setup

1. Click **Storage** in the left sidebar
2. You should see a bucket called `user-content`
3. Make sure it's set to **Public** (for avatar URLs)

## You're all set!

The app is now ready to connect to your Supabase backend.
