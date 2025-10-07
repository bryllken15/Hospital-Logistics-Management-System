# Quick Supabase Setup Guide

## Step 1: Create New Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `logistics1-hospital-system`
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually 2-3 minutes)

## Step 2: Get New Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-new-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Update Your Environment File

Update your `.env` file with the new credentials:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-new-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-new-supabase-anon-key

# Application Configuration
REACT_APP_APP_NAME=Logistics1 Hospital System
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Real-time Configuration
REACT_APP_REALTIME_ENABLED=true
REACT_APP_REALTIME_EVENTS_PER_SECOND=10

# File Upload Configuration
REACT_APP_MAX_FILE_SIZE=10485760
REACT_APP_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Security Configuration
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_MAX_LOGIN_ATTEMPTS=5

# Development Configuration
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug
```

## Step 4: Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - `supabase/migrations/001_users_and_auth.sql`
   - `supabase/migrations/002_projects.sql`
   - `supabase/migrations/003_procurement.sql`
   - `supabase/migrations/004_inventory.sql`
   - `supabase/migrations/005_maintenance.sql`
   - `supabase/migrations/006_documents.sql`
   - `supabase/migrations/007_workflows.sql`
   - `supabase/migrations/008_activities.sql`
   - `supabase/migrations/009_rls_policies.sql`
   - `supabase/migrations/010_functions_triggers.sql`
   - `supabase/migrations/011_realtime.sql`
   - `supabase/migrations/012_seed_data.sql`
   - `supabase/migrations/013_create_initial_users.sql`
   - `supabase/migrations/014_fix_realtime_stats_constraint.sql`
   - `supabase/migrations/015_enhanced_rls_policies.sql`

## Step 5: Test the Connection

1. Restart your React app: `npm start`
2. Open http://localhost:3000
3. Check the connection status on the login page
4. Use the diagnostic tools in the browser console

## Troubleshooting

If you still get connection errors:
1. Check the browser console for specific error messages
2. Verify your Supabase project is active (not paused)
3. Ensure your API keys are correct
4. Check if your network allows connections to Supabase
