-- Adding special_notes to mess_menus
ALTER TABLE mess_menus ADD COLUMN IF NOT EXISTS special_notes VARCHAR(255);

-- Update meal_type constraint to allow Snacks (Requires dropping constraint and re-adding)
ALTER TABLE mess_menus DROP CONSTRAINT IF EXISTS mess_menus_meal_type_check;
ALTER TABLE mess_menus ADD CONSTRAINT mess_menus_meal_type_check CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner'));

-- Create expenditures table
CREATE TABLE IF NOT EXISTS college_expenditures (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding syllabus to examinations
ALTER TABLE examinations ADD COLUMN IF NOT EXISTS syllabus TEXT;
