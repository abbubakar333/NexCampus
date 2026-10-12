const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT l.*, s.first_name, s.last_name, s.student_id as roll FROM leave_requests l JOIN students s ON l.student_id = s.id';
    const params = [];
    if (req.user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.rows.length > 0) {
        query += ' WHERE l.student_id = $1';
        params.push(s.rows[0].id);
      }
    } else if (req.user.role === 'hod') {
      const facRes = await pool.query('SELECT department FROM faculty WHERE user_id = $1', [req.user.id]);
      if (facRes.rows.length > 0 && facRes.rows[0].department) {
        query += ' WHERE s.department = $1';
        params.push(facRes.rows[0].department);
      }
    }
    query += ' ORDER BY l.created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  try {
    const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if(s.rows.length === 0) return res.status(404).json({success: false, message: 'Student profile not found'});
    
    const result = await pool.query(
      "INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [s.rows[0].id, leave_type, start_date, end_date, reason]
    );
    
    // Notify admin & faculty
    await pool.query("INSERT INTO notifications (user_id, title, message) SELECT id, 'New Leave Request', 'A student applied for leave.' FROM users WHERE role IN ('admin', 'faculty', 'hod')");

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'faculty', 'hod'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE leave_requests SET status = $1, reviewed_by = $2 WHERE id = $3 RETURNING *",
      [status, req.user.id, req.params.id]
    );
    
    // Notify student
    const leave = result.rows[0];
    const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [leave.student_id]);
    if(s.rows.length > 0) {
       await pool.query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", 
         [s.rows[0].user_id, 'Leave Status Updated', `Your leave request has been ${status}.`]
       );
    }
    
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
