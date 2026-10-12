import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, MapPin } from 'lucide-react';

const GatePasses = () => {
  const { user } = useContext(AuthContext);
  const [gatePasses, setGatePasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    destination: '',
    reason: '',
    is_emergency: false
  });

  useEffect(() => {
    fetchGatePasses();
  }, []);

  const fetchGatePasses = async () => {
    try {
      const res = await api.get('/gate-passes');
      setGatePasses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/gate-passes', formData);
      if (res.data.success) {
        setGatePasses([res.data.data, ...gatePasses]);
        setShowForm(false);
        setFormData({ ...formData, destination: '', reason: '', is_emergency: false });
      }
    } catch (err) {
      alert('Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/gate-passes/${id}/status`, { status });
      if (res.data.success) {
        setGatePasses(gatePasses.map(g => g.id === id ? { ...g, status } : g));
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const res = await api.put(`/gate-passes/${id}/checkout`);
      if (res.data.success) {
        setGatePasses(gatePasses.map(g => g.id === id ? { ...g, checked_out_at: res.data.data.checked_out_at } : g));
      }
    } catch (err) {
      alert('Failed to record check out.');
    }
  };

  const handleCheckIn = async (id) => {
    try {
      const res = await api.put(`/gate-passes/${id}/checkin`);
      if (res.data.success) {
        setGatePasses(gatePasses.map(g => g.id === id ? { ...g, checked_in_at: res.data.data.checked_in_at, status: 'completed' } : g));
      }
    } catch (err) {
      alert('Failed to record check in.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gate Pass Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{['admin', 'gate_incharge'].includes(user.role) ? 'Manage student exit requests' : 'Request permission to leave campus'}</p>
        </div>
        {user.role === 'student' && (
          <button onClick={() => setShowForm(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium shadow-sm transition">
            <Plus className="w-4 h-4 mr-2" />
            Request Pass
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                New Gate Pass
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date*</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time*</label>
                  <input required type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination*</label>
                <input required type="text" name="destination" value={formData.destination} onChange={handleInputChange} placeholder="e.g. City Hospital" className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason*</label>
                <textarea required name="reason" value={formData.reason} onChange={handleInputChange} rows="3" placeholder="Brief reason for leaving..." className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500"></textarea>
              </div>

              <div className="flex items-center">
                <input type="checkbox" id="emergency" name="is_emergency" checked={formData.is_emergency} onChange={handleInputChange} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                <label htmlFor="emergency" className="ml-2 block text-sm text-slate-700 font-medium">
                  This is an emergency
                </label>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Request'}
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
                {['admin', 'gate_incharge'].includes(user.role) && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {['admin', 'gate_incharge'].includes(user.role) && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {gatePasses.length === 0 ? (
                <tr>
                  <td colSpan={['admin', 'gate_incharge'].includes(user.role) ? 6 : 4} className="px-6 py-8 text-center text-slate-500">
                    No gate passes found.
                  </td>
                </tr>
              ) : (
                gatePasses.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition">
                    {['admin', 'gate_incharge'].includes(user.role) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{g.first_name} {g.last_name}</div>
                        <div className="text-xs text-slate-500">{g.roll}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {new Date(g.date).toLocaleDateString()} <span className="text-slate-500 ml-1">{g.time}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{g.destination}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {g.reason}
                      {g.is_emergency && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">EMERGENCY</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${g.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : g.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                      </span>
                    </td>
                    {['admin', 'gate_incharge'].includes(user.role) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {g.status === 'pending' ? (
                          <div className="flex space-x-2">
                            <button onClick={() => handleStatusChange(g.id, 'approved')} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded">Approve</button>
                            <button onClick={() => handleStatusChange(g.id, 'rejected')} className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded">Reject</button>
                          </div>
                        ) : g.status === 'approved' && !g.checked_out_at ? (
                          <button onClick={() => handleCheckOut(g.id)} className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-2.5 py-1 rounded">
                            Mark Exit
                          </button>
                        ) : g.status === 'approved' && g.checked_out_at && !g.checked_in_at ? (
                          <button onClick={() => handleCheckIn(g.id)} className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-2.5 py-1 rounded">
                            Mark Return
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">Completed</span>
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
export default GatePasses;