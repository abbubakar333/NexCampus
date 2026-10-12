import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { Search, FileText, CheckCircle, Clock } from 'lucide-react';

const AccountPayments = () => {
  const { user } = useContext(AuthContext);
  const { t, formatCurrency, formatDate } = useContext(LanguageContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/fees/payments');
        setPayments(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter(p => 
    (p.first_name + ' ' + p.last_name).toLowerCase().includes(search.toLowerCase()) || 
    p.student_roll.toLowerCase().includes(search.toLowerCase()) ||
    (p.receipt_number || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('paymentsReceived')}</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor all incoming fee transactions</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input type="text" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="premium-input pl-10 w-72" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('receiptNo')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('student')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('mode')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filtered.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{payment.receipt_number || payment.transaction_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{payment.first_name} {payment.last_name}</div>
                    <div className="text-xs text-slate-500">{payment.student_roll} • {payment.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{payment.fee_category || 'Semester Fee'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(payment.payment_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{payment.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700">
                      <CheckCircle className="w-3 h-3" /> Successful
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500 text-sm">No payment records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountPayments;
