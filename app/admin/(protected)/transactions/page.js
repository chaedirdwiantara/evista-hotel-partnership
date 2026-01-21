'use client';
import { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const TRANSACTIONS_DATA = [
  { id: '#TRX-89012', guest: 'Sarah Jenkins', service: 'Luxury Rental (12 Hours)', date: 'Jan 15, 2026', amount: 2500000, commissionRate: 25, status: 'Completed', statusColor: 'emerald', bookingNumber: 15 },
  { id: '#TRX-89011', guest: 'Michael Chang', service: 'Airport Transfer (Drop-off)', date: 'Jan 14, 2026', amount: 850000, commissionRate: 25, status: 'On Trip', statusColor: 'blue', bookingNumber: 14 },
  { id: '#TRX-89010', guest: 'Amanda Low', service: 'Airport Transfer (Pick-up)', date: 'Jan 14, 2026', amount: 450000, commissionRate: 25, status: 'Completed', statusColor: 'emerald', bookingNumber: 13 },
  { id: '#TRX-89009', guest: 'Robert Fox', service: 'Luxury Rental (24 Hours)', date: 'Jan 12, 2026', amount: 4500000, commissionRate: 25, status: 'Cancelled', statusColor: 'red', bookingNumber: 12 },
  { id: '#TRX-89008', guest: 'Jenny Wilson', service: 'Airport Transfer (Drop-off)', date: 'Jan 11, 2026', amount: 850000, commissionRate: 25, status: 'Completed', statusColor: 'emerald', bookingNumber: 11 },
  { id: '#TRX-89007', guest: 'Guy Hawkins', service: 'Luxury Rental (6 Hours)', date: 'Jan 10, 2026', amount: 1500000, commissionRate: 25, status: 'Completed', statusColor: 'emerald', bookingNumber: 10 },
  { id: '#TRX-89006', guest: 'Courtney Henry', service: 'Airport Transfer (Pick-up)', date: 'Jan 09, 2026', amount: 450000, commissionRate: 20, status: 'Completed', statusColor: 'emerald', bookingNumber: 9 },
];

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <p className="text-slate-500">Manage and view all your hotel's booking history.</p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by Booking ID or Guest Name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Guest Name</th>
                <th className="px-6 py-4 font-semibold">Service</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Comm. Rate</th>
                <th className="px-6 py-4 font-semibold">Commission</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {TRANSACTIONS_DATA.map((trx) => {
                const commission = trx.amount * (trx.commissionRate / 100);
                return (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{trx.id}</td>
                    <td className="px-6 py-4 text-slate-600">{trx.guest}</td>
                    <td className="px-6 py-4 text-slate-600">{trx.service}</td>
                    <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(trx.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${trx.commissionRate === 27 ? 'bg-amber-100 text-amber-800' : 
                          trx.commissionRate === 25 ? 'bg-gray-100 text-gray-800' : 
                          'bg-slate-100 text-slate-800'}`}>
                        {trx.commissionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">{formatCurrency(commission)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${trx.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 
                          trx.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-amber-600 hover:text-amber-700 font-medium text-xs">View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">7</span> of <span className="font-medium text-slate-900">128</span> results</p>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
