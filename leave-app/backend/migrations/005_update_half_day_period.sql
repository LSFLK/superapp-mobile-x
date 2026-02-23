-- Migration: Update half-day period column
-- Change is_morning boolean to half_day_period string (enum: 'morning', 'evening')

-- Add new half_day_period column
ALTER TABLE leave_days 
  ADD COLUMN half_day_period VARCHAR(10) NULL DEFAULT NULL;

-- Migrate existing data: is_morning=true -> 'morning', is_morning=false -> 'evening'
UPDATE leave_days 
SET half_day_period = CASE 
  WHEN is_morning = 1 THEN 'morning'
  WHEN is_morning = 0 THEN 'evening'
  ELSE NULL
END
WHERE is_half_day = 1;

-- Drop old is_morning column
ALTER TABLE leave_days DROP COLUMN is_morning;
