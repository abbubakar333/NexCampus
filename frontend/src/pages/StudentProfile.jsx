import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { 
  User, Mail, Phone, Calendar, BookOpen, GraduationCap, 
  Building2, Home, ShieldCheck, Copy, Check, Printer, 
  QrCode, Award, Clock, ArrowRight, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentProfile = () => {
  const { user } = useContext(AuthContext);
  const { t, formatDate } = useContext(LanguageContext);
  const [copied, setCopied] = useState(false);

  const profile = user?.profile || {};
  const fullName = `${profile.first_name || 'Student'} ${profile.last_name || ''}`.trim();
  const studentId = profile.student_id || 'STU-0000';
  const rollNumber = profile.roll_number || 'N/A';
  const dept = profile.department || 'Computer Science & Engineering';
  const course = profile.course || 'B.Tech';
  const semester = profile.semester ? `Semester ${profile.semester}` : 'Semester 4';
  const section = profile.section ? `Section ${profile.section}` : 'Section A';
  const hostelStatus = profile.hostel_status || 'day_scholar';
  const hostelBlock = profile.hostel_block || 'Not Assigned';
  const roomNumber = profile.room_number || 'N/A';
  const admissionYear = profile.admission_year || '2023';
  const batch = profile.batch || '2023-2027';
  const dob = profile.dob ? formatDate(profile.dob) : 'August 14, 2004';
  const phone = profile.phone || '+91 98765 43210';
  const email = user?.email || 'student@nexcampus.edu';

  const copyId = () => {
    navigator.clipboard.writeText(studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            {t('profile')} <span className="mx-2">•</span> Digital Identity & Academic Record
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your institutional credentials, enrollment details, and campus living records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={copyId}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? 'Copied ID' : 'Copy Student ID'}
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print ID Card
          </button>
        </div>
      </div>

      {/* Grid: ID Card + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Virtual ID Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary-500/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-white shadow-md">
                  N
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white leading-tight">NexCampus</h3>
                  <p className="text-[9px] text-primary-300 font-medium tracking-widest uppercase">Official Student ID</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> ACTIVE
              </span>
            </div>

            {/* Avatar & Student Name */}
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 p-1 shadow-lg ring-4 ring-white/10 mb-4">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-bold text-3xl text-white">
                  {fullName.charAt(0)}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">{fullName}</h2>
              <p className="text-xs text-primary-300 font-mono mt-0.5 tracking-wider">{studentId}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium">
                <Award className="w-3.5 h-3.5 text-amber-400" /> {course} • {dept}
              </div>
            </div>

            {/* Key Data Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs bg-white/5 rounded-xl p-3 border border-white/5">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Roll Number</p>
                <p className="font-semibold text-white mt-0.5">{rollNumber}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Semester / Sec</p>
                <p className="font-semibold text-white mt-0.5">{semester} • {section}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Batch Year</p>
                <p className="font-semibold text-white mt-0.5">{batch}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Valid Thru</p>
                <p className="font-semibold text-white mt-0.5">June 2027</p>
              </div>
            </div>

            {/* Barcode & Hologram Simulation */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-10 h-10 text-white/80 p-1 bg-white/10 rounded-lg" />
                <div className="text-[9px] text-slate-400 font-mono leading-tight">
                  <p>DIGITAL VERIFIED</p>
                  <p>CAMPUS PASS 2026</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-primary-400 tracking-wider">SECURE CHIP</span>
                <p className="text-[8px] text-slate-500">ISO/IEC 7810</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic & Living Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary-600" /> Academic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Degree Program</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{course}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Undergraduate 4-Year</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Department</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{dept}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Faculty of Technology</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Current Class</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{semester} ({section})</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Regular Batch</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Admission Year</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{admissionYear}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Direct Merit Admission</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Academic Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Check className="w-3 h-3" /> Good Standing
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Eligible for Placements</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Campus Mentor</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Faculty Advisor</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Department Head Office</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary-600" /> Personal & Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Campus Email</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Primary Mobile</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date of Birth</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{dob}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hostel / Accommodation Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" /> Campus Residence & Accommodation
              </h2>
              <Link 
                to="/student/hostel" 
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                View Hostel Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase">Residency Type</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize mt-1">
                  {hostelStatus === 'hosteller' ? 'Hostel Resident' : 'Day Scholar'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {hostelStatus === 'hosteller' ? 'On-campus boarding student' : 'Daily commuter student'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase">Assigned Block</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {hostelBlock}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {hostelStatus === 'hosteller' ? 'Warden: Chief Hostel Incharge' : 'N/A for day scholars'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 font-semibold uppercase">Room Number</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {roomNumber}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {hostelStatus === 'hosteller' ? 'Standard Double Occupancy' : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
