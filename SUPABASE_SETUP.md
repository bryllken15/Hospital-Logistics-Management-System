# Supabase Setup Guide for Logistics1 Hospital System

This guide will help you set up Supabase for the Logistics1 Hospital System with real-time database integration.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `logistics1-hospital-system`
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (usually 2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file:
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Development Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. **IMPORTANT**: Run migrations in the exact order listed below:
   - `supabase/migrations/000_check_dependencies.sql` (optional - checks database state)
   - `supabase/migrations/001_users_and_auth.sql` (creates users table with is_active column)
   - `supabase/migrations/002_projects.sql`
   - `supabase/migrations/003_procurement.sql`
   - `supabase/migrations/004_inventory.sql`
   - `supabase/migrations/005_maintenance.sql`
   - `supabase/migrations/006_documents.sql`
   - `supabase/migrations/007_workflows.sql`
   - `supabase/migrations/008_activities.sql` (requires users table with is_active column)
   - `supabase/migrations/009_rls_policies.sql`
   - `supabase/migrations/010_functions_triggers.sql`
   - `supabase/migrations/011_realtime.sql`
   - `supabase/migrations/012_seed_data.sql`
   - `supabase/migrations/013_create_initial_users.sql` (creates user profile trigger)
   - `supabase/migrations/014_fix_realtime_stats_constraint.sql` (fixes realtime_stats unique constraint)
   - `supabase/migrations/015_enhanced_rls_policies.sql` (enhanced role-based access control)

4. Run each migration by clicking "Run" in the SQL Editor
5. **Wait for each migration to complete** before running the next one

### Option B: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
supabase init
```

3. Link to your remote project:
```bash
supabase link --project-ref your-project-id
```

4. Run migrations:
```bash
supabase db push
```

## Step 5: Create Initial Users

After running all migrations, you need to create users in Supabase Auth:

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User**
4. Create users with these details:

| Email | Password | Role | Full Name | Username |
|-------|----------|------|-----------|----------|
| admin@logistics1.com | admin123 | Admin | System Administrator | admin |
| manager@logistics1.com | manager123 | Manager | John Manager | manager1 |
| employee@logistics1.com | employee123 | Employee | Sarah Warehouse | employee1 |
| procurement@logistics1.com | procurement123 | Procurement Staff | Mike Procurement | procurement1 |
| project@logistics1.com | project123 | Project Manager | Lisa Project | project1 |
| maintenance@logistics1.com | maintenance123 | Maintenance Staff | David Maintenance | maintenance1 |
| document@logistics1.com | document123 | Document Analyst | Emma Document | document1 |

**Important:** When creating users, add this metadata in the "Raw User Meta Data" field:
```json
{
  "role": "Admin",
  "full_name": "System Administrator", 
  "username": "admin"
}
```

### Option 2: Supabase CLI
```bash
# Create users via CLI (requires Supabase CLI)
supabase auth signup --email admin@logistics1.com --password admin123
supabase auth signup --email manager@logistics1.com --password manager123
# ... continue for all users
```

### Option 3: Auth API
Use the Supabase Auth API to create users programmatically.

**Note:** The `013_create_initial_users.sql` migration creates a trigger that automatically creates user profiles in the `public.users` table when users are created in `auth.users`.

## Step 6: Configure Row Level Security (RLS)

The RLS policies are included in the migration files, but you can verify they're active:

1. Go to **Authentication** → **Policies**
2. Ensure all tables have RLS enabled
3. Verify the policies are correctly applied

## Step 6: Enable Real-time

1. Go to **Database** → **Replication**
2. Enable real-time for the following tables:
   - `users`
   - `projects`
   - `procurement_requests`
   - `purchase_orders`
   - `inventory_items`
   - `deliveries`
   - `assets`
   - `maintenance_logs`
   - `documents`
   - `workflow_instances`
   - `notifications`
   - `system_activities`

## Step 7: Test the Connection

1. Start your React application:
```bash
npm start
```

2. Open the browser console and check for any Supabase connection errors
3. Try logging in with the default credentials:
   - **Admin**: `admin` / `admin123`
   - **Manager**: `manager1` / `manager123`
   - **Employee**: `employee1` / `employee123`
   - **Procurement**: `procurement1` / `procurement123`
   - **Project Manager**: `project1` / `project123`
   - **Maintenance**: `maintenance1` / `maintenance123`
   - **Document Analyst**: `document1` / `document123`

## Step 8: Verify Real-time Functionality

1. Open the application in two different browser windows
2. Log in with different user accounts
3. Make changes in one window and verify they appear in real-time in the other window
4. Check the browser console for real-time subscription messages

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your environment variables are correct
   - Check if your Supabase project is active
   - Ensure your IP is not blocked by firewall

2. **Column "is_active" does not exist**
   - This error means the database schema hasn't been set up yet
   - **Solution**: Run all the migration files in order (001 through 012)
   - Make sure you're running the migrations in the Supabase SQL Editor
   - The application will automatically fall back to local storage until the database is set up
   - **Important**: Run migrations in the exact order listed in Step 4

3. **RLS Policy Errors**
   - Verify all RLS policies are correctly applied
   - Check if the user has the correct role
   - Ensure the user is authenticated

4. **Real-time Not Working**
   - Verify real-time is enabled for the tables
   - Check browser console for subscription errors
   - Ensure the user has permission to access the data

5. **Migration Errors**
   - Run migrations in the correct order
   - Check for any syntax errors in the SQL
   - Verify all dependencies are met

6. **No Users Found**
   - Run the seed data migration (012_seed_data.sql)
   - Check if the users table has data
   - Verify the seed data was inserted correctly

### Debug Mode

Enable debug mode by setting `REACT_APP_DEBUG_MODE=true` in your `.env` file. This will show detailed logs in the browser console.

## Security Considerations

1. **Never commit your `.env` file** to version control
2. **Use environment-specific keys** for production
3. **Regularly rotate your API keys**
4. **Monitor your database usage** to avoid exceeding limits
5. **Set up proper backup strategies**

## Production Deployment

For production deployment:

1. Create a production Supabase project
2. Use production environment variables
3. Set up proper backup and monitoring
4. Configure custom domains if needed
5. Set up proper SSL certificates

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the browser console for error messages
3. Check the Supabase dashboard for any service issues
4. Contact support if needed

## Next Steps

After successful setup:

1. Customize the database schema for your specific needs
2. Add additional RLS policies if required
3. Set up monitoring and alerting
4. Configure backup strategies
5. Plan for scaling as your application grows
