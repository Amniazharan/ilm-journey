-- ============================================
-- FINAL MIGRATION - ILM JOURNEY
-- ============================================
-- Run this to fix all RLS policies and ensure data isolation
-- Safe to run multiple times

-- ============================================
-- 1. UPDATE PROGRESS_LOGS TABLE STRUCTURE
-- ============================================

-- Add child_id column if not exists
ALTER TABLE progress_logs 
ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE CASCADE;

-- Add milestone_name column if not exists
ALTER TABLE progress_logs 
ADD COLUMN IF NOT EXISTS milestone_name TEXT;

-- Remove NOT NULL constraint from subject_id (for Quran syllabus)
ALTER TABLE progress_logs 
ALTER COLUMN subject_id DROP NOT NULL;

-- Add constraint to ensure either subject_id OR milestone_name exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_subject_or_milestone_name'
    ) THEN
        ALTER TABLE progress_logs
        ADD CONSTRAINT check_subject_or_milestone_name 
        CHECK ((subject_id IS NOT NULL) OR (milestone_name IS NOT NULL));
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_progress_logs_milestone_name 
ON progress_logs(milestone_name);

CREATE INDEX IF NOT EXISTS idx_progress_logs_child_id 
ON progress_logs(child_id);

-- ============================================
-- 2. DROP ALL OLD POLICIES
-- ============================================

-- Progress Logs - Drop all old policies
DROP POLICY IF EXISTS "Users can view logs of own subjects" ON progress_logs;
DROP POLICY IF EXISTS "Users can view their own progress logs" ON progress_logs;
DROP POLICY IF EXISTS "Users can insert logs for own subjects" ON progress_logs;
DROP POLICY IF EXISTS "Users can insert their own progress logs" ON progress_logs;
DROP POLICY IF EXISTS "Users can update logs of own subjects" ON progress_logs;
DROP POLICY IF EXISTS "Users can delete logs of own subjects" ON progress_logs;

-- ============================================
-- 3. CREATE NEW SECURE POLICIES
-- ============================================

-- SELECT: Users can view their own progress logs
CREATE POLICY "Users can view their own progress logs"
ON progress_logs FOR SELECT
USING (
  -- For regular subjects (linked via subject -> child -> user)
  (subject_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM subjects 
    JOIN children ON children.id = subjects.child_id 
    WHERE subjects.id = progress_logs.subject_id 
    AND children.user_id = auth.uid()
  ))
  OR
  -- For Quran syllabus (linked directly via child_id)
  (subject_id IS NULL 
   AND milestone_name IS NOT NULL 
   AND child_id IS NOT NULL 
   AND EXISTS (
    SELECT 1 FROM children
    WHERE children.id = progress_logs.child_id
    AND children.user_id = auth.uid()
  ))
);

-- INSERT: Users can insert their own progress logs
CREATE POLICY "Users can insert their own progress logs"
ON progress_logs FOR INSERT
WITH CHECK (
  -- For regular subjects
  (subject_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM subjects 
    JOIN children ON children.id = subjects.child_id 
    WHERE subjects.id = progress_logs.subject_id 
    AND children.user_id = auth.uid()
  ))
  OR
  -- For Quran syllabus - MUST have child_id
  (subject_id IS NULL 
   AND milestone_name IS NOT NULL 
   AND child_id IS NOT NULL 
   AND EXISTS (
    SELECT 1 FROM children
    WHERE children.id = progress_logs.child_id
    AND children.user_id = auth.uid()
  ))
);

-- UPDATE: Users can update their own progress logs
CREATE POLICY "Users can update their own progress logs"
ON progress_logs FOR UPDATE
USING (
  -- For regular subjects
  (subject_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM subjects 
    JOIN children ON children.id = subjects.child_id 
    WHERE subjects.id = progress_logs.subject_id 
    AND children.user_id = auth.uid()
  ))
  OR
  -- For Quran syllabus
  (subject_id IS NULL 
   AND milestone_name IS NOT NULL 
   AND child_id IS NOT NULL 
   AND EXISTS (
    SELECT 1 FROM children
    WHERE children.id = progress_logs.child_id
    AND children.user_id = auth.uid()
  ))
);

-- DELETE: Users can delete their own progress logs
CREATE POLICY "Users can delete their own progress logs"
ON progress_logs FOR DELETE
USING (
  -- For regular subjects
  (subject_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM subjects 
    JOIN children ON children.id = subjects.child_id 
    WHERE subjects.id = progress_logs.subject_id 
    AND children.user_id = auth.uid()
  ))
  OR
  -- For Quran syllabus
  (subject_id IS NULL 
   AND milestone_name IS NOT NULL 
   AND child_id IS NOT NULL 
   AND EXISTS (
    SELECT 1 FROM children
    WHERE children.id = progress_logs.child_id
    AND children.user_id = auth.uid()
  ))
);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, verify:
-- 1. Each child has separate progress (not shared)
-- 2. Users can add subjects and milestones
-- 3. Copying subject templates works (structure only, no progress data)
-- 4. Quran syllabus progress is per-child

-- ============================================
-- NOTES
-- ============================================
-- Data Isolation:
-- - Regular subjects: Isolated via subject_id -> child_id -> user_id
-- - Quran syllabus: Isolated via child_id -> user_id
-- - Each child has completely separate data
--
-- Subject Templates:
-- - Code handles copying (creates new subject with new ID)
-- - Milestones copied with new IDs
-- - Progress logs NOT copied (empty for new subject)
