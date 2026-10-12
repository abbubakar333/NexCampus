import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { GraduationCap, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const ExamDashboard = () => {
  const { user } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const endpoint = user.role === 'student' ? '/examinations/upcoming' : '/examinations';
        const res = await api.get(endpoint);
        setExams(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [user.role]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Section</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Examinations & Timetable</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">View your upcoming examination schedule.</p>
      </div>

      <div className="premium-card overflow-hidden !p-0">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-500" /> Scheduled Exams
            </h2>
            <span className="premium-badge bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {exams.length} upcoming
            </span>
        </div>
        
        {exams.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {exams.map(exam => (
                    <div key={exam.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center min-w-[70px]">
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{new Date(exam.exam_date).getDate()}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{exam.subject}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                                        <Clock className="w-3 h-3"/> {exam.start_time.substring(0,5)} - {exam.end_time.substring(0,5)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3"/> {exam.room}
                                    </span>
                                    <span className="uppercase tracking-wider text-indigo-500">
                                        {exam.department.substring(0,3)} • SEM {exam.semester}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {exam.exam_type}
                            </span>
                            <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> {exam.instructions}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No Examinations Scheduled</h3>
                <p className="text-slate-500 text-sm">There are currently no upcoming examinations for your department.</p>
            </div>
        )}
      </div>
    </div>
  );
};
export default ExamDashboard;
