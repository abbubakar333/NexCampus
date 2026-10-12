import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { DollarSign, Search, CheckCircle, Clock } from 'lucide-react';

const AccountFees = () => {
  const { user } = useContext(AuthContext);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get('/fees');
        setFees(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handlePay = async (feeId, amount) => {
    try {
      const res = await api.post('/fees/pay', { fee_id: feeId, amount, method: 'Manual Cash' });
      if (res.data.success) {
        setFees(fees.map(f => {
          if (f.id === feeId) {
             const newPaid = parseFloat(f.paid_amount) + parseFloat(amount);
             return { ...f, paid_amount: newPaid, status: newPaid >= f.total_amount ? 'paid' : 'partial' };
          }
          return f;
        }));
      }
    } catch(e) {
      alert('Payment failed');
    }
  };

  const filtered = fees.filter(f => 
    (f.first_name + ' ' + f.last_name).toLowerCase().includes(search.toLowerCase()) || 
    f.student_roll.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Fees Management</h1>
          <p className="text-slate-500 text-sm mt-1">View and record student fee payments</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input type="text" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="premium-input pl-10 w-64" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filtered.map(fee => {
                  const pending = fee.total_amount - fee.paid_amount;
                  return (
                  <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{fee.first_name} {fee.last_name}</div>
                      <div className="text-xs text-slate-500">{fee.student_roll}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{fee.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">₹{fee.total_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{fee.paid_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${fee.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : fee.status === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {fee.status !== 'paid' ? (
                        <button onClick={() => {
                            const amt = window.prompt(`Enter amount to record (Max ₹${pending}):`, pending);
                            if (amt && !isNaN(amt)) handlePay(fee.id, parseFloat(amt));
                        }} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-md flex items-center gap-1 text-xs">
                          <DollarSign className="w-3 h-3" /> Record Payment
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                           <CheckCircle className="w-4 h-4" /> Cleared
                        </span>
                      )}
                    </td>
                  </tr>
              );}))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AccountFees;
