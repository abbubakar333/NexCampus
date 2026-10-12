const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const components = {
  'GatePasses.jsx': `
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const GatePasses = () => {
  const { user } = useContext(AuthContext);
  const [gatePasses, setGatePasses] = useState([]);

  useEffect(() => {
    api.get('/gate-passes').then(res => setGatePasses(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Gate Passes</h1>
        {user.role === 'student' && <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Request Pass</button>}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                {user.role === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {gatePasses.map(g => (
                <tr key={g.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{new Date(g.date).toLocaleDateString()} {g.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{g.destination}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{g.reason} {g.is_emergency && <span className="ml-2 text-xs text-red-600 font-bold border border-red-600 px-1 rounded">EMERGENCY</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${g.status === 'approved' ? 'bg-green-100 text-green-800' : g.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                      {g.status}
                    </span>
                  </td>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {g.status === 'pending' && (
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
export default GatePasses;
`,
  'Complaints.jsx': `
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get('/hostel').then(res => setComplaints(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Hostel Complaints</h1>
        {user.role === 'student' && <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">New Complaint</button>}
      </div>
      
      <div className="grid gap-4">
        {complaints.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-slate-900">{c.category} (Room {c.room_number})</h3>
              <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${c.status === 'resolved' ? 'bg-green-100 text-green-800' : c.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                {c.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-600">{c.description}</p>
            {c.response && (
              <div className="mt-4 bg-slate-50 p-3 rounded text-sm text-slate-700 border-l-4 border-primary-500">
                <span className="font-semibold block mb-1">Response:</span>
                {c.response}
              </div>
            )}
            {user.role === 'admin' && c.status !== 'resolved' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-800 mr-4">Mark In Progress</button>
                <button className="text-sm font-medium text-green-600 hover:text-green-800">Resolve</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Complaints;
`,
  'Attendance.jsx': `
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    api.get('/attendance').then(res => setAttendance(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{user.role === 'student' ? 'My Attendance' : 'Attendance Records'}</h1>
        {user.role === 'faculty' && <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Mark Attendance</button>}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {attendance.map(a => (
                <tr key={a.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{a.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2 inline-flex text-xs leading-5 font-semibold rounded-full \${a.status === 'present' ? 'bg-green-100 text-green-800' : a.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}\`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Attendance;
`,
  'FacultyList.jsx': `
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/faculty').then(res => setFaculty(res.data.data)).catch(console.error);
  }, []);

  const filtered = faculty.filter(f => f.first_name.toLowerCase().includes(search.toLowerCase()) || f.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Add Faculty</button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input type="text" placeholder="Search faculty or department..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map(f => (
                <tr key={f.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{f.faculty_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{f.first_name} {f.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{f.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{f.designation}</td>
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
export default FacultyList;
`
};

for (const [filename, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(pagesDir, filename), content.trim());
}
console.log('Frontend pages batch 2 generated.');
