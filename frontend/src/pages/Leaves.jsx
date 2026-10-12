import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Calendar, Check, XCircle } from 'lucide-react';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    leave_type: 'Sick',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data.data);
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
    try {
      const res = await api.post('/leaves', formData);
      if (res.data.success) {
        setLeaves([res.data.data, ...leaves]);
        setShowForm(false);
        setFormData({ ...formData, reason: '' });
      }
    } catch (err) {
      alert('Failed to apply for leave.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/leaves/${id}/status`, { status });
      if (res.data.success) {
        setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const isStaff = ['admin', 'faculty', 'hod'].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{isStaff ? 'Manage student leave applications' : 'Apply and track your leave status'}</p>
        </div>
        {user.role === 'student' && (
          <button onClick={() => setShowForm(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium shadow-sm transition">
            <Plus className="w-4 h-4 mr-2" />
            Apply Leave
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Apply for Leave
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type*</label>
                <select name="leave_type" value={formData.leave_type} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                  <option value="Sick">Sick Leave</option>
                  <option value="Personal">Personal Leave</option>
                  <option value="Event">Attending Event/Competition</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date*</label>
                  <input required type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date*</label>
                  <input required type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason*</label>
                <textarea required name="reason" value={formData.reason} onChange={handleInputChange} rows="3" placeholder="Explain your reason for leave..." className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500"></textarea>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Apply Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {isStaff && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {isStaff && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 5 : 3} className="px-6 py-8 text-center text-slate-500">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition">
                    {isStaff && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{l.first_name} {l.last_name}</div>
                        <div className="text-xs text-slate-500">{l.roll}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-700 mb-1">{l.leave_type}</div>
                      <div className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded">
                        {new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${l.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                      </span>
                    </td>
                    {isStaff && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {l.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button onClick={() => handleStatusChange(l.id, 'approved')} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 p-1.5 rounded flex items-center" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleStatusChange(l.id, 'rejected')} className="text-red-600 hover:text-red-800 bg-red-50 p-1.5 rounded flex items-center" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">Processed</span>
                        )}
                      </td>
                    )}
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
export default Leaves;