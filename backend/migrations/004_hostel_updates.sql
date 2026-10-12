-- Add hostel-related fields to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS hostel_status VARCHAR(20) DEFAULT 'day_scholar' CHECK (hostel_status IN ('day_scholar', 'hosteller'));
ALTER TABLE students ADD COLUMN IF NOT EXISTS hostel_block VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS room_number VARCHAR(20);
