import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, X, Trash2, Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const ExamManage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    exam_type: 'Mid-Semester Examination',
    department: 'Computer Science & Engineering',
    semester: '1',
    subject: '',
    exam_date: '',
    start_time: '10:00',
    end_time: '12:00',
    duration: '2 Hours',
    room: '',
    instructions: '',
    syllabus: ''
  });

  const fetchExams = async () => {
    try {
      const res = await api.get('/examinations');
      setExams(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/examinations', formData);
      setShowModal(false);
      setFormData({ ...formData, subject: '', room: '', instructions: '', syllabus: '' });
      fetchExams();
    } catch (error) {
      alert('Failed to save examination');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this examination?')) return;
    try {
      await api.delete(`/examinations/${id}`);
      fetchExams();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Examination Management</h1>
          <p className="text-slate-500 text-sm mt-1">Schedule and manage examinations and syllabus.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="premium-button flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Exam
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {exams.length > 0 ? exams.map(exam => (
            <div key={exam.id} className="premium-card !p-0 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="p-6 flex flex-col md:flex-row md:items-center gap-6 flex-1">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-center min-w-[80px]">
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{new Date(exam.exam_date).getDate()}</p>
                        <p className="text-[10px] font-semibold text-indigo-500 mt-1">{exam.start_time.substring(0,5)}</p>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{exam.exam_type}</span>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold">{exam.department} - SEM {exam.semester}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{exam.subject}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {exam.duration}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Room {exam.room}</span>
                        </div>
                        {exam.syllabus && (
                            <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <span className="font-bold flex items-center gap-1 mb-1 text-slate-700 dark:text-slate-300"><BookOpen className="w-3 h-3"/> Syllabus:</span>
                                {exam.syllabus}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-l border-slate-100 dark:border-slate-700 flex justify-center md:h-full items-center">
                    <button onClick={() => handleDelete(exam.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )) : (
            <div className="text-center py-20 premium-card">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Exams Scheduled</h3>
                <p className="text-slate-500">Create an examination to generate the timetable.</p>
            </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> Schedule Examination</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam Type</label>
                  <select required value={formData.exam_type} onChange={e => setFormData({...formData, exam_type: e.target.value})} className="premium-input">
                    <option>Internal Examination</option>
                    <option>Mid-Semester Examination</option>
                    <option>Semester Examination</option>
                    <option>Practical Examination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input required type="date" value={formData.exam_date} onChange={e => setFormData({...formData, exam_date: e.target.value})} className="premium-input" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="premium-input">
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                    <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                    <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                  <select required value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="premium-input">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="premium-input" placeholder="e.g. Java Programming" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                  <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="premium-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                  <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="premium-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room/Hall</label>
                  <input required type="text" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="premium-input" placeholder="e.g. LH-104" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Syllabus / Units Covered (Optional)</label>
                <textarea value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="premium-input h-20" placeholder="e.g. Units 1 to 3: Introduction, OOPs concepts..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions (Optional)</label>
                <input type="text" value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} className="premium-input" placeholder="e.g. Bring your own calculator" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="premium-button">Save Examination</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamManage;
