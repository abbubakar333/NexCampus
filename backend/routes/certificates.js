
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT c.*, s.first_name, s.last_name, s.student_id as roll FROM certificates c JOIN students s ON c.student_id = s.id';
    const params = [];
    if (req.user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.rows.length > 0) {
        query += ' WHERE c.student_id = $1';
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
    const { certificate_type, purpose } = req.body;
    const result = await pool.query(
      "INSERT INTO certificates (student_id, certificate_type, purpose) VALUES ($1, $2, $3) RETURNING *",
      [s.rows[0].id, certificate_type, purpose]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false });
  try {
    const { status, remarks } = req.body;
    
    // Build dynamic update
    let query = "UPDATE certificates SET status = $1";
    const params = [status, req.params.id];
    
    if (remarks !== undefined) {
      query += ", remarks = $3";
      params.push(remarks);
    }
    
    query += " WHERE id = $2 RETURNING *";
    
    const result = await pool.query(query, params);
    const cert = result.rows[0];

    if (cert) {
      const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [cert.student_id]);
      if (s.rows.length > 0) {
        await pool.query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", 
          [s.rows[0].user_id, 'Certificate Request Update', `Your certificate request for ${cert.certificate_type} has been ${status}.`]
        );
      }
    }

    res.json({ success: true, data: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
