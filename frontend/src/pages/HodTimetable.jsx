import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Plus, X, Trash2 } from 'lucide-react';

const HodTimetable = () => {
  const { user } = useContext(AuthContext);
  const [timetable, setTimetable] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    semester: 1,
    section: 'A',
    day_of_week: 'Monday',
    start_time: '',
    end_time: '',
    subject: '',
    faculty_id: '',
    room_number: ''
  });

  const department = user.profile?.department;

  useEffect(() => {
    fetchData();
  }, [department]);

  const fetchData = async () => {
    try {
      if (!department) return;
      const [timeRes, facRes] = await Promise.all([
        api.get(`/timetable?department=${encodeURIComponent(department)}`),
        api.get('/faculty')
      ]);
      setTimetable(timeRes.data.data);
      // Only keep faculty in this department
      setFacultyList(facRes.data.data.filter(f => f.department === department));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData, department };
      const res = await api.post('/timetable', payload);
      if (res.data.success) {
        setShowForm(false);
        setFormData({ ...formData, subject: '', start_time: '', end_time: '' });
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save timetable. Check for conflicts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // Group timetable by semester and section
  const grouped = timetable.reduce((acc, curr) => {
    const key = `Semester ${curr.semester} - Section ${curr.section}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Timetable Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage timetable for {department}</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition shadow-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </button>
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Add Timetable Entry
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester*</label>
                  <input required type="number" min="1" max="8" name="semester" value={formData.semester} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section*</label>
                  <input required type="text" name="section" value={formData.section} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Day of Week*</label>
                  <select required name="day_of_week" value={formData.day_of_week} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded">
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Number*</label>
                  <input required type="text" name="room_number" value={formData.room_number} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time*</label>
                  <input required type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time*</label>
                  <input required type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name*</label>
                  <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded" placeholder="e.g. Data Structures" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Faculty*</label>
                  <select required name="faculty_id" value={formData.faculty_id} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded">
                    <option value="">Select Faculty</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.first_name} {f.last_name} ({f.faculty_id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow-sm border border-slate-200 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-700">No Timetables Found</h3>
          <p className="text-slate-500 mt-1">Click 'Add Entry' to create a timetable for a class.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([classKey, entries]) => (
            <div key={classKey} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800">{classKey}</h3>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Day</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Subject</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Faculty</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Room</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {days.map(day => {
                        const dayEntries = entries.filter(e => e.day_of_week === day).sort((a,b) => a.start_time.localeCompare(b.start_time));
                        if (dayEntries.length === 0) return null;
                        
                        return dayEntries.map((entry, idx) => {
                          const fac = facultyList.find(f => f.id === entry.faculty_id);
                          const facName = fac ? `${fac.first_name} ${fac.last_name}` : 'Unknown';
                          
                          return (
                            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                              {idx === 0 && <td rowSpan={dayEntries.length} className="px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50/50 align-top">{day}</td>}
                              <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{entry.start_time.substring(0,5)} - {entry.end_time.substring(0,5)}</td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-800">{entry.subject}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{facName}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{entry.room_number}</td>
                              <td className="px-4 py-3 text-sm text-right">
                                <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default HodTimetable;
