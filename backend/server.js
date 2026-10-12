const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const noticeRoutes = require('./routes/notices');
const gatePassRoutes = require('./routes/gate-passes');
const hostelRoutes = require('./routes/hostel');
const timetableRoutes = require('./routes/timetable');
const notificationRoutes = require('./routes/notifications');
const certificateRoutes = require('./routes/certificates');
const feeRoutes = require('./routes/fee-queries');
const messRoutes = require('./routes/mess');
const examinationRoutes = require('./routes/examinations');
const feeRoutesNew = require('./routes/fees');
const complaintRoutes = require('./routes/complaints');
const settingsRoutes = require('./routes/settings');
// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/gate-passes', gatePassRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/fee-queries', feeRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/fees', feeRoutesNew);
app.use('/api/general-complaints', complaintRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
