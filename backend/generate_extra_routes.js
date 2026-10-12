const fs = require('fs');

const timetableCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM timetable ORDER BY day_of_week, start_time';
    const params = [];
    
    if (req.query.department) {
      query = 'SELECT * FROM timetable WHERE department = $1 ORDER BY day_of_week, start_time';
      params.push(req.query.department);
    }
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const notificationsCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const certificatesCode = `
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
    const { certificate_type } = req.body;
    const result = await pool.query(
      "INSERT INTO certificates (student_id, certificate_type) VALUES ($1, $2) RETURNING *",
      [s.rows[0].id, certificate_type]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false });
  try {
    const result = await pool.query(
      "UPDATE certificates SET status = $1 WHERE id = $2 RETURNING *",
      [req.body.status, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
`;

const feesCode = `
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
`;

const messCode = `
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT m.*, s.first_name, s.last_name FROM mess_complaints m JOIN students s ON m.student_id = s.id');
    res.json({ success: true, data: result.rows });
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
`;

fs.writeFileSync('routes/timetable.js', timetableCode);
fs.writeFileSync('routes/notifications.js', notificationsCode);
fs.writeFileSync('routes/certificates.js', certificatesCode);
fs.writeFileSync('routes/fee-queries.js', feesCode);
fs.writeFileSync('routes/mess.js', messCode);
console.log('Additional routes generated');
