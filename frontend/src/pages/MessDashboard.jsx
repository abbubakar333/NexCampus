import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, Utensils, AlertCircle, MessageSquare } from 'lucide-react';

const MessDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/mess/stats');
        setStats(res.data.data);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Failed to load mess data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="flex justify-center py-20 text-red-500 font-bold">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Campus Dining</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mess Operations Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Overview of today's dining usage and complaints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3"><Users className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_students}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Mess Subs</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3"><Utensils className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.lunch_today}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Lunch Count Today</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3"><Utensils className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.dinner_today}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Dinner Count Today</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-3"><AlertCircle className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.complaints_pending}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Pending Complaints</p>
        </div>
      </div>
      
      <div className="premium-card">
         <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
         <div className="flex gap-4">
             <button onClick={() => window.location.href = '/mess/menu'} className="premium-button">Manage Daily Menu</button>
             <button onClick={() => window.location.href = '/mess/complaints'} className="premium-button bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">View Complaints</button>
         </div>
      </div>
    </div>
  );
};
export default MessDashboard;
