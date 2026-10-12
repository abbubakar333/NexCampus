const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all complaints
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT c.*, s.first_name, s.last_name, s.department, s.student_id as roll
      FROM complaints c 
      JOIN students s ON c.student_id = s.id 
    `;
    const params = [];
    if (req.user.role === 'student') {
      const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (student.rows.length > 0) {
        query += ' WHERE c.student_id = $1';
        params.push(student.rows[0].id);
      }
    }
    query += ' ORDER BY c.created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student complaints
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const complaints = await pool.query('SELECT * FROM complaints WHERE student_id = $1 ORDER BY created_at DESC', [student.rows[0].id]);
    res.json({ success: true, data: complaints.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit a complaint
router.post('/', authenticateToken, async (req, res) => {
  const { title, category, description } = req.body;
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const result = await pool.query(
      'INSERT INTO complaints (student_id, title, category, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [student.rows[0].id, title, category || 'General', description, 'Submitted']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update complaint status (supports /:id and /:id/status)
router.put(['/:id', '/:id/status'], authenticateToken, async (req, res) => {
  if (!['admin', 'faculty', 'hod', 'hostel_incharge', 'mess_incharge'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  const { status, response } = req.body;
  try {
    const result = await pool.query(
      'UPDATE complaints SET status = $1, response = $2, updated_by = $3 WHERE id = $4 RETURNING *',
      [status, response, req.user.id, req.params.id]
    );
    const comp = result.rows[0];
    if (comp) {
      const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [comp.student_id]);
      if (s.rows.length > 0) {
        await pool.query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)",
          [s.rows[0].user_id, 'Complaint Status Updated', `Your complaint "${comp.title}" status has been updated to ${status}.`]
        );
      }
    }
    res.json({ success: true, data: comp });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
