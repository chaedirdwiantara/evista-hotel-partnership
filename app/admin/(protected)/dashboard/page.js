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
      // Try to get hotel slug from local storage (set during login)
      const hotelSlug = localStorage.getItem('hotel_slug');
      
      if (!hotelSlug) {
          // If no slug found, redirect to login
          window.location.href = '/admin/login';
          return;
      }

      // No API call for dashboard stats for now as requested
      setStats(prev => ({
          ...prev,
          loading: false
      }));
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
    </div>
  );
}
