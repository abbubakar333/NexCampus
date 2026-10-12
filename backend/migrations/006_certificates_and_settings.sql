ALTER TABLE certificates ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Drop check constraint to allow 'issued'
ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_status_check;
ALTER TABLE certificates ADD CONSTRAINT certificates_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'issued'));

CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  college_name VARCHAR(255) DEFAULT 'NexCampus Demo College',
  academic_year VARCHAR(20) DEFAULT '2025-2026',
  allow_leave_requests BOOLEAN DEFAULT true,
  allow_gate_passes BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
