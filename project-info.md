# Project Info: Ilm Journey

## Overview
**Ilm Journey** is a mobile-first web application designed for parents to track their children's learning progress. It focuses on Quranic memorization (Hafalan) and custom subjects (skills, school subjects, etc.). The app is built to feel like a native mobile application.

## Tech Stack
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Routing**: React Router DOM
-   **Icons**: Lucide React
-   **Animations**: Framer Motion
-   **Backend**: Supabase (PostgreSQL + Authentication)
-   **Data Storage**: Supabase Database (previously LocalStorage)
-   **Deployment**: Netlify

## Key Features

### 1. Authentication (Supabase Auth)
-   **Email/Password** authentication via Supabase
-   **User Registration** with admin approval workflow
-   **Forgot Password** functionality
-   **Admin Dashboard** for approving new users
-   **Protected Routes** - only authenticated & approved users can access app
-   **Role-based Access** - Admin vs regular User roles

### 2. Dashboard
-   Displays a list of children for the logged-in user
-   Shows child's name, gender, and calculated age
-   "Add Child" functionality
-   **Sign Out** button for logging out
-   Data fetched from Supabase database

### 3. Child Details & Syllabus
-   **Quran Syllabus**:
    -   Pre-defined structure (Iqra 1-6, Tahap 2-5)
    -   Toggleable visibility via Settings
    -   **Expand/Collapse Progress Preview** - Click milestone to view progress inline
    -   Detailed progress logging for each milestone (Date, Page/Ayat, Notes)
    -   **Data Isolation** - Each child has separate Quran progress
-   **Custom Subjects**:
    -   **CRUD**: Create, Read, Update, Delete subjects
    -   **Inline Editing** - Edit subject and milestone names directly
    -   **Milestones**: Define specific goals/steps for each subject
    -   **Duplication**: Copy subject structure from any child (without copying progress data)
-   **Progress Logging**:
    -   Generic logging system for both Quran and Custom Subjects
    -   Records Date, Progress (Page/Info), and Notes
    -   **Edit & Delete** progress entries
    -   All data stored in Supabase with proper user isolation

### 4. UI/UX
-   **Mobile-First**: Optimized for touch interactions and small screens
-   **Edit Mode**: A toggle ("Ubah" / "Selesai") in the Child Details header to show/hide CRUD controls
-   **Transitions**: Smooth page transitions using `AnimatePresence`

## Database Structure (Supabase PostgreSQL)

### Tables

#### `profiles`
- `id` (UUID, FK to auth.users)
- `email`, `role`, `is_approved`, `created_at`

#### `children`
- `id`, `user_id` (FK), `name`, `gender`, `dob`, `quran_enabled`, `created_at`

#### `subjects`
- `id`, `child_id` (FK, CASCADE), `name`, `is_system`, `created_at`

#### `milestones`
- `id`, `subject_id` (FK, CASCADE), `description`, `completed`, `completed_at`, `created_at`

#### `progress_logs`
- `id`, `subject_id` (FK, nullable), `milestone_id` (FK), `milestone_name` (for Quran), `child_id` (FK), `date`, `page`, `notes`, `created_at`

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admins can update profiles for approval
- Data isolation via `child_id` → `user_id` chain

## Key Files

### Core Application
-   `src/App.jsx`: Main routing with protected routes
-   `src/pages/Dashboard.jsx`: Children list with sign out
-   `src/pages/ChildDetails.jsx`: Subject & milestone management
-   `src/pages/ProgressLog.jsx`: Progress logging
-   `src/pages/Settings.jsx`: Child profile management
-   `src/components/QuranSyllabus.jsx`: Quran structure with progress preview

### Authentication & Backend
-   `src/context/AuthContext.jsx`: Supabase auth context
-   `src/hooks/useSupabaseData.js`: Supabase CRUD operations
-   `src/lib/supabase.js`: Supabase client
-   `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `AdminDashboard.jsx`

### Database
-   `final_migration.sql`: Complete schema and RLS policies
-   `.env.local`: Supabase credentials (gitignored)

## Setup

### Environment Variables (`.env.local`)
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Setup
1. Create Supabase project
2. Run `final_migration.sql` in SQL Editor
3. Set first admin in Table Editor → `profiles`:
   - `role` = 'admin'
   - `is_approved` = true

### Local Development
```bash
npm install
npm run dev
```

## Deployment (Netlify)
- Build: `npm run build`
- Publish: `dist`
- Redirects: `public/_redirects` → `/* /index.html 200`
- Add environment variables in Netlify dashboard

## Migration Notes
- **From LocalStorage to Supabase**: Complete
- **Old data**: Not migrated - users re-enter
- **Data Isolation**: Per-user and per-child
- **Quran**: Uses `milestone_name` + `child_id`
- **Subjects**: Uses `subject_id` → `child_id` → `user_id`

## Maintenance
> **IMPORTANT**: Update this file when making code changes to keep documentation in sync.
