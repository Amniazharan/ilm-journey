# Project Info: Ilm Journey

## Overview
**Ilm Journey** is a mobile-first web application designed for parents to track their children's learning progress. It focuses on Quranic memorization (Hafalan) and custom subjects (skills, school subjects, etc.). The app is built to feel like a native mobile application.

## Key Files

### Core Application
-   `src/App.jsx`: Main routing with protected routes and authentication
-   `src/pages/Dashboard.jsx`: Main view listing children with sign out
-   `src/pages/ChildDetails.jsx`: Subject & milestone management with inline editing
-   `src/pages/ProgressLog.jsx`: Progress logging for subjects and milestones
-   `src/pages/Settings.jsx`: Child profile management (add/edit/delete)
-   `src/components/QuranSyllabus.jsx`: Quran structure with progress preview

### Authentication & Backend
-   `src/context/AuthContext.jsx`: Supabase authentication context
-   `src/hooks/useSupabaseData.js`: Custom hook for all Supabase CRUD operations
-   `src/lib/supabase.js`: Supabase client configuration
-   `src/pages/Login.jsx`: Email/password login page
-   `src/pages/Register.jsx`: User registration page
-   `src/pages/ForgotPassword.jsx`: Password reset page
-   `src/pages/AdminDashboard.jsx`: Admin panel for user approval

### Database
-   `final_migration.sql`: Complete database schema and RLS policies
-   `.env.local`: Supabase credentials (not in git)

## Environment Setup

### Required Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Create a new Supabase project
2. Run `final_migration.sql` in Supabase SQL Editor
3. Manually set first admin:
   - Go to Table Editor → `profiles`
   - Find your user
   - Set `role` = 'admin' and `is_approved` = true

### Local Development
```bash
npm install
npm run dev
```

## Deployment

### Netlify Configuration
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Redirects**: `public/_redirects` file handles SPA routing
  ```
  /* /index.html 200
  ```

### Environment Variables on Netlify
Add the same environment variables from `.env.local` to Netlify dashboard

## Maintenance & Updates
> **IMPORTANT**: Selepas ini, kalau nak update apa-apa dalam code, update juga dalam file ini supaya dokumentasi sentiasa selari dengan kod terkini.

## Migration Notes
- **From LocalStorage to Supabase**: Completed
- **Old data**: Not automatically migrated - users need to re-enter data
- **Data Isolation**: Each user and each child has completely separate data
- **Quran Progress**: Uses `milestone_name` + `child_id` for isolation
- **Regular Subjects**: Uses `subject_id` → `child_id` → `user_id` chain
