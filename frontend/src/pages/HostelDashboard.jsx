import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Building2, Bell, ShieldAlert, Users, Home, Search, Edit2, Check, X } from 'lucide-react';

const HostelDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Room Allocation State
  const [editingStudent, setEditingStudent] = useState(null);
  const [hostelBlock, setHostelBlock] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [allocError, setAllocError] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/hostel/stats'),
        api.get('/hostel/students')
      ]);
      setStats(statsRes.data.data);
      setStudents(studentsRes.data.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load hostel data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocateRoom = async (e) => {
    e.preventDefault();
    setAllocError('');
    try {
      const res = await api.put(`/hostel/students/${editingStudent.id}/room`, {
        hostel_block: hostelBlock,
        room_number: roomNumber
      });
      if (res.data.success) {
        setEditingStudent(null);
        fetchData(); // Refresh data
      }
    } catch (err) {
      setAllocError(err.response?.data?.message || 'Failed to allocate room.');
    }
  };

  const handleRemoveAllocation = async (studentId) => {
    if(window.confirm('Are you sure you want to remove this room allocation?')) {
        try {
            await api.put(`/hostel/students/${studentId}/room`, {
                hostel_block: null,
                room_number: null
            });
            fetchData();
        } catch (err) {
            alert('Failed to remove allocation');
        }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="flex justify-center py-20 text-red-500 font-bold">{error}</div>;
  if (!stats) return null;

  const filteredStudents = students.filter(s => 
    s.first_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.hostel_block?.toLowerCase().includes(search.toLowerCase()) ||
    s.room_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel Administration</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Hostel Management</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, {user.profile?.first_name} {user.profile?.last_name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3"><Users className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_residents}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Residents</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3"><Home className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.occupied_rooms} / {stats.total_available}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Occupied Rooms</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3"><Building2 className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.awaiting_allocation}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Awaiting Allocation</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3"><ShieldAlert className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.maintenance_tasks}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Maintenance Tasks</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Hostel Residents</h2>
                <p className="text-sm text-slate-500">Manage room allocations for hostellers</p>
            </div>
            <div className="relative max-w-md w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                type="text" 
                placeholder="Search by name, ID, room..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Block</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No hostellers found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{student.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.first_name} {student.last_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {student.hostel_block ? (
                            <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-full bg-blue-100 text-blue-700">{student.hostel_block}</span>
                        ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {student.room_number ? (
                            <span className="font-semibold text-slate-800">{student.room_number}</span>
                        ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                              setEditingStudent(student);
                              setHostelBlock(student.hostel_block || 'Block A');
                              setRoomNumber(student.room_number || '');
                              setAllocError('');
                          }}
                          className="text-primary-600 hover:text-primary-800 mr-3 inline-flex items-center"
                        >
                            <Edit2 className="w-4 h-4 mr-1" /> {student.room_number ? 'Change Room' : 'Assign Room'}
                        </button>
                        {student.room_number && (
                            <button onClick={() => handleRemoveAllocation(student.id)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                                <X className="w-4 h-4 mr-1" /> Remove
                            </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Allocation Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Allocate Room</h2>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAllocateRoom} className="p-6 space-y-4">
              <div className="mb-2">
                  <p className="text-sm text-slate-500">Student</p>
                  <p className="font-semibold text-slate-800">{editingStudent.first_name} {editingStudent.last_name} ({editingStudent.student_id})</p>
              </div>

              {allocError && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">{allocError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hostel Block*</label>
                <select required value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Block D">Block D</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Room Number*</label>
                <input required type="text" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="e.g. A-101" className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium flex items-center">
                  <Check className="w-4 h-4 mr-2" /> Allocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default HostelDashboard;
