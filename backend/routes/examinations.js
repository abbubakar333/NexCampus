const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const DEPT_MAP = {
  'CSE': 'Computer Science & Engineering',
  'ECE': 'Electronics & Communication Engineering',
  'EE': 'Electrical Engineering',
  'EEE': 'Electrical Engineering',
  'MECH': 'Mechanical Engineering',
  'ME': 'Mechanical Engineering',
  'CIVIL': 'Civil Engineering',
  'CE': 'Civil Engineering'
};

// Get all examinations (Admin/Examination Incharge)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM examinations ORDER BY exam_date ASC, start_time ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get upcoming examinations (Student)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM examinations WHERE exam_date >= CURRENT_DATE ORDER BY exam_date ASC';
    const params = [];
    
    if (req.user.role === 'student') {
        const student = await pool.query('SELECT department, semester FROM students WHERE user_id = $1', [req.user.id]);
        if (student.rows.length > 0) {
            const dept = student.rows[0].department;
            const sem = student.rows[0].semester;
            const shortDept = Object.keys(DEPT_MAP).find(k => DEPT_MAP[k] === dept) || dept;
            query = 'SELECT * FROM examinations WHERE exam_date >= CURRENT_DATE AND (department = $1 OR department = $3 OR department ILIKE $4) AND semester = $2 ORDER BY exam_date ASC';
            params.push(dept, sem, shortDept, `%${dept.split(' ')[0]}%`);
        }
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new examination
router.post('/', authenticateToken, async (req, res) => {
  if (!['admin', 'examination_section_incharge'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  let { exam_type, department, semester, subject, exam_date, start_time, end_time, duration, room, instructions, syllabus } = req.body;
  if (DEPT_MAP[department]) {
    department = DEPT_MAP[department];
  }
  try {
    const result = await pool.query(
      'INSERT INTO examinations (exam_type, department, semester, subject, exam_date, start_time, end_time, duration, room, instructions, syllabus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [exam_type, department, semester, subject, exam_date, start_time, end_time, duration, room, instructions, syllabus]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete examination
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'examination_section_incharge'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  try {
    await pool.query('DELETE FROM examinations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
