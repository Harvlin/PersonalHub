-- Migration: Add lifecycle and health columns to projects table
-- This migration adds the new two-axis project status model (lifecycle + health)

-- Add new columns if they don't exist
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS lifecycle VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS health VARCHAR(20) DEFAULT 'ON_TRACK',
ADD COLUMN IF NOT EXISTS blocked_reason VARCHAR(500),
ADD COLUMN IF NOT EXISTS blocked_since TIMESTAMP;

-- Migrate existing data:
-- archived=true → lifecycle=ARCHIVED, health=ON_TRACK
-- archived=false AND status='passive' → lifecycle=PASSIVE, health=ON_TRACK  
-- archived=false AND status='blocked' → lifecycle=ACTIVE, health=BLOCKED, blockedReason='(legacy)', blockedSince=NOW
-- archived=false AND status IN {TODO,IN_PROGRESS,WAITING,DONE} → lifecycle=ACTIVE, health=ON_TRACK

UPDATE projects
SET 
  lifecycle = CASE 
    WHEN archived = true THEN 'ARCHIVED'::VARCHAR
    WHEN status = 'PASSIVE' THEN 'PASSIVE'::VARCHAR
    ELSE 'ACTIVE'::VARCHAR
  END,
  health = CASE
    WHEN archived = false AND status = 'BLOCKED' THEN 'BLOCKED'::VARCHAR
    ELSE 'ON_TRACK'::VARCHAR
  END,
  blocked_reason = CASE
    WHEN archived = false AND status = 'BLOCKED' THEN '(legacy)'
    ELSE NULL
  END,
  blocked_since = CASE
    WHEN archived = false AND status = 'BLOCKED' THEN NOW()
    ELSE NULL
  END
WHERE lifecycle = 'ACTIVE'; -- This prevents re-running the migration multiple times

-- Add NOT NULL constraints after data migration
ALTER TABLE projects
ALTER COLUMN lifecycle SET NOT NULL,
ALTER COLUMN health SET NOT NULL;
