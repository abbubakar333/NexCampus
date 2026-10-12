import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Award, Plus, X, Check, FileText } from 'lucide-react';

const Certificates = () => {
  const { user } = useContext(AuthContext);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Student form state
  const [formData, setFormData] = useState({
    certificate_type: 'Bonafide Certificate',
    purpose: ''
  });

  // Admin remark state
  const [activeRemarkId, setActiveRemarkId] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      const res = await api.get('/certificates');
      setCerts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/certificates', formData);
      setShowForm(false);
      setFormData({ certificate_type: 'Bonafide Certificate', purpose: '' });
      fetchCerts();
    } catch (err) {
      console.error(err);
      alert('Failed to submit request');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/certificates/${id}/status`, { status, remarks: activeRemarkId === id ? remarkText : undefined });
      setActiveRemarkId(null);
      setRemarkText('');
      fetchCerts();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificate Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{user.role === 'admin' ? 'Manage student certificates' : 'Request academic certificates'}</p>
        </div>
        {user.role === 'student' && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition shadow-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </button>
        )}
      </div>

      {showForm && user.role === 'student' && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary-500" /> Request Certificate
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleRequest} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Certificate Type*</label>
                  <select 
                    required 
                    value={formData.certificate_type}
                    onChange={(e) => setFormData({...formData, certificate_type: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Bonafide Certificate">Bonafide Certificate</option>
                    <option value="Character Certificate">Character Certificate</option>
                    <option value="Study Certificate">Study Certificate</option>
                    <option value="Course Completion Certificate">Course Completion Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purpose*</label>
                  <textarea 
                    required 
                    rows="3"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded"
                    placeholder="e.g. For passport application, higher studies, etc."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {certs.length === 0 ? (
        <div className="premium-card text-center py-20">
          <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No Certificates Found</h2>
          <p className="text-slate-500 mt-2">There are currently no certificate requests pending.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {user.role === 'admin' && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type & Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                {user.role === 'admin' && <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {certs.map(c => (
                <tr key={c.id}>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-slate-500">{c.roll}</p>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary-500"/>{c.certificate_type}</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">{c.purpose}</p>
                    {c.remarks && <p className="text-xs mt-2 p-1.5 bg-amber-50 text-amber-800 rounded border border-amber-100 font-medium">Admin: {c.remarks}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                      c.status === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      {c.status === 'pending' && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(c.id, 'approved')} className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 font-medium">Approve</button>
                            <button onClick={() => updateStatus(c.id, 'rejected')} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 font-medium">Reject</button>
                          </div>
                          {activeRemarkId === c.id ? (
                            <div className="flex items-center gap-2 mt-2 w-full max-w-[200px]">
                              <input type="text" value={remarkText} onChange={e => setRemarkText(e.target.value)} placeholder="Add remarks..." className="text-xs p-1 border rounded flex-1"/>
                              <button onClick={() => setActiveRemarkId(null)} className="text-xs text-slate-500"><X className="w-3 h-3"/></button>
                            </div>
                          ) : (
                            <button onClick={() => setActiveRemarkId(c.id)} className="text-[10px] text-slate-400 underline">Add Remark</button>
                          )}
                        </div>
                      )}
                      {c.status === 'approved' && (
                        <button onClick={() => updateStatus(c.id, 'issued')} className="text-xs px-3 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-200 hover:bg-emerald-100 font-medium flex items-center ml-auto">
                          <Check className="w-3 h-3 mr-1"/> Confirm Issuance
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default Certificates;
