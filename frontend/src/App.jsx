import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';

import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentsList from './pages/StudentsList';
import Leaves from './pages/Leaves';
import Notices from './pages/Notices';
import GatePasses from './pages/GatePasses';
import Complaints from './pages/Complaints';
import Attendance from './pages/Attendance';
import FacultyList from './pages/FacultyList';
import HodDashboard from './pages/HodDashboard';
import HodTimetable from './pages/HodTimetable';
import HostelDashboard from './pages/HostelDashboard';
import StudentHostel from './pages/StudentHostel';
import GateDashboard from './pages/GateDashboard';
import MessDashboard from './pages/MessDashboard';
import AccountDashboard from './pages/AccountDashboard';
import ExamDashboard from './pages/ExamDashboard';
import Certificates from './pages/Certificates';
import Settings from './pages/Settings';
import MessMenu from './pages/MessMenu';
import AccountFees from './pages/AccountFees';
import AccountPayments from './pages/AccountPayments';
import ExamManage from './pages/ExamManage';
import StudentFees from './pages/StudentFees';
import StudentProfile from './pages/StudentProfile';
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="faculty" element={<FacultyList />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="gate-passes" element={<GatePasses />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="notices" element={<Notices />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="hostel" element={<HostelDashboard />} />
            <Route path="mess" element={<MessDashboard />} />
            <Route path="fees" element={<AccountDashboard />} />
            <Route path="payments" element={<AccountPayments />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<FacultyDashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="notices" element={<Notices />} />
          </Route>

          <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="gate-pass" element={<GatePasses />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="notices" element={<Notices />} />
            <Route path="examinations" element={<ExamDashboard />} />
            <Route path="hostel" element={<StudentHostel />} />
            <Route path="mess" element={<MessMenu />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          <Route path="/hod" element={<ProtectedRoute roles={['hod']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<HodDashboard />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="faculty" element={<FacultyList />} />
            <Route path="timetable" element={<HodTimetable />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="notices" element={<Notices />} />
            <Route path="complaints" element={<Complaints />} />
          </Route>
          <Route path="/hostel" element={<ProtectedRoute roles={['hostel_incharge']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<HostelDashboard />} />
            <Route path="manage" element={<HostelDashboard />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="notices" element={<Notices />} />
          </Route>
          <Route path="/gate" element={<ProtectedRoute roles={['gate_incharge']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<GateDashboard />} />
            <Route path="passes" element={<GatePasses />} />
            <Route path="reports" element={<GateDashboard />} />
          </Route>
          <Route path="/mess" element={<ProtectedRoute roles={['mess_incharge']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<MessDashboard />} />
            <Route path="menu" element={<MessMenu />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="notices" element={<Notices />} />
          </Route>
          <Route path="/account" element={<ProtectedRoute roles={['account_section_incharge']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AccountDashboard />} />
            <Route path="fees" element={<AccountFees />} />
            <Route path="payments" element={<AccountPayments />} />
            <Route path="reports" element={<AccountDashboard />} />
          </Route>
          <Route path="/exam" element={<ProtectedRoute roles={['examination_section_incharge']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<ExamDashboard />} />
            <Route path="manage" element={<ExamManage />} />
            <Route path="timetable" element={<ExamDashboard />} />
            <Route path="notices" element={<Notices />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
