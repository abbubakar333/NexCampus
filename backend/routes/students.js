
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', authenticateToken, authorizeRoles('admin', 'faculty', 'hod'), async (req, res) => {
  try {
    let query = 'SELECT s.*, u.email, u.is_active FROM students s JOIN users u ON s.user_id = u.id';
    const params = [];
    
    if (req.user.role === 'hod') {
      const facRes = await pool.query('SELECT department FROM faculty WHERE user_id = $1', [req.user.id]);
      if (facRes.rows.length > 0 && facRes.rows[0].department) {
        query += ' WHERE s.department = $1';
        params.push(facRes.rows[0].department);
      }
    }
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { email, password, student_id, roll_number, first_name, last_name, phone, department, course, semester, section, admission_year, dob, batch } = req.body;
  try {
    // Basic duplication checks
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const existingStudent = await pool.query('SELECT id FROM students WHERE student_id = $1 OR roll_number = $2', [student_id, roll_number]);
    if (existingStudent.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Student ID or Roll Number already exists.' });
    }

    await pool.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'student') RETURNING id, email, is_active",
      [email, hash]
    );
    const userId = userRes.rows[0].id;
    const studentRes = await pool.query(
      "INSERT INTO students (user_id, student_id, roll_number, first_name, last_name, phone, department, course, semester, section, admission_year, dob, batch) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [userId, student_id, roll_number, first_name, last_name, phone, department, course, semester, section, admission_year, dob, batch]
    );
    await pool.query('COMMIT');
    
    // Merge user data for frontend table
    const newStudent = { ...studentRes.rows[0], email: userRes.rows[0].email, is_active: userRes.rows[0].is_active };
    res.json({ success: true, data: newStudent });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
