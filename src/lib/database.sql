-- Add layout_type column to notes table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND column_name = 'layout_type'
  ) THEN
    ALTER TABLE notes ADD COLUMN layout_type TEXT DEFAULT 'circular';
  END IF;
END $$;

-- Add position columns to notes table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' 
    AND column_name = 'position_x'
  ) THEN
    ALTER TABLE notes ADD COLUMN position_x DOUBLE PRECISION;
    ALTER TABLE notes ADD COLUMN position_y DOUBLE PRECISION;
  END IF;
END $$;