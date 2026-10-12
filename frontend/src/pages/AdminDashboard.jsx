import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Users, FileText, Bell, AlertCircle, MapPin, CheckCircle, GraduationCap, Building2, Coffee, CreditCard, Activity, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t, formatCurrency } = useContext(LanguageContext);
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, faculty, gatePasses, leaves, complaints, notices, fees, payments] = await Promise.all([
          api.get('/students'),
          api.get('/faculty'),
          api.get('/gate-passes'),
          api.get('/leaves'),
          api.get('/general-complaints'),
          api.get('/notices'),
          api.get('/fees/stats'),
          api.get('/fees/payments')
        ]);
        
        const feeStats = fees.data.data;
        const recentPayments = payments.data.data.slice(0, 5);

        setStats({
          students: students.data.data.length,
          faculty: faculty.data.data.filter(f => !f.designation?.includes('Incharge') && !f.designation?.includes('Head')).length,
          hods: faculty.data.data.filter(f => f.designation === 'Head of Department').length,
          pendingGatePasses: gatePasses.data.data.filter(l => l.status === 'pending').length,
          pendingLeaves: leaves.data.data.filter(l => l.status === 'pending').length,
          pendingComplaints: complaints.data.data ? complaints.data.data.filter(l => l.status === 'Submitted' || l.status === 'In Progress').length : 0,
          resolvedComplaints: complaints.data.data ? complaints.data.data.filter(l => l.status === 'Resolved').length : 0,
          notices: notices.data.data.length,
          totalFees: feeStats.total_fees,
          paidFees: feeStats.paid_fees,
          pendingFees: feeStats.total_fees - feeStats.paid_fees,
          collectionRate: feeStats.total_fees > 0 ? Math.round((feeStats.paid_fees / feeStats.total_fees) * 100) : 0,
          totalStudents: feeStats.total_students,
          todayPayments: feeStats.today_payments,
          recentPayments: recentPayments
        });
      } catch (e) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Administration</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('systemOverview')}</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, {user.profile?.first_name} {user.profile?.last_name} — {user.profile?.designation}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="premium-card flex flex-col justify-center text-center group cursor-pointer hover:border-blue-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors"><GraduationCap className="w-6 h-6"/></div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.students}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{t('totalStudents')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center text-center group cursor-pointer hover:border-emerald-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Users className="w-6 h-6"/></div>
            <div className="flex items-end justify-center gap-2">
                <h3 className="text-3xl font-bold text-slate-800">{stats.faculty}</h3>
                <span className="text-sm font-semibold text-emerald-600 mb-1">+{stats.hods} HODs</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{t('totalFaculty')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center text-center group cursor-pointer hover:border-amber-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Activity className="w-6 h-6"/></div>
            <h3 className="text-3xl font-bold text-slate-800">{stats.pendingGatePasses + stats.pendingLeaves}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{t('pendingRequests')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center text-center group cursor-pointer hover:border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors"><AlertCircle className="w-6 h-6"/></div>
            <div className="flex items-end justify-center gap-2">
                <h3 className="text-3xl font-bold text-slate-800">{stats.pendingComplaints}</h3>
                <span className="text-sm font-semibold text-emerald-600 mb-1">{stats.resolvedComplaints} done</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{t('activeComplaints')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Financial Analytics */}
        <div className="premium-card">
          <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Financial Overview</p>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary-500" /> Fee Collection
                </h2>
            </div>
            <span className="text-2xl font-bold text-emerald-600">{stats.collectionRate}%</span>
          </div>

          <div className="space-y-6">
            <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-600">Total Billed</span>
                    <span className="text-slate-800">₹{(stats.totalFees / 1000000).toFixed(2)}M</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 w-full rounded-full"></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-emerald-600">Total Collected</span>
                    <span className="text-slate-800">₹{(stats.paidFees / 1000000).toFixed(2)}M</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.collectionRate}%` }}></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-amber-500">Pending Dues</span>
                    <span className="text-slate-800">₹{(stats.pendingFees / 1000000).toFixed(2)}M</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${100 - stats.collectionRate}%` }}></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div>
                   <p className="text-xs text-slate-500 font-bold uppercase">{t('totalStudents')}</p>
                   <p className="text-lg font-bold text-slate-800">{stats.totalStudents}</p>
                </div>
                <div>
                   <p className="text-xs text-slate-500 font-bold uppercase">{t('todaysPayments')}</p>
                   <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.todayPayments)}</p>
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase mb-3">{t('recentTransactions')}</p>
                <div className="space-y-3">
                  {stats.recentPayments.map(pay => (
                     <div key={pay.id} className="flex justify-between items-center">
                        <div>
                           <p className="text-sm font-bold text-slate-800">{pay.first_name} {pay.last_name}</p>
                           <p className="text-xs text-slate-500">{pay.method} • {new Date(pay.payment_date).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(pay.amount)}</p>
                     </div>
                  ))}
                  {stats.recentPayments.length === 0 && <p className="text-sm text-slate-500">No recent transactions.</p>}
                </div>
                <Link to="/admin/payments" className="block mt-4 text-center text-sm font-bold text-primary-600 hover:underline">View All Payments</Link>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="premium-card bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shortcuts</p>
                <h2 className="text-xl font-bold text-white mb-6">Administrative Actions</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/admin/students" className="flex items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors font-medium">
                        <Plus className="w-4 h-4" /> Add Student
                    </Link>
                    <Link to="/admin/faculty" className="flex items-center justify-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors font-medium">
                        <Plus className="w-4 h-4" /> Add Faculty
                    </Link>
                    <Link to="/admin/notices" className="flex items-center justify-center gap-2 p-4 bg-primary-600 hover:bg-primary-500 border border-primary-500 rounded-xl transition-colors font-medium col-span-2">
                        <Bell className="w-4 h-4" /> Publish Campus Notice
                    </Link>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;