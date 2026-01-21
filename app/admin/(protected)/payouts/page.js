'use client';
import { Download, Clock, CheckCircle, FileText } from 'lucide-react';

const PAYOUT_HISTORY = [
  { id: 'PAY-2026-01', month: 'January 2026', amount: 45200000, status: 'Pending', dueDate: '7 Feb 2026', invoiceUrl: '#', statusColor: 'amber' },
  { id: 'PAY-2025-12', month: 'December 2025', amount: 38500000, status: 'Paid', paidDate: '8 Jan 2026', invoiceUrl: '#', statusColor: 'emerald' },
  { id: 'PAY-2025-11', month: 'November 2025', amount: 42100000, status: 'Paid', paidDate: '7 Dec 2025', invoiceUrl: '#', statusColor: 'emerald' },
  { id: 'PAY-2025-10', month: 'October 2025', amount: 35800000, status: 'Paid', paidDate: '8 Nov 2025', invoiceUrl: '#', statusColor: 'emerald' },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function PayoutsPage() {
  const totalPaid = PAYOUT_HISTORY.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = PAYOUT_HISTORY.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payouts</h1>
        <p className="text-slate-500">Commission payment history and pending transfers.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-emerald-600" size={24} />
            <p className="text-sm font-medium text-emerald-700">Total Received</p>
          </div>
          <p className="text-2xl font-bold text-emerald-800">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-emerald-600 mt-1">Last 4 months</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-amber-600" size={24} />
            <p className="text-sm font-medium text-amber-700">Pending Payout</p>
          </div>
          <p className="text-2xl font-bold text-amber-800">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-amber-600 mt-1">Due in 7 working days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="text-blue-600" size={24} />
            <p className="text-sm font-medium text-blue-700">Total Invoices</p>
          </div>
          <p className="text-2xl font-bold text-blue-800">{PAYOUT_HISTORY.length}</p>
          <p className="text-xs text-blue-600 mt-1">All time</p>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Payment History</h3>
          <p className="text-sm text-slate-500">All commission payments and invoices</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Payment ID</th>
                <th className="px-6 py-4 font-semibold">Period</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYOUT_HISTORY.map((payout) => (
                <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{payout.id}</td>
                  <td className="px-6 py-4 text-slate-600">{payout.month}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(payout.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1
                      ${payout.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {payout.statusColor === 'emerald' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {payout.status === 'Paid' ? payout.paidDate : `Due: ${payout.dueDate}`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-xs">
                      <Download size={14} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Info Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <FileText className="text-blue-600 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-blue-900 text-sm mb-1">Payment Information</p>
            <p className="text-xs text-blue-700">
              All commission payments are processed within <span className="font-semibold">7 working days</span> after invoice submission. 
              Please ensure your bank account details are up to date in your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
