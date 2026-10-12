const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT g.*, s.first_name, s.last_name, s.student_id as roll FROM gate_pass_requests g JOIN students s ON g.student_id = s.id';
    const params = [];
    if (req.user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.rows.length > 0) {
        query += ' WHERE g.student_id = $1';
        params.push(s.rows[0].id);
      }
    }
    query += ' ORDER BY g.created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const { date, time, destination, reason, is_emergency } = req.body;
  try {
    const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if(s.rows.length === 0) return res.status(404).json({success: false, message: 'Student profile not found'});
    
    const result = await pool.query(
      "INSERT INTO gate_pass_requests (student_id, date, time, destination, reason, is_emergency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [s.rows[0].id, date, time, destination, reason, is_emergency || false]
    );
    // Also notify admin
    await pool.query("INSERT INTO notifications (user_id, title, message) SELECT id, 'New Gate Pass Request', 'A student requested a gate pass.' FROM users WHERE role='admin'");

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', authenticateToken, authorizeRoles('admin', 'gate_incharge'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayRequests = await pool.query("SELECT COUNT(*) as count FROM gate_pass_requests WHERE date = $1", [today]);
    const pending = await pool.query("SELECT COUNT(*) as count FROM gate_pass_requests WHERE status = 'pending'");
    const outside = await pool.query("SELECT COUNT(*) as count FROM gate_pass_requests WHERE status = 'approved' AND checked_out_at IS NOT NULL AND checked_in_at IS NULL");
    
    res.json({ success: true, data: {
      today_requests: parseInt(todayRequests.rows[0].count),
      pending_requests: parseInt(pending.rows[0].count),
      students_outside: parseInt(outside.rows[0].count)
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'gate_incharge'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE gate_pass_requests SET status = $1, reviewed_by = $2 WHERE id = $3 RETURNING *",
      [status, req.user.id, req.params.id]
    );
    
    // Notify student
    const gpr = result.rows[0];
    const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [gpr.student_id]);
    if(s.rows.length > 0) {
       await pool.query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", 
         [s.rows[0].user_id, 'Gate Pass Status Updated', `Your gate pass request has been ${status}.`]
       );
    }
    
    res.json({ success: true, data: gpr });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/checkout', authenticateToken, authorizeRoles('admin', 'gate_incharge'), async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE gate_pass_requests SET checked_out_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/checkin', authenticateToken, authorizeRoles('admin', 'gate_incharge'), async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE gate_pass_requests SET checked_in_at = CURRENT_TIMESTAMP, status = 'completed' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
