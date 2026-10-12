-- Alter fees table to add category and semester info
ALTER TABLE fees ADD COLUMN IF NOT EXISTS fee_category VARCHAR(100) DEFAULT 'Semester Fee';
ALTER TABLE fees ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);
ALTER TABLE fees ADD COLUMN IF NOT EXISTS semester INTEGER;

-- Alter payments table to add receipt_number and payment_type
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100) UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50) DEFAULT 'Demo';

-- Update existing payments to be identified
UPDATE payments SET receipt_number = 'NC-DEMO-' || id WHERE receipt_number IS NULL;
