import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';

const AccountDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t, formatCurrency } = useContext(LanguageContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/fees/stats');
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

  const pending = stats.total_fees - stats.paid_fees;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Financial Administration</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('systemOverview')}</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Manage student fees and college expenditure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3"><PieChart className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold text-slate-800">{stats.total_students}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('totalStudents')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center mb-3"><TrendingUp className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(stats.total_fees)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('totalAssessed')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3"><TrendingUp className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(stats.paid_fees)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('paymentsReceived')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3"><DollarSign className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(pending)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('outstandingDues')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center border-emerald-200 bg-emerald-50/20">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3"><CreditCard className="w-6 h-6"/></div>
            <h3 className="text-xl font-bold text-slate-800">{formatCurrency(stats.today_payments)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('todaysPayments')}</p>
        </div>
      </div>
    </div>
  );
};
export default AccountDashboard;
