import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { BookOpen, Calendar, Bell, Clock, MapPin, AlertCircle, CalendarCheck, ArrowRight, FileText, Activity, CreditCard, GraduationCap, CheckCircle2, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [attendance, timetable, gatePasses, fees] = await Promise.all([
          api.get('/attendance'),
          api.get('/timetable'),
          api.get('/gate-passes'),
          api.get('/fees/my')
        ]);

        const att = attendance.data.data;
        const presents = att.filter(a => a.status === 'present').length;
        const attPercentage = att.length ? Math.round((presents / att.length) * 100) : 100;

        const activeGatePass = gatePasses.data.data.find(g => g.status === 'approved' || g.status === 'completed'); // or just 'approved'

        const myFees = fees.data.fees;
        const totalFees = myFees.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);
        const paidFees = myFees.reduce((acc, curr) => acc + parseFloat(curr.paid_amount), 0);
        const feeStatus = totalFees === paidFees ? 'All Paid' : 'Pending';

        setData({
          attendance: attPercentage,
          timetable: timetable.data.data.slice(0, 4),
          activeGatePass: activeGatePass || null,
          feeStatus: feeStatus,
          pendingRequests: 2 // Mock data for now, could fetch from leaves/complaints
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchDashboard();
  }, []);

  if (!data) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
           {t('student')} Portal <span className="mx-2">•</span> <span className="text-emerald-500 flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> Active Session</span>
        </p>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('welcome')}, {user.profile?.first_name} {user.profile?.last_name} <span className="inline-block hover:animate-bounce cursor-default">👋</span></h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">{user.profile?.course || 'B.Tech'} {user.profile?.department || 'Engineering'} • Academic Year 2024-25</p>
            </div>
            <div className="hidden sm:flex gap-3">
                <Link to="/student/gate-pass" className="premium-button bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2">
                    <QrCode className="w-4 h-4" /> Apply Gate Pass
                </Link>
                <Link to="/student/leaves" className="premium-button flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Submit Leave
                </Link>
                <Link to="/student/complaints" className="premium-button bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-none flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Raise Complaint
                </Link>
            </div>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <div className="premium-card bg-gradient-to-br from-white to-slate-50/50 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-200 to-primary-100 flex flex-col items-center justify-center border-4 border-white shadow-sm relative">
                   <span className="text-2xl font-bold text-primary-700">{user.profile?.first_name?.[0]}</span>
                   <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border-2 border-white">9th</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {user.profile?.first_name} {user.profile?.last_name}
                        <span className="bg-primary-50 text-primary-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-primary-100">Honors Track</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{user.profile?.student_id} • Roll No: {user.profile?.roll_number}</p>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-8 md:gap-12 text-sm">
                <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Department</p>
                    <p className="font-semibold text-slate-800">{user.profile?.department}</p>
                    <p className="text-xs text-slate-500">Section {user.profile?.section || 'A'} • Core Group</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Cumulative GPA</p>
                    <p className="font-bold text-emerald-600 text-base">3.84 <span className="text-xs text-slate-400 font-normal">/ 4.00</span></p>
                    <p className="text-xs text-slate-500">Top 5% Cohort</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Campus Status</p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> On-Campus Resident
                    </p>
                    <p className="text-xs text-slate-500">Newton Hall • Room 412</p>
                </div>
            </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Attendance */}
        <div className="premium-card flex items-center justify-between group cursor-pointer hover:border-primary-200">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{t('attendance')}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-slate-800">{data.attendance}%</h3>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Safe Zone (+75%)
                </p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-emerald-100 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500" style={{clipPath: `polygon(0 0, 100% 0, 100% ${data.attendance}%, 0 ${data.attendance}%)`}}></div>
                <CalendarCheck className="w-5 h-5 text-emerald-600 relative z-10" />
            </div>
        </div>

        {/* Schedule */}
        <div className="premium-card flex items-center justify-between group cursor-pointer hover:border-blue-200">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Today's Schedule</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-slate-800">{data.timetable.length} <span className="text-base text-slate-500 font-medium">Lectures</span></h3>
                </div>
                <p className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Next in 15m
                </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
            </div>
        </div>

        {/* Requests */}
        <div className="premium-card flex items-center justify-between group cursor-pointer hover:border-amber-200">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{t('pendingRequests')}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-slate-800">{data.pendingRequests} <span className="text-base text-slate-500 font-medium">Active</span></h3>
                </div>
                <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">1 Pass</span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">1 Cert</span>
                </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
            </div>
        </div>

        {/* Fee Accounting */}
        <div className="premium-card flex items-center justify-between group cursor-pointer hover:border-emerald-200">
            <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{t('fees')}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-2xl font-bold ${data.feeStatus === 'All Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{data.feeStatus}</h3>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-2">
                    Tracking Fall 2024 cleared on Sept 12
                </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-6 h-6" />
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Daily Schedule - Left (2 cols) */}
        <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-5">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Daily Schedule</p>
                    <h2 className="text-2xl font-bold text-slate-900">Today's Lectures & Labs</h2>
                </div>
                <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} <span className="mx-2">•</span> Day 4 of Week 9</p>
            </div>

            <div className="space-y-4">
                {data.timetable.length > 0 ? (
                    data.timetable.map((t, i) => (
                        <div key={i} className={`premium-card !p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 ${i === 1 ? 'border-primary-200 bg-primary-50/30' : ''}`}>
                            <div className="w-24 shrink-0 text-center sm:text-left">
                                <p className="font-bold text-slate-800">{t.start_time.substring(0,5)} <span className="text-xs text-slate-500 font-normal">AM</span></p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">60 mins</p>
                            </div>
                            
                            <div className="w-1.5 self-stretch bg-slate-100 rounded-full hidden sm:block">
                                <div className={`w-full h-full rounded-full ${i === 1 ? 'bg-primary-500' : (i===0 ? 'bg-emerald-400' : 'bg-transparent')}`}></div>
                            </div>

                            <div className="flex-1">
                                <h4 className={`text-lg font-bold ${i === 1 ? 'text-primary-800' : 'text-slate-800'} flex items-center gap-2`}>
                                    {t.subject} 
                                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{t.department.substring(0,3)}-{100 + i}</span>
                                </h4>
                                <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> {t.room_number} <span className="text-slate-300">•</span> Dr. Faculty Name
                                </p>
                            </div>

                            <div className="shrink-0">
                                {i === 0 ? (
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Attendance Recorded</span>
                                ) : i === 1 ? (
                                    <button className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm">
                                        <DoorOpen className="w-4 h-4"/> Hall Open - Gate 4
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-slate-400">Theory Session</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="premium-card text-center py-10">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No classes scheduled for today. Enjoy your day off!</p>
                    </div>
                )}
            </div>
        </div>

        {/* Gate Pass Widget - Right (1 col) */}
        <div>
            <div className="flex justify-between items-end mb-5">
                <div className="invisible">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gate Pass</p>
                    <h2 className="text-2xl font-bold text-slate-900">Widgets</h2>
                </div>
            </div>

            <div className="premium-card bg-gradient-to-b from-white to-slate-50 border-emerald-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Approved
                    </span>
                </div>
                
                <h3 className="text-sm font-bold flex items-center text-slate-800 mb-6">
                  <QrCode className="mr-2 h-4 w-4 text-emerald-600"/> ACTIVE GATE PASS
                </h3>

                {data.activeGatePass ? (
                    <div className="flex flex-col items-center">
                        <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-4">
                           {/* Placeholder for QR Code */}
                           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GP-${data.activeGatePass.id}-${user.profile?.student_id}`} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6">GP-{data.activeGatePass.id}-WKND</p>
                        
                        <div className="w-full space-y-3 mb-6">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-medium">Exit Schedule</span>
                                <span className="font-bold text-slate-800">{new Date(data.activeGatePass.date).toLocaleDateString()} • {data.activeGatePass.time.substring(0,5)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-medium">Destination</span>
                                <span className="font-bold text-slate-800 truncate max-w-[150px]">{data.activeGatePass.destination}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-medium">Warden Sign</span>
                                <span className="font-bold text-emerald-600">Auto-Validated (Bio)</span>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                            Save to Apple Wallet / Pass
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm font-medium mb-4">No active gate passes.</p>
                        <Link to="/student/gate-pass" className="text-primary-600 text-sm font-bold hover:underline">Apply for a Gate Pass</Link>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Mock DoorOpen icon since it wasn't imported initially
const DoorOpen = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/></svg>
);

export default StudentDashboard;