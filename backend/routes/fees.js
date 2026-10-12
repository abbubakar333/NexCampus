const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all fees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.*, s.first_name, s.last_name, s.student_id as student_roll, s.department 
      FROM fees f 
      JOIN students s ON f.student_id = s.id 
      ORDER BY f.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student fees
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const fees = await pool.query('SELECT * FROM fees WHERE student_id = $1 ORDER BY created_at DESC', [student.rows[0].id]);
    const payments = await pool.query('SELECT * FROM payments WHERE student_id = $1 ORDER BY payment_date DESC', [student.rows[0].id]);
    
    res.json({ success: true, fees: fees.rows, payments: payments.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Make payment
router.post('/pay', authenticateToken, async (req, res) => {
  const { fee_id, amount, method } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid payment amount' });

  try {
    let s_id;
    if (req.user.role === 'student') {
      const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (student.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      s_id = student.rows[0].id;
    } else if (req.user.role === 'admin' || req.user.role === 'account_section_incharge') {
      const feeCheck = await pool.query('SELECT student_id FROM fees WHERE id = $1', [fee_id]);
      if (feeCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Fee record not found' });
      s_id = feeCheck.rows[0].student_id;
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Validate fee and outstanding balance
    const feeRes = await pool.query('SELECT total_amount, paid_amount FROM fees WHERE id = $1 AND student_id = $2', [fee_id, s_id]);
    if (feeRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Fee record not found' });
    
    const fee = feeRes.rows[0];
    const outstanding = parseFloat(fee.total_amount) - parseFloat(fee.paid_amount);
    
    if (amount > outstanding) {
      return res.status(400).json({ success: false, message: `Payment amount exceeds outstanding balance of ₹${outstanding}` });
    }

    const txId = 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const receiptNum = 'NC-REC-' + Date.now();
    
    const paymentRes = await pool.query(
      'INSERT INTO payments (student_id, fee_id, amount, transaction_id, method, status, receipt_number, payment_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [s_id, fee_id, amount, txId, method || 'UPI', 'success', receiptNum, 'Standard']
    );

    await pool.query(
      "UPDATE fees SET paid_amount = paid_amount + $1, status = CASE WHEN paid_amount + $1 >= total_amount THEN 'paid' ELSE 'partial' END WHERE id = $2",
      [amount, fee_id]
    );

    res.json({ success: true, message: 'Payment successful', payment: paymentRes.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
router.get('/payments', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'account_section_incharge') return res.status(403).json({ success: false });
  try {
    const result = await pool.query(`
      SELECT p.*, f.fee_category, s.first_name, s.last_name, s.student_id as student_roll, s.department 
      FROM payments p 
      JOIN fees f ON p.fee_id = f.id
      JOIN students s ON p.student_id = s.id 
      ORDER BY p.payment_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'account_section_incharge') return res.status(403).json({ success: false });
  try {
    const feesResult = await pool.query('SELECT SUM(total_amount) as total, SUM(paid_amount) as paid, COUNT(DISTINCT student_id) as students FROM fees');
    const todayPayments = await pool.query("SELECT SUM(amount) as today FROM payments WHERE DATE(payment_date) = CURRENT_DATE");
    const expResult = await pool.query('SELECT SUM(amount) as exp FROM college_expenditures');
    
    res.json({ success: true, data: {
      total_fees: parseFloat(feesResult.rows[0].total) || 0,
      paid_fees: parseFloat(feesResult.rows[0].paid) || 0,
      total_students: parseInt(feesResult.rows[0].students) || 0,
      today_payments: parseFloat(todayPayments.rows[0].today) || 0,
      total_expenditures: parseFloat(expResult.rows[0].exp) || 0
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/expenditures', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'account_section_incharge') return res.status(403).json({ success: false });
  try {
    const result = await pool.query('SELECT * FROM college_expenditures ORDER BY transaction_date DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/expenditures', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'account_section_incharge') return res.status(403).json({ success: false });
  const { category, amount, description, transaction_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO college_expenditures (category, amount, description, transaction_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category, amount, description, transaction_date, req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;
