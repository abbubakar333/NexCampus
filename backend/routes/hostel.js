const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT h.*, s.first_name, s.last_name, s.student_id as roll FROM hostel_complaints h JOIN students s ON h.student_id = s.id';
    const params = [];
    if (req.user.role === 'student') {
      const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (s.rows.length > 0) {
        query += ' WHERE h.student_id = $1';
        params.push(s.rows[0].id);
      }
    }
    query += ' ORDER BY h.created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', authenticateToken, authorizeRoles('student'), async (req, res) => {
  const { category, room_number, description, priority } = req.body;
  try {
    const s = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if(s.rows.length === 0) return res.status(404).json({success: false, message: 'Student profile not found'});
    
    const result = await pool.query(
      "INSERT INTO hostel_complaints (student_id, category, room_number, description, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [s.rows[0].id, category, room_number, description, priority || 'normal']
    );
    
    // Notify admin
    await pool.query("INSERT INTO notifications (user_id, title, message) SELECT id, 'New Complaint', 'A student submitted a new hostel complaint.' FROM users WHERE role='admin'");

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', authenticateToken, authorizeRoles('admin', 'hostel_incharge'), async (req, res) => {
  try {
    const totalResidents = await pool.query("SELECT COUNT(*) as count FROM students WHERE hostel_status = 'hosteller'");
    const occupiedRooms = await pool.query("SELECT COUNT(DISTINCT room_number) as count FROM students WHERE hostel_status = 'hosteller' AND room_number IS NOT NULL");
    const awaitingAllocation = await pool.query("SELECT COUNT(*) as count FROM students WHERE hostel_status = 'hosteller' AND room_number IS NULL");
    const pendingComplaints = await pool.query("SELECT COUNT(*) as count FROM hostel_complaints WHERE status = 'submitted'");
    const tasks = await pool.query("SELECT COUNT(*) as count FROM hostel_complaints WHERE status = 'in_progress'");
    
    res.json({ success: true, data: {
      total_residents: parseInt(totalResidents.rows[0].count),
      occupied_rooms: parseInt(occupiedRooms.rows[0].count),
      total_available: 320, // Hardcoded for demo, 4 blocks * 80 rooms
      awaiting_allocation: parseInt(awaitingAllocation.rows[0].count),
      pending_complaints: parseInt(pendingComplaints.rows[0].count),
      maintenance_tasks: parseInt(tasks.rows[0].count)
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get hostel students
router.get('/students', authenticateToken, authorizeRoles('admin', 'hostel_incharge'), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, student_id, first_name, last_name, department, semester, hostel_status, hostel_block, room_number FROM students WHERE hostel_status = 'hosteller' ORDER BY first_name ASC"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update room allocation
router.put('/students/:id/room', authenticateToken, authorizeRoles('admin', 'hostel_incharge'), async (req, res) => {
  const { hostel_block, room_number } = req.body;
  try {
    // Check if room is already occupied
    if (room_number) {
      const existing = await pool.query("SELECT id FROM students WHERE hostel_block = $1 AND room_number = $2 AND id != $3", [hostel_block, room_number, req.params.id]);
      // Assuming 1 student per room for demo, or 2. Let's allow max 2 per room.
      if (existing.rows.length >= 2) {
         return res.status(400).json({ success: false, message: 'Room capacity exceeded. Maximum 2 students per room.' });
      }
    }
    
    const result = await pool.query(
      "UPDATE students SET hostel_block = $1, room_number = $2 WHERE id = $3 AND hostel_status = 'hosteller' RETURNING id, hostel_block, room_number",
      [hostel_block, room_number, req.params.id]
    );
    if(result.rows.length === 0) {
       return res.status(404).json({ success: false, message: 'Hosteller not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/:id/status', authenticateToken, authorizeRoles('admin', 'hostel_incharge'), async (req, res) => {
  const { status, response } = req.body;
  try {
    const result = await pool.query(
      "UPDATE hostel_complaints SET status = $1, response = COALESCE($2, response), updated_by = $3 WHERE id = $4 RETURNING *",
      [status, response, req.user.id, req.params.id]
    );
    
    // Notify student
    const hc = result.rows[0];
    const s = await pool.query('SELECT user_id FROM students WHERE id = $1', [hc.student_id]);
    if(s.rows.length > 0) {
       await pool.query("INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)", 
         [s.rows[0].user_id, 'Complaint Status Updated', `Your complaint (${hc.category}) status changed to ${status}.`]
       );
    }
    
    res.json({ success: true, data: hc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
