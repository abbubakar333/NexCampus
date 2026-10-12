const fs = require('fs');

const attendanceCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attendance');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { student_id, faculty_id, subject, date, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO attendance (student_id, faculty_id, subject, date, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (student_id, subject, date) DO UPDATE SET status = EXCLUDED.status RETURNING *",
      [student_id, faculty_id, subject, date, status]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const leavesCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_requests');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { student_id, leave_type, start_date, end_date, reason } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [student_id, leave_type, start_date, end_date, reason]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const gatePassesCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gate_pass_requests');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { student_id, date, time, destination, reason, is_emergency } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO gate_pass_requests (student_id, date, time, destination, reason, is_emergency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [student_id, date, time, destination, reason, is_emergency || false]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const hostelCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hostel_complaints');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { student_id, category, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO hostel_complaints (student_id, category, description) VALUES ($1, $2, $3) RETURNING *",
      [student_id, category, description]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

fs.writeFileSync('routes/attendance.js', attendanceCode);
fs.writeFileSync('routes/leaves.js', leavesCode);
fs.writeFileSync('routes/gate-passes.js', gatePassesCode);
fs.writeFileSync('routes/hostel.js', hostelCode);
console.log('Rest of routes generated');
