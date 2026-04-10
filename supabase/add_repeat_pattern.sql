-- Migration: add repeat_pattern column to planner_tasks
-- Run this once in the Supabase SQL editor

ALTER TABLE public.planner_tasks
  ADD COLUMN IF NOT EXISTS repeat_pattern TEXT;

-- Back-fill existing repeating tasks
UPDATE public.planner_tasks
  SET repeat_pattern = 'weekly'
  WHERE repeat_weekly = true AND repeat_pattern IS NULL;
