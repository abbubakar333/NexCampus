
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/complaints', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT m.*, s.first_name, s.last_name FROM mess_complaints m JOIN students s ON m.student_id = s.id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get(['/', '/menu'], authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mess_menus ORDER BY date DESC, meal_type ASC LIMIT 100');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/menu', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'mess_incharge') return res.status(403).json({ success: false });
  try {
    const { date, meal_type, items, special_notes } = req.body;
    const result = await pool.query(
      "INSERT INTO mess_menus (date, meal_type, items, special_notes) VALUES ($1, $2, $3, $4) ON CONFLICT (date, meal_type) DO UPDATE SET items = EXCLUDED.items, special_notes = EXCLUDED.special_notes RETURNING *",
      [date, meal_type, items, special_notes]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/menu/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'mess_incharge') return res.status(403).json({ success: false });
  try {
    await pool.query("DELETE FROM mess_menus WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'mess_incharge') return res.status(403).json({ success: false });
  try {
    // Dummy statistics for the dashboard.
    const stats = {
      total_students: 450,
      lunch_today: 412,
      dinner_today: 398,
      breakfast_today: 215,
      complaints_pending: 3,
      recent_complaints: 12
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ success: false });
  try {
    const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const { description } = req.body;
    const result = await pool.query(
      "INSERT INTO mess_complaints (student_id, description) VALUES ($1, $2) RETURNING *",
      [s.rows[0].id, description]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
