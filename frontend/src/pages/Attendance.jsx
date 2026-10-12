import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CalendarCheck, Plus, X, Users, CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const isStaff = ['admin', 'faculty', 'hod'].includes(user.role);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/attendance');
      setAttendance(res.data.data);
      
      if (isStaff) {
        const studRes = await api.get('/students');
        setStudents(studRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAttendance = (studentId) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };
  
  const markAll = (status) => {
    const newRecords = {};
    students.forEach(s => {
      newRecords[s.id] = status;
    });
    setAttendanceRecords(newRecords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.keys(attendanceRecords).length === 0) {
      return alert("Please mark attendance for at least one student.");
    }
    
    setLoading(true);
    
    const records = Object.keys(attendanceRecords).map(student_id => ({
      student_id,
      status: attendanceRecords[student_id]
    }));
    
    try {
      const res = await api.post('/attendance', {
        subject: formData.subject,
        date: formData.date,
        records
      });
      if (res.data.success) {
        setShowForm(false);
        fetchData(); // reload
        setAttendanceRecords({});
        setFormData({ ...formData, subject: '' });
      }
    } catch (err) {
      alert('Failed to submit attendance.');
    } finally {
      setLoading(false);
    }
  };

  // Stats for students
  const presents = attendance.filter(a => a.status === 'present').length;
  const absents = attendance.filter(a => a.status === 'absent').length;
  const total = presents + absents;
  const percentage = total > 0 ? Math.round((presents / total) * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{user.role === 'student' ? 'My Attendance' : 'Attendance Records'}</h1>
          <p className="text-slate-500 text-sm mt-1">{user.role === 'student' ? 'Track your class attendance' : 'View and manage student attendance'}</p>
        </div>
        {isStaff && (
          <button onClick={() => setShowForm(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium shadow-sm transition">
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
          </button>
        )}
      </div>
      
      {user.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Overall Attendance</p>
            <p className={`text-4xl font-bold ${percentage < 75 ? 'text-red-600' : 'text-emerald-600'}`}>{percentage}%</p>
            {percentage < 75 && <p className="text-xs text-red-500 mt-2 font-medium">Below 75% requirement!</p>}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Classes Attended</p>
            <p className="text-4xl font-bold text-slate-800">{presents}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Classes Missed</p>
            <p className="text-4xl font-bold text-slate-800">{absents}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <CalendarCheck className="w-5 h-5 mr-2 text-primary-500" />
                Mark Class Attendance
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-100 shrink-0 bg-slate-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject*</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g. Data Structures (CS-201)" className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date*</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500 bg-white" />
                </div>
              </div>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700 flex items-center"><Users className="w-4 h-4 mr-2"/> Student List</h3>
                <div className="space-x-2">
                  <button onClick={() => markAll('present')} className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-100 border border-emerald-200 transition">Mark All Present</button>
                  <button onClick={() => markAll('absent')} className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 border border-red-200 transition">Mark All Absent</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {students.map(s => (
                  <div key={s.id} onClick={() => toggleAttendance(s.id)} className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition ${attendanceRecords[s.id] === 'present' ? 'border-emerald-500 bg-emerald-50' : attendanceRecords[s.id] === 'absent' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-primary-300'}`}>
                    <div>
                      <p className="font-semibold text-slate-800">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-slate-500">{s.student_id}</p>
                    </div>
                    <div>
                      {attendanceRecords[s.id] === 'present' ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : attendanceRecords[s.id] === 'absent' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 shrink-0 flex justify-end space-x-3 bg-white">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={loading || !formData.subject} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50 transition">
                {loading ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                {isStaff && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 4 : 3} className="px-6 py-8 text-center text-slate-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendance.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{a.first_name} {a.last_name}</div>
                        <div className="text-xs text-slate-500">{a.roll}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{a.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full uppercase ${a.status === 'present' ? 'bg-emerald-100 text-emerald-700' : a.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Attendance;