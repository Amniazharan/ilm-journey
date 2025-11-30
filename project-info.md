# Project Info: Ilm Journey

## Overview
**Ilm Journey** is a mobile-first web application designed for parents to track their children's learning progress. It focuses on Quranic memorization (Hafalan) and custom subjects (skills, school subjects, etc.). The app is built to feel like a native mobile application.

## Tech Stack
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Routing**: React Router DOM
-   **Icons**: Lucide React
-   **Animations**: Framer Motion
-   **Data Storage**: LocalStorage (Client-side only)

## Key Features

### 1. Authentication
-   Simple PIN-based login (Mocked).
-   Redirects to Dashboard upon success.

### 2. Dashboard
-   Displays a list of children.
-   Shows child's name, gender, and calculated age.
-   "Add Child" functionality.

### 3. Child Details & Syllabus
-   **Quran Syllabus**:
    -   Pre-defined structure (Iqra 1-6, Tahap 2-5).
    -   Toggleable visibility via Settings.
    -   Detailed progress logging for each milestone (Date, Page/Ayat, Notes).
-   **Custom Subjects**:
    -   **CRUD**: Create, Read, Update, Delete subjects.
    -   **Milestones**: Define specific goals/steps for each subject.
    -   **Duplication**: Ability to duplicate subject structure (name & milestones) from one child to another (without copying progress).
-   **Progress Logging**:
    -   Generic logging system for both Quran and Custom Subjects.
    -   Records Date, Progress (Page/Info), and Notes.
    -   Completion toggle ("Selesai").

### 4. UI/UX
-   **Mobile-First**: Optimized for touch interactions and small screens.
-   **Edit Mode**: A toggle ("Ubah" / "Selesai") in the Child Details header to show/hide CRUD controls, keeping the interface clean.
-   **Transitions**: Smooth page transitions using `AnimatePresence`.

## Data Structure (LocalStorage)
Key: `children`
Value: Array of Child objects
```json
[
  {
    "id": "uuid",
    "name": "Child Name",
    "gender": "male/female",
    "dob": "YYYY-MM-DD",
    "subjects": [
      {
        "id": "uuid", // or 'quran-syllabus' for system subject
        "name": "Subject Name",
        "isSystem": boolean, // true for Quran
        "milestones": [
          {
            "id": "uuid",
            "description": "Milestone Name",
            "completed": boolean,
            "date": "ISO Date"
          }
        ],
        "logs": {
          "milestoneId": [
            {
              "id": "uuid",
              "date": "YYYY-MM-DD",
              "page": "String",
              "notes": "String"
            }
          ]
        }
      }
    ]
  }
]
```

## Key Files
-   `src/App.jsx`: Main routing and layout.
-   `src/pages/Dashboard.jsx`: Main view listing children.
-   `src/pages/ChildDetails.jsx`: Core logic for managing subjects, milestones, and duplication.
-   `src/pages/ProgressLog.jsx`: Generic page for adding/viewing progress logs.
-   `src/components/QuranSyllabus.jsx`: Component defining the Quran structure.

## Maintenance & Updates
> **IMPORTANT**: Selepas ini, kalau nak update apa-apa dalam code, update juga dalam file ini supaya dokumentasi sentiasa selari dengan kod terkini.
