
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM timetable';
    const params = [];
    let conditions = [];

    if (req.user.role === 'student') {
      const studentRes = await pool.query('SELECT department, semester, section FROM students WHERE user_id = $1', [req.user.id]);
      if (studentRes.rows.length > 0) {
        const student = studentRes.rows[0];
        conditions.push(`department = $${params.length + 1}`);
        params.push(student.department);
        conditions.push(`semester = $${params.length + 1}`);
        params.push(student.semester);
        conditions.push(`section = $${params.length + 1}`);
        params.push(student.section);
      }
    } else if (req.user.role === 'faculty') {
      const facRes = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
      if (facRes.rows.length > 0) {
        conditions.push(`faculty_id = $${params.length + 1}`);
        params.push(facRes.rows[0].id);
      }
    } else if (req.query.department) {
      conditions.push(`department = $${params.length + 1}`);
      params.push(req.query.department);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY day_of_week, start_time';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hod') return res.status(403).json({ success: false, message: 'Unauthorized' });
  const { department, semester, section, day_of_week, start_time, end_time, subject, faculty_id, room_number } = req.body;
  try {
    // Conflict Check 1: Same faculty at same time
    const facConflict = await pool.query(
        "SELECT * FROM timetable WHERE faculty_id = $1 AND day_of_week = $2 AND ((start_time < $4 AND end_time > $3) OR (start_time >= $3 AND start_time < $4))",
        [faculty_id, day_of_week, start_time, end_time]
    );
    if(facConflict.rows.length > 0) return res.status(400).json({ success: false, message: 'Conflict: Faculty is already assigned to another class at this time.' });

    // Conflict Check 2: Same room at same time
    const roomConflict = await pool.query(
        "SELECT * FROM timetable WHERE room_number = $1 AND day_of_week = $2 AND ((start_time < $4 AND end_time > $3) OR (start_time >= $3 AND start_time < $4))",
        [room_number, day_of_week, start_time, end_time]
    );
    if(roomConflict.rows.length > 0) return res.status(400).json({ success: false, message: 'Conflict: Room is already occupied at this time.' });

    // Conflict Check 3: Same class at same time
    const classConflict = await pool.query(
        "SELECT * FROM timetable WHERE department = $1 AND semester = $2 AND section = $3 AND day_of_week = $4 AND ((start_time < $6 AND end_time > $5) OR (start_time >= $5 AND start_time < $6))",
        [department, semester, section, day_of_week, start_time, end_time]
    );
    if(classConflict.rows.length > 0) return res.status(400).json({ success: false, message: 'Conflict: Class already has a subject scheduled at this time.' });

    const result = await pool.query(
      'INSERT INTO timetable (department, semester, section, day_of_week, start_time, end_time, subject, faculty_id, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [department, semester, section, day_of_week, start_time, end_time, subject, faculty_id, room_number]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hod') return res.status(403).json({ success: false, message: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM timetable WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
