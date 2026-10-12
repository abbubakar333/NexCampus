import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [formData, setFormData] = useState({
    college_name: '',
    academic_year: '',
    allow_leave_requests: true,
    allow_gate_passes: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setFormData({
            college_name: res.data.data.college_name || '',
            academic_year: res.data.data.academic_year || '',
            allow_leave_requests: res.data.data.allow_leave_requests,
            allow_gate_passes: res.data.data.allow_gate_passes
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.put('/settings', formData);
      setMsg({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
        <p className="text-slate-500 mt-2">Manage college profile, academic year, and module preferences.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <SettingsIcon className="w-5 h-5 text-primary-500 mr-2" />
          <h2 className="text-lg font-bold text-slate-800">General Configuration</h2>
        </div>
        
        <form onSubmit={handleSave} className="p-6">
          {msg && (
            <div className={`mb-6 p-4 rounded-lg border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              {msg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">College Identity</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">College Name</label>
                <input 
                  type="text" 
                  value={formData.college_name} 
                  onChange={e => setFormData({...formData, college_name: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Academic Year</label>
                <input 
                  type="text" 
                  value={formData.academic_year} 
                  onChange={e => setFormData({...formData, academic_year: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500 focus:border-primary-500" 
                  placeholder="e.g. 2025-2026"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Module Preferences</h3>
              
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">Leave Requests</p>
                  <p className="text-xs text-slate-500">Allow students to submit new leave requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.allow_leave_requests} onChange={e => setFormData({...formData, allow_leave_requests: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-800">Gate Passes</p>
                  <p className="text-xs text-slate-500">Allow students to apply for gate passes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.allow_gate_passes} onChange={e => setFormData({...formData, allow_gate_passes: e.target.checked})} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={saving || user.role !== 'admin'}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
