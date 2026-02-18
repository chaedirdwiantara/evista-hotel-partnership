'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { EvistaAPI } from '@/lib/evista-api';
// Config loaded from session

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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Try to get hotel slug from local storage (set during login)
        const hotelSlug = localStorage.getItem('hotel_slug');
        
        if (!hotelSlug) {
            // If no slug found, redirect to login
            window.location.href = '/admin/login';
            return;
        }

        const response = await EvistaAPI.hotel.getTransactions(hotelSlug);
        
        if (response.success) {
          setTransactions(response.data.transactions);
          setPagination({
            total: response.data.total_bookings,
            current_page: response.data.current_page,
            last_page: response.data.last_page
          });
        } else {
          setError(response.message || "Failed to fetch transactions");
        }
      } catch (err) {
        console.error("Transactions fetch error:", err);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(trx => 
    trx.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.guest_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-500">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 text-xs bg-white border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">#{trx.booking_id}</td>
                    <td className="px-6 py-4 text-slate-600">{trx.guest_name}</td>
                    <td className="px-6 py-4 text-slate-600">{trx.service}</td>
                    <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(trx.amount)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {trx.commission_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">{formatCurrency(trx.commission)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${trx.status === 'completed' || trx.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                          trx.status === 'on_trip' ? 'bg-blue-100 text-blue-800' : 
                          trx.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-amber-600 hover:text-amber-700 font-medium text-xs">View Details</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filteredTransactions.length}</span> results 
            (Page <span className="font-medium text-slate-900">{pagination.current_page}</span> of <span className="font-medium text-slate-900">{pagination.last_page}</span>)
          </p>
          <div className="flex gap-2">
            <button 
              disabled={pagination.current_page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-600"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-slate-600"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
