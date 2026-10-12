import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Building2, Home, BedDouble, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentHostel = () => {
  const { user } = useContext(AuthContext);
  const profile = user.profile || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Hostel Details</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">View your room allocation and manage complaints.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm border border-slate-100 rounded-xl">
            <h2 className="text-sm font-bold text-slate-800 flex items-center mb-4"><Building2 className="w-4 h-4 mr-2 text-primary-600"/> Hostel Block</h2>
            <p className="text-3xl font-bold text-slate-900">{profile.hostel_block || 'Unassigned'}</p>
        </div>
        <div className="premium-card bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm border border-slate-100 rounded-xl">
            <h2 className="text-sm font-bold text-slate-800 flex items-center mb-4"><BedDouble className="w-4 h-4 mr-2 text-blue-600"/> Room Number</h2>
            <p className="text-3xl font-bold text-slate-900">{profile.room_number || 'Unassigned'}</p>
        </div>
        <div className="premium-card bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm border border-slate-100 rounded-xl">
            <h2 className="text-sm font-bold text-slate-800 flex items-center mb-4"><Home className="w-4 h-4 mr-2 text-emerald-600"/> Status</h2>
            <p className="text-3xl font-bold text-slate-900 capitalize">{profile.hostel_status || 'Day Scholar'}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                  <h2 className="text-lg font-bold text-slate-800">Hostel Complaints</h2>
                  <p className="text-sm text-slate-500">Having issues in your room? Raise a complaint.</p>
              </div>
              <Link to="/student/complaints" className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm flex items-center shadow-sm transition-colors">
                  <AlertCircle className="w-4 h-4 mr-2" /> View / Submit Complaints
              </Link>
          </div>
      </div>
    </div>
  );
};

export default StudentHostel;
