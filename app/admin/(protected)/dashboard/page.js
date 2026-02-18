'use client';
import { useState, useEffect } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import TierProgress from '@/components/admin/TierProgress';
import { Calendar, Percent, Wallet, TrendingUp, Loader2 } from 'lucide-react';
import { EvistaAPI } from '@/lib/evista-api';
// Default config for fallback
// Config loaded from session

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    currentBookings: 0,
    totalRevenue: 0,
    pendingPayout: 0,
    transactions: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to get hotel slug from local storage (set during login)
        const hotelSlug = localStorage.getItem('hotel_slug');
        
        if (!hotelSlug) {
            // If no slug found, redirect to login
            window.location.href = '/admin/login';
            return;
        }

        const response = await EvistaAPI.hotel.getTransactions(hotelSlug);
        
        if (response.success && response.data) {
            const transactions = response.data.transactions || [];
            const currentBookings = response.data.total_bookings || 0;
            
            // Calculate total revenue from transactions (in a real app this might come from API)
            const totalRevenue = transactions.reduce((sum, trx) => sum + (parseFloat(trx.amount) || 0), 0);
            
            // Estimate pending payout (mock calculation for now as API doesn't return it yet)
            const pendingPayout = totalRevenue * 0.7; // Assuming 70% share

            setStats({
                currentBookings,
                totalRevenue,
                pendingPayout,
                transactions,
                loading: false,
                error: null
            });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setStats(prev => ({
            ...prev,
            loading: false,
            error: "Failed to load dashboard data"
        }));
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate commission derived from bookings
  const currentTierRate = stats.currentBookings >= 20 ? 27 : stats.currentBookings >= 10 ? 25 : 20;
  const estimatedCommission = stats.totalRevenue * (currentTierRate / 100);

  if (stats.loading) {
      return (
          <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Welcome back, here's your commission overview.</p>
      </div>

      {/* Commission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Bookings"
          value={stats.currentBookings.toString()}
          subtext="active transactions"
          trend="up"
        //   trendValue="+5"
          icon={Calendar}
        />
        <StatsCard
          title="Commission Rate"
          value={`${currentTierRate}%`}
          subtext={stats.currentBookings >= 10 ? 'Silver Tier Active' : 'Base Rate'}
          trend={stats.currentBookings >= 10 ? "up" : null}
          trendValue={stats.currentBookings >= 10 ? '+5%' : null}
          icon={Percent}
        />
        <StatsCard
          title="Est. Commission"
          value={`Rp ${(estimatedCommission / 1000000).toFixed(1)}M`}
          subtext="accumulated revenue"
          trend="up"
        //   trendValue="+8.2%"
          icon={TrendingUp}
        />
        <StatsCard
          title="Est. Payout"
          value={`Rp ${(stats.pendingPayout / 1000000).toFixed(1)}M`}
          subtext="estimated earnings"
          icon={Wallet}
        />
      </div>

      {/* Tier Progress */}
      <TierProgress currentBookings={stats.currentBookings} />

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</button>
        </div>
        <div className="p-6">
            <div className="relative overflow-x-auto">
                {stats.transactions.length > 0 ? (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Booking ID</th>
                                <th scope="col" className="px-6 py-3">Guest Name</th>
                                <th scope="col" className="px-6 py-3">Service</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.transactions.map((trx) => (
                                <tr key={trx.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        #{trx.booking_id}
                                    </th>
                                    <td className="px-6 py-4">{trx.guest_name}</td>
                                    <td className="px-6 py-4">{trx.service}</td>
                                    <td className="px-6 py-4">{trx.date}</td>
                                    <td className="px-6 py-4">Rp {parseFloat(trx.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-full ${
                                            trx.status === 'completed' || trx.status === 'complete' ? 'bg-emerald-100 text-emerald-800' :
                                            trx.status === 'canceled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-8 text-slate-500">
                        No transactions found.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
