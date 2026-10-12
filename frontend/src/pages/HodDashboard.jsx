import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, CheckSquare, Activity, BookOpen, Calendar } from 'lucide-react';
import api from '../services/api';

const HodDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, facultyRes, timetableRes] = await Promise.all([
          api.get('/students'),
          api.get('/faculty'),
          api.get('/timetable')
        ]);
        
        // Filter timetable for this HOD's department (if API doesn't do it)
        const myDept = user.profile?.department;
        const myTimetable = timetableRes.data.data.filter(t => t.department === myDept);
        
        const uniqueSubjects = new Set(myTimetable.map(t => t.subject)).size;
        const uniqueClasses = new Set(myTimetable.map(t => `${t.semester}-${t.section}`)).size;

        setStats({
          totalStudents: studentsRes.data.data.length,
          totalFaculty: facultyRes.data.data.length,
          totalSubjects: uniqueSubjects,
          publishedTimetables: uniqueClasses
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (error) return <div className="flex justify-center py-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department Head Portal</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Department of {user.profile?.department || 'Engineering'}</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, {user.profile?.first_name} {user.profile?.last_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card flex flex-col justify-center items-center text-center hover:border-primary-200 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3"><Users className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalStudents || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Students</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center hover:border-emerald-200 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3"><BookOpen className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalFaculty || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Faculty</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center hover:border-amber-200 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3"><FileText className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.totalSubjects || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Subjects</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center hover:border-indigo-200 cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3"><Calendar className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{stats?.publishedTimetables || 0}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Classes with Timetable</p>
        </div>
      </div>
    </div>
  );
};
export default HodDashboard;
