ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hod';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hostel_incharge';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'gate_incharge';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mess_incharge';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'account_section_incharge';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'examination_section_incharge';

-- Add hod department info in faculty or create a separate table. Let's add to faculty.
-- Actually, a faculty can be an HOD. Or we can just use the user_role.
-- Let's just rely on user_role and the existing department field in faculty table.

-- Create mess_menus table
CREATE TABLE IF NOT EXISTS mess_menus (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner')),
  items TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, meal_type)
);

-- Create examinations table
CREATE TABLE IF NOT EXISTS examinations (
  id SERIAL PRIMARY KEY,
  exam_type VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INTEGER NOT NULL,
  subject VARCHAR(200) NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration VARCHAR(50),
  room VARCHAR(50),
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0.00,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  fee_id INTEGER REFERENCES fees(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'success'
);

-- Create complaints (unified) table
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Submitted',
  response TEXT,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding an update to gate_pass_requests to track check-out/check-in
ALTER TABLE gate_pass_requests
ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;
