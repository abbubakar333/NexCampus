
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/', authenticateToken, authorizeRoles('admin', 'hod'), async (req, res) => {
  try {
    let query = 'SELECT f.*, u.email, u.is_active FROM faculty f JOIN users u ON f.user_id = u.id';
    const params = [];

    if (req.user.role === 'hod') {
      const hodRes = await pool.query('SELECT department FROM faculty WHERE user_id = $1', [req.user.id]);
      if (hodRes.rows.length > 0 && hodRes.rows[0].department) {
        query += ' WHERE f.department = $1';
        params.push(hodRes.rows[0].department);
      }
    }

    const result = await pool.query(query, params);
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
