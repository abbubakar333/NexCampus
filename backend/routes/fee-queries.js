
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT f.*, s.first_name, s.last_name FROM fee_queries f JOIN students s ON f.student_id = s.id';
    const params = [];
    if (req.user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.rows.length > 0) {
        query += ' WHERE f.student_id = $1';
        params.push(s.rows[0].id);
      }
    }
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ success: false });
  try {
    const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const { category, description } = req.body;
    const result = await pool.query(
      "INSERT INTO fee_queries (student_id, category, description) VALUES ($1, $2, $3) RETURNING *",
      [s.rows[0].id, category, description]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
