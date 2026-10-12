import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { Users, Calendar, Bell, Clock, CalendarCheck, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [timetable, notices, leaves, students] = await Promise.all([
          api.get('/timetable'),
          api.get('/notices'),
          api.get('/leaves'),
          api.get('/students')
        ]);

        // Mock data logic for faculty dashboard items since we don't have assigned students logic per se yet
        setData({
          timetable: timetable.data.data,
          notices: notices.data.data.slice(0, 4),
          pendingLeaves: leaves.data.data.filter(l => l.status === 'pending').length,
          totalStudents: students.data.data.length
        });
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Failed to load dashboard data.");
      }
    };
    fetchDashboard();
  }, [user.id]);

  if (error) return <div className="flex justify-center py-20 text-red-500 font-bold">{error}</div>;
  if (!data) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">{t('welcome')}, Professor {user.profile?.last_name || user.profile?.first_name}!</h1>
        <p className="text-slate-500 mt-2">Here is your faculty dashboard and schedule overview.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="bg-emerald-50 p-3 rounded-full mb-3">
            <CalendarCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.timetable.length}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{t('totalClasses')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="bg-blue-50 p-3 rounded-full mb-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.pendingLeaves}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{t('pendingRequests')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="bg-indigo-50 p-3 rounded-full mb-3">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.totalStudents}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{t('totalStudents')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:shadow-md transition">
          <div className="bg-amber-50 p-3 rounded-full mb-3">
            <Bell className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{data.notices.length}</p>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">New Notices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center text-slate-800">
              <Calendar className="mr-2 h-5 w-5 text-primary-500"/> My Schedule
            </h2>
          </div>
          {data.timetable.length > 0 ? (
            <ul className="space-y-3">
              {data.timetable.slice(0, 4).map((t, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 transition rounded-lg border border-slate-100">
                  <div className="flex items-center">
                    <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100 mr-4">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{t.subject}</p>
                      <p className="text-xs text-slate-500">{t.room_number} • Sem {t.semester}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">
                    {t.start_time.substring(0,5)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">No classes scheduled for today.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center text-slate-800">
              <Bell className="mr-2 h-5 w-5 text-amber-500"/> Recent Notices
            </h2>
            <Link to="/faculty/notices" className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {data.notices.length > 0 ? (
            <ul className="space-y-4">
              {data.notices.map((n, i) => (
                <li key={i} className="p-4 border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 transition rounded-lg group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{n.title}</p>
                    {n.priority === 'high' && <span className="ml-2 text-[10px] uppercase font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Urgent</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{n.description}</p>
                  <p className="text-xs text-slate-400 mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">No recent notices available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default FacultyDashboard;