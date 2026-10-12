import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { DollarSign, CheckCircle2, Clock, FileText, ArrowRight, X, ShieldCheck } from 'lucide-react';

const StudentFees = () => {
  const { user } = useContext(AuthContext);
  const { t, formatCurrency, formatDate } = useContext(LanguageContext);
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(null);

  const fetchMyFees = async () => {
    try {
      const res = await api.get('/fees/my');
      setFees(res.data.fees);
      setPayments(res.data.payments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFees();
  }, []);

  const totalFees = fees.reduce((sum, f) => sum + parseFloat(f.total_amount), 0);
  const paidFees = fees.reduce((sum, f) => sum + parseFloat(f.paid_amount), 0);
  const outstanding = totalFees - paidFees;

  const handleOpenPayment = (fee) => {
    setSelectedFee(fee);
    const pending = parseFloat(fee.total_amount) - parseFloat(fee.paid_amount);
    setPaymentAmount(pending > 0 ? pending : 0);
    setErrorMsg('');
    setSuccessMsg('');
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (parseFloat(paymentAmount) <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }
    const pending = parseFloat(selectedFee.total_amount) - parseFloat(selectedFee.paid_amount);
    if (parseFloat(paymentAmount) > pending) {
      setErrorMsg(`Cannot pay more than outstanding balance (₹${pending.toLocaleString()})`);
      return;
    }

    setProcessing(true);
    
    // Simulate secure processing delay
    setTimeout(async () => {
      try {
        const res = await api.post('/fees/pay', {
          fee_id: selectedFee.id,
          amount: parseFloat(paymentAmount),
          method: paymentMethod
        });
        
        if (res.data.success) {
          setSuccessMsg('Payment Successful!');
          fetchMyFees();
          setTimeout(() => {
            setShowPaymentModal(false);
            setShowReceipt(res.data.payment);
          }, 1500);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Payment failed. Please try again.');
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Financial Portal</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fee Accounting</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Manage and pay your college fees securely.</p>
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3"><FileText className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalFees)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('totalAssessed')}</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3"><CheckCircle2 className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(paidFees)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Amount Paid</p>
        </div>
        <div className="premium-card flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3"><DollarSign className="w-6 h-6"/></div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(outstanding)}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{t('outstandingDues')}</p>
        </div>
      </div>

      {/* Fee Assessments */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
           <h2 className="text-lg font-bold text-slate-800">Current Fee Assessments</h2>
        </div>
        <div className="p-5 grid gap-4">
          {fees.map(fee => {
            const pending = parseFloat(fee.total_amount) - parseFloat(fee.paid_amount);
            return (
            <div key={fee.id} className="flex flex-col sm:flex-row justify-between items-center p-4 border border-slate-200 rounded-lg hover:border-primary-200 transition-colors">
              <div className="mb-4 sm:mb-0">
                <h3 className="font-bold text-slate-800 text-lg">{fee.fee_category || 'Semester Fee'}</h3>
                <p className="text-sm text-slate-500">Due Date: {formatDate(fee.due_date)}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-sm font-medium text-slate-600">Total: {formatCurrency(fee.total_amount)}</span>
                  <span className="text-sm font-medium text-emerald-600">Paid: {formatCurrency(fee.paid_amount)}</span>
                  <span className="text-sm font-bold text-amber-600">Due: {formatCurrency(pending)}</span>
                </div>
              </div>
              <div>
                {pending > 0 ? (
                  <button 
                    onClick={() => handleOpenPayment(fee)}
                    className="premium-button bg-primary-600 hover:bg-primary-700 flex items-center gap-2 px-6"
                  >
                    {t('payFees')} <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Cleared
                  </span>
                )}
              </div>
            </div>
          )})}
          {fees.length === 0 && <p className="text-slate-500 text-center py-4">No fee assessments found.</p>}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
           <h2 className="text-lg font-bold text-slate-800 flex items-center"><Clock className="w-5 h-5 mr-2 text-primary-500"/> Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Receipt No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{pay.receipt_number || pay.transaction_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(pay.payment_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{formatCurrency(pay.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{pay.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center w-max"><CheckCircle2 className="w-3 h-3 mr-1"/> Successful</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setShowReceipt(pay)} className="text-primary-600 hover:text-primary-800 hover:underline">{t('viewReceipt')}</button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No payment history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-emerald-500"/> Secure Checkout</h2>
                <p className="text-sm text-slate-500 mt-1">Review your details before paying</p>
              </div>
              {!processing && (
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full border border-slate-200 shadow-sm transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleProcessPayment} className="p-6">
              {/* Student Details (Read-only) */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold">Student Name</span>
                    <span className="font-bold text-slate-800">{user.profile?.first_name} {user.profile?.last_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold">Student ID</span>
                    <span className="font-bold text-slate-800">{user.profile?.student_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold">Roll Number</span>
                    <span className="font-bold text-slate-800">{user.profile?.roll_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold">Department</span>
                    <span className="font-bold text-slate-800 truncate">{user.profile?.department}</span>
                  </div>
                </div>
              </div>

              {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">{errorMsg}</div>}
              {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm font-medium flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> {successMsg}</div>}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fee Category</label>
                  <input type="text" readOnly value={selectedFee.fee_category || 'Semester Fee'} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium outline-none cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Payment Mode</label>
                    <select required disabled={processing} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-sm font-medium">
                      <option value="UPI">UPI</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Amount to Pay (₹)</label>
                    <input required disabled={processing} type="number" max={parseFloat(selectedFee.total_amount) - parseFloat(selectedFee.paid_amount)} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-sm font-bold text-slate-800" />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button type="submit" disabled={processing} className="w-full py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold text-lg flex items-center justify-center transition-all disabled:opacity-80 shadow-lg shadow-slate-900/20">
                  {processing ? (
                    <span className="flex items-center gap-2">
                       <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                       Processing securely...
                    </span>
                  ) : (
                    `Pay ${formatCurrency(paymentAmount || 0)}`
                  )}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4"/> 256-bit SSL Encrypted Transaction
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10 no-print">
              <h2 className="text-lg font-bold text-slate-800">Payment Receipt</h2>
              <div className="flex gap-3">
                <button onClick={printReceipt} className="px-4 py-2 bg-primary-50 text-primary-700 font-bold rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Download
                </button>
                <button onClick={() => setShowReceipt(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="printable-receipt" className="p-8 bg-white text-slate-800">
              <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-100">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">NexCampus</h1>
                  <p className="text-sm text-slate-500 font-medium mt-1">Official Payment Receipt</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Receipt No: {showReceipt.receipt_number || showReceipt.transaction_id}</p>
                  <p className="text-sm text-slate-500 mt-1">Date: {new Date(showReceipt.payment_date).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Student Information</h3>
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-slate-800">{user.profile?.first_name} {user.profile?.last_name}</p>
                    <p className="text-sm text-slate-600">ID: <span className="font-medium text-slate-800">{user.profile?.student_id}</span></p>
                    <p className="text-sm text-slate-600">Roll No: <span className="font-medium text-slate-800">{user.profile?.roll_number}</span></p>
                    <p className="text-sm text-slate-600">Dept: <span className="font-medium text-slate-800">{user.profile?.department}</span></p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Payment Mode</span>
                      <span className="font-bold text-slate-800">{showReceipt.method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Transaction ID</span>
                      <span className="font-mono text-slate-800">{showReceipt.transaction_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-emerald-600">SUCCESSFUL</span>
                    </div>
                  </div>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 text-left text-sm font-bold text-slate-800">Description</th>
                    <th className="py-3 text-right text-sm font-bold text-slate-800">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-4 text-slate-700 font-medium">Academic Fee Payment</td>
                    <td className="py-4 text-right text-slate-800 font-bold">₹{parseFloat(showReceipt.amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b-2 border-slate-800">
                    <span className="font-bold text-slate-800">Total Paid</span>
                    <span className="font-bold text-2xl text-slate-900">₹{parseFloat(showReceipt.amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 font-medium border-t border-slate-100 pt-6">
                This is a computer-generated receipt and does not require a physical signature.
                <br/>NexCampus Academic Management Platform
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;
