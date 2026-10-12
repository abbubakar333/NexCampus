
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM notices';
    if (req.user.role === 'student') {
      query += " WHERE target_audience IN ('everyone', 'students') AND publish_date <= CURRENT_DATE AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)";
    } else if (req.user.role === 'faculty') {
      query += " WHERE target_audience IN ('everyone', 'faculty') AND publish_date <= CURRENT_DATE AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)";
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('admin', 'faculty', 'hod'), async (req, res) => {
  const { title, description, category, priority, target_audience, publish_date, expiry_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO notices (title, description, category, priority, target_audience, publish_date, expiry_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [title, description, category, priority || 'normal', target_audience || 'everyone', publish_date || new Date(), expiry_date || null, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
