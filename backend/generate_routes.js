const fs = require('fs');

const studentsCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', authenticateToken, authorizeRoles('admin', 'faculty'), async (req, res) => {
  try {
    const result = await pool.query('SELECT s.*, u.email, u.is_active FROM students s JOIN users u ON s.user_id = u.id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { email, password, student_id, first_name, last_name, department, batch } = req.body;
  try {
    await pool.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'student') RETURNING id",
      [email, hash]
    );
    const userId = userRes.rows[0].id;
    const studentRes = await pool.query(
      "INSERT INTO students (user_id, student_id, first_name, last_name, department, batch) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, student_id, first_name, last_name, department, batch]
    );
    await pool.query('COMMIT');
    res.json({ success: true, data: studentRes.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const facultyCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT f.*, u.email, u.is_active FROM faculty f JOIN users u ON f.user_id = u.id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { email, password, faculty_id, first_name, last_name, department, designation } = req.body;
  try {
    await pool.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'faculty') RETURNING id",
      [email, hash]
    );
    const userId = userRes.rows[0].id;
    const facRes = await pool.query(
      "INSERT INTO faculty (user_id, faculty_id, first_name, last_name, department, designation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [userId, faculty_id, first_name, last_name, department, designation]
    );
    await pool.query('COMMIT');
    res.json({ success: true, data: facRes.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const noticesCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin', 'faculty'), async (req, res) => {
  const { title, description, priority, target_audience } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO notices (title, description, priority, target_audience, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, priority || 'normal', target_audience || 'everyone', req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

fs.writeFileSync('routes/students.js', studentsCode);
fs.writeFileSync('routes/faculty.js', facultyCode);
fs.writeFileSync('routes/notices.js', noticesCode);
console.log('Routes generated');
