import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, ShieldAlert, LogOut, FileCheck } from 'lucide-react';

const GateDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/gate-passes/stats');
        setStats(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campus Security</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Gate Operations</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Overview of today's gate passes and student movements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3"><FileCheck className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.today_requests}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Today's Requests</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3"><ShieldAlert className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pending_requests}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Pending Approval</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3"><LogOut className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.students_outside}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Students Outside</p>
        </div>
      </div>
    </div>
  );
};
export default GateDashboard;
