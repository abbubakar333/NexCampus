const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let result = await pool.query('SELECT * FROM admin_settings LIMIT 1');
    if (result.rows.length === 0) {
      result = await pool.query('INSERT INTO admin_settings DEFAULT VALUES RETURNING *');
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false });
  try {
    const { college_name, academic_year, allow_leave_requests, allow_gate_passes } = req.body;
    const result = await pool.query(
      `UPDATE admin_settings SET 
        college_name = $1, 
        academic_year = $2, 
        allow_leave_requests = $3, 
        allow_gate_passes = $4,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [college_name, academic_year, allow_leave_requests, allow_gate_passes]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
