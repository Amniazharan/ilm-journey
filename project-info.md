# Ilm Journey - Project Info

## Overview
Ilm Journey is a mobile-first web application designed to help parents track their children's educational progress, specifically focusing on Quran memorization and other custom subjects.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, RLS)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Key Features

### 1. Authentication
- User registration and login.
- Protected routes for authenticated users.
- Admin dashboard (role-based access).

### 2. Dashboard
- **Child Management**: Add, edit, and view children profiles.
- **Recent Achievements**: A feed of the latest completed milestones across all children.
- **Quick Stats**: Age calculation and gender indicators.

### 3. Child Details
- **Subject Management**: Create custom subjects (e.g., Mathematics, Science).
- **Quran Syllabus**: Dedicated section for Quran memorization tracking (Iqra, Juz Amma, etc.).
- **Milestone Tracking**: Add milestones to subjects and track progress.
- **Completion Status**: Mark milestones as "Selesai" (Completed) with visual indicators (mini cards).
- **Duplication**: Ability to duplicate subjects and milestones from siblings.

### 4. Progress Logging
- **Detailed Logs**: Record date, progress (page/verse), and notes for each milestone.
- **History**: View history of all progress logs.
- **Completion Logic**: Special "SELESAI" log type to mark milestones as complete.

## Database Structure
- **users**: Profiles linked to Supabase Auth.
- **children**: Child profiles belonging to a user.
- **subjects**: Educational subjects linked to a child.
- **milestones**: Specific goals/chapters within a subject.
- **progress_logs**: Records of progress for milestones (or direct Quran syllabus items).

## Recent Updates
- **UI/UX Overhaul**: Modern, premium design with consistent color palette (Slate, Indigo, Emerald).
- **Dashboard Redesign**: Added "Recent Achievements" and improved card layouts.
- **Data Isolation Fix**: Fixed bug where progress was shared between children.
- **RLS Updates**: Improved security policies for flexible data access.
