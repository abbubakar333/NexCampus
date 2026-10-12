import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, X, Bell, Calendar, Tag, Users } from 'lucide-react';

const Notices = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Academic',
    priority: 'normal',
    target_audience: 'everyone',
    publish_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data.data);
    } catch (console) {
      console.error(console);
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
      const res = await api.post('/notices', formData);
      if (res.data.success) {
        setNotices([res.data.data, ...notices]);
        setShowForm(false);
        setFormData({ ...formData, title: '', description: '' });
      }
    } catch (err) {
      alert('Failed to publish notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Notices</h1>
          <p className="text-slate-500 text-sm mt-1">Important announcements and updates</p>
        </div>
        {['admin', 'faculty', 'hod'].includes(user.role) && (
          <button onClick={() => setShowForm(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium shadow-sm transition">
            <Plus className="w-4 h-4 mr-2" />
            Create Notice
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary-500" />
                Publish New Notice
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notice Title*</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. End Semester Exam Schedule" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Event">Event</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                  <select name="target_audience" value={formData.target_audience} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500">
                    <option value="everyone">All Students & Faculty</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Publish Date</label>
                  <input type="date" name="publish_date" value={formData.publish_date} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description*</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full p-2.5 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="Enter full notice details here..."></textarea>
              </div>

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50">
                  {loading ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {notices.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 text-center">
          <Bell className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No notices found</h3>
          <p className="mt-1 text-slate-500">There are currently no announcements for your account.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map(n => (
            <div key={n.id} className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden hover:shadow-md transition">
              <div className={`h-1.5 w-full ${n.priority === 'high' ? 'bg-red-500' : n.priority === 'low' ? 'bg-slate-400' : 'bg-primary-500'}`}></div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {n.category || 'General'}
                  </span>
                  <span className="flex items-center text-xs text-slate-500 font-medium">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{n.title}</h3>
                <p className="text-sm text-slate-600 flex-1 whitespace-pre-wrap line-clamp-4">{n.description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Target: <span className="ml-1 capitalize font-medium">{n.target_audience}</span>
                  </div>
                  {n.priority === 'high' && <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">URGENT</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Notices;