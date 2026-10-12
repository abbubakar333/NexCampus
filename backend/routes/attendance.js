const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT a.*, s.first_name, s.last_name, s.student_id as roll FROM attendance a JOIN students s ON a.student_id = s.id';
    const params = [];
    if (req.user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.rows.length > 0) {
        query += ' WHERE a.student_id = $1';
        params.push(s.rows[0].id);
      }
    }
    query += ' ORDER BY a.date DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('faculty', 'admin', 'hod'), async (req, res) => {
  const { records, subject, date } = req.body;
  // records: [{ student_id, status }]
  try {
    await pool.query('BEGIN');
    
    // Get actual faculty id, not user id
    let facId = null;
    const facRes = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    if (facRes.rows.length > 0) {
      facId = facRes.rows[0].id;
    }
    
    for (const record of records) {
      await pool.query(
        "INSERT INTO attendance (student_id, faculty_id, subject, date, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (student_id, subject, date) DO UPDATE SET status = EXCLUDED.status",
        [record.student_id, facId, subject, date, record.status]
      );
    }
    
    await pool.query('COMMIT');
    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
