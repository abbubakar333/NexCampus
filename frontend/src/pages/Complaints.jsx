import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { Plus, X, AlertCircle, Building, Home, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react';

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const { t, formatDate } = useContext(LanguageContext);

  // Tab: 'campus' for General/Campus Complaints, 'hostel' for Hostel Maintenance
  const [activeTab, setActiveTab] = useState(user.role === 'hostel_incharge' ? 'hostel' : 'campus');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // General Form
  const [generalForm, setGeneralForm] = useState({
    title: '',
    category: 'Academic',
    description: ''
  });

  // Hostel Form
  const [hostelForm, setHostelForm] = useState({
    category: 'Electrical',
    room_number: user.profile?.room_number || '',
    priority: 'normal',
    description: ''
  });

  useEffect(() => {
    fetchComplaints();
  }, [activeTab]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      if (activeTab === 'campus') {
        const res = await api.get('/complaints');
        setComplaints(res.data.data || []);
      } else {
        const res = await api.get('/hostel');
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch complaints error:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/complaints', generalForm);
      if (res.data.success) {
        setComplaints([res.data.data, ...complaints]);
        setShowModal(false);
        setGeneralForm({ title: '', category: 'Academic', description: '' });
      }
    } catch (err) {
      alert('Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/hostel', hostelForm);
      if (res.data.success) {
        setComplaints([res.data.data, ...complaints]);
        setShowModal(false);
        setHostelForm({ category: 'Electrical', room_number: user.profile?.room_number || '', priority: 'normal', description: '' });
      }
    } catch (err) {
      alert('Failed to submit hostel complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status, response = null) => {
    try {
      const endpoint = activeTab === 'campus' ? `/complaints/${id}` : `/hostel/${id}/status`;
      const res = await api.put(endpoint, { status, response });
      if (res.data.success) {
        setComplaints(complaints.map(c => c.id === id ? { ...c, status, response: response || c.response } : c));
      }
    } catch (err) {
      alert('Failed to update complaint status.');
    }
  };

  const canManageComplaints = ['admin', 'faculty', 'hod', 'hostel_incharge', 'mess_incharge'].includes(user.role);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Grievance & Issue Redressal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {canManageComplaints 
              ? 'Review and resolve reported campus, academic, and hostel maintenance tickets.' 
              : 'Submit, track, and monitor resolution of institutional and living complaints.'}
          </p>
        </div>
        {user.role === 'student' && (
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Raise New Grievance
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      {user.role !== 'hostel_incharge' && (
        <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-8">
          <button
            onClick={() => setActiveTab('campus')}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'campus'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            Campus & Academic Issues
          </button>
          <button
            onClick={() => setActiveTab('hostel')}
            className={`pb-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'hostel'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            Hostel Maintenance
          </button>
        </div>
      )}

      {/* Modal Dialog for Submitting Complaint */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-500" />
                Submit {activeTab === 'campus' ? 'Campus Grievance' : 'Hostel Maintenance Request'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'campus' ? (
              <form onSubmit={handleGeneralSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Issue Title*</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Projector malfunctioning in Room 302"
                    value={generalForm.title}
                    onChange={e => setGeneralForm({...generalForm, title: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category*</label>
                  <select
                    value={generalForm.category}
                    onChange={e => setGeneralForm({...generalForm, category: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  >
                    <option value="Academic">Academic & Lectures</option>
                    <option value="Facilities">Campus Infrastructure</option>
                    <option value="Mess / Cafeteria">Mess / Cafeteria</option>
                    <option value="Transport">Campus Transport</option>
                    <option value="IT & Network">WiFi & IT Services</option>
                    <option value="Library">Library</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Description*</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Provide detailed description of the issue..."
                    value={generalForm.description}
                    onChange={e => setGeneralForm({...generalForm, description: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Grievance'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleHostelSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category*</label>
                    <select
                      value={hostelForm.category}
                      onChange={e => setHostelForm({...hostelForm, category: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Cleaning">Cleaning & Hygiene</option>
                      <option value="Internet">Internet & LAN</option>
                      <option value="Furniture">Furniture & Carpentry</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Number*</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Block B - 302"
                      value={hostelForm.room_number}
                      onChange={e => setHostelForm({...hostelForm, room_number: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={hostelForm.priority}
                    onChange={e => setHostelForm({...hostelForm, priority: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description*</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Describe the maintenance requirement..."
                    value={hostelForm.description}
                    onChange={e => setHostelForm({...hostelForm, description: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Complaints List Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No complaints recorded</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
            There are currently no tickets under the {activeTab === 'campus' ? 'Campus & Academic' : 'Hostel Maintenance'} section.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map(c => {
            const isHighPriority = c.priority === 'high' || c.priority === 'urgent';
            const statusColor = 
              c.status?.toLowerCase() === 'resolved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
              c.status?.toLowerCase() === 'in_progress' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
              c.status?.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
              'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';

            return (
              <div 
                key={c.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden hover:shadow-md transition"
              >
                <div className={`h-1.5 w-full ${isHighPriority ? 'bg-red-500' : 'bg-primary-500'}`}></div>
                <div className="p-5 flex-1 flex flex-col">
                  {/* Top Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {c.title || c.category}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {c.room_number ? `Room: ${c.room_number}` : `Category: ${c.category || 'General'}`}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusColor}`}>
                      {(c.status || 'submitted').replace('_', ' ')}
                    </span>
                  </div>

                  {/* Student Details for Staff */}
                  {canManageComplaints && c.first_name && (
                    <div className="mb-3 pb-2 border-b border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.first_name} {c.last_name}</span>
                      <span className="font-mono">{c.roll || c.department || ''}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex-1 leading-relaxed whitespace-pre-wrap">
                    {c.description}
                  </p>

                  {/* Admin/Staff Response */}
                  {c.response && (
                    <div className="mt-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl text-xs border-l-4 border-primary-500">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Official Response:</span>
                      <span className="text-slate-600 dark:text-slate-400">{c.response}</span>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {c.created_at ? formatDate(c.created_at) : 'Recent'}
                    </span>

                    {canManageComplaints && c.status?.toLowerCase() !== 'resolved' && (
                      <div className="flex items-center gap-1.5">
                        {c.status?.toLowerCase() !== 'in_progress' && (
                          <button 
                            onClick={() => handleStatusChange(c.id, 'in_progress')} 
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg transition"
                          >
                            In Progress
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const resp = window.prompt("Resolution note (optional):");
                            if (resp !== null) handleStatusChange(c.id, 'resolved', resp);
                          }} 
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg transition"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Complaints;