const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

const components = {
  'AdminDashboard.jsx': `
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, FileText, Bell, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, faculty, leaves, notices] = await Promise.all([
          api.get('/students'),
          api.get('/faculty'),
          api.get('/leaves'),
          api.get('/notices')
        ]);
        setStats({
          students: students.data.data.length,
          faculty: faculty.data.data.length,
          pendingLeaves: leaves.data.data.filter(l => l.status === 'pending').length,
          notices: notices.data.data.length
        });
      } catch (e) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-primary-500 bg-primary-50 p-2 rounded-lg" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.students}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-emerald-500 bg-emerald-50 p-2 rounded-lg" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Faculty</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.faculty}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <FileText className="h-10 w-10 text-amber-500 bg-amber-50 p-2 rounded-lg" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Pending Leaves</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.pendingLeaves}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center">
              <Bell className="h-10 w-10 text-purple-500 bg-purple-50 p-2 rounded-lg" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Total Notices</p>
                <p className="text-2xl font-semibold text-slate-900">{stats.notices}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading stats...</p>
      )}
    </div>
  );
};
export default AdminDashboard;
`,
  'StudentDashboard.jsx': `
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { BookOpen, Calendar, Bell, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [attendance, timetable, notices] = await Promise.all([
          api.get('/attendance'),
          api.get('/timetable'),
          api.get('/notices')
        ]);
        setData({
          attendance: attendance.data.data,
          timetable: timetable.data.data,
          notices: notices.data.data.slice(0, 5)
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.profile?.first_name}!</h1>
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center"><Calendar className="mr-2 h-5 w-5 text-primary-500"/> Today's Classes</h2>
            {data.timetable.length > 0 ? (
              <ul className="space-y-3">
                {data.timetable.slice(0, 3).map((t, i) => (
                  <li key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                    <div>
                      <p className="font-medium text-slate-900">{t.subject}</p>
                      <p className="text-sm text-slate-500">{t.room_number}</p>
                    </div>
                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">{t.start_time.substring(0,5)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500">No classes today.</p>}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4 flex items-center"><Bell className="mr-2 h-5 w-5 text-amber-500"/> Recent Notices</h2>
            {data.notices.length > 0 ? (
              <ul className="space-y-3">
                {data.notices.map((n, i) => (
                  <li key={i} className="p-3 border border-slate-100 rounded-md">
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <p className="text-sm text-slate-500 truncate">{n.description}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-slate-500">No recent notices.</p>}
          </div>
        </div>
      ) : <p>Loading dashboard...</p>}
    </div>
  );
};
export default StudentDashboard;
`,
  'StudentsList.jsx': `
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/students').then(res => setStudents(res.data.data)).catch(console.error);
  }, []);

  const filtered = students.filter(s => s.first_name.toLowerCase().includes(search.toLowerCase()) || s.student_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Add Student</button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map(student => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{student.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 hover:text-primary-900 cursor-pointer">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default StudentsList;
`,
  'FacultyDashboard.jsx': `
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.profile?.first_name}!</h1>
      <p className="text-slate-600">This is your faculty overview.</p>
    </div>
  );
};
export default FacultyDashboard;
`,
  'Leaves.jsx': `
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    api.get('/leaves').then(res => setLeaves(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Leave Requests</h1>
        {user.role === 'student' && <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Apply Leave</button>}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                {user.role !== 'student' && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {leaves.map(l => (
                <tr key={l.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{l.leave_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{l.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${l.status === 'approved' ? 'bg-green-100 text-green-800' : l.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                      {l.status}
                    </span>
                  </td>
                  {user.role !== 'student' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {l.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 mr-3">Approve</button>
                          <button className="text-red-600 hover:text-red-900">Reject</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Leaves;
`,
  'Notices.jsx': `
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Notices = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.get('/notices').then(res => setNotices(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Campus Notices</h1>
        {user.role === 'admin' && <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Create Notice</button>}
      </div>
      
      <div className="grid gap-6">
        {notices.map(n => (
          <div key={n.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{n.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleDateString()} • {n.category}</p>
              </div>
              <span className={\`px-2 py-1 text-xs font-medium rounded-full \${n.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}\`}>
                {n.priority} priority
              </span>
            </div>
            <p className="mt-4 text-slate-600 whitespace-pre-wrap">{n.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Notices;
`
};

for (const [filename, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(pagesDir, filename), content.trim());
}
console.log('Frontend pages generated.');
