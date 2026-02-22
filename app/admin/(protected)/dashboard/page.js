'use client';
import { useState, useEffect } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import TierProgress from '@/components/admin/TierProgress';
import { Calendar, Percent, Wallet, Loader2 } from 'lucide-react';
import { EvistaAPI } from '@/lib/evista-api';

const fmt = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function AdminDashboard() {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [summary, setSummary]     = useState(null);   // commission_summary from API
  const [totalPaid, setTotalPaid] = useState(0);      // total paid trx this month
  const [hotelName, setHotelName] = useState('');

  useEffect(() => {
    const hotelSlug = localStorage.getItem('hotel_slug');
    const storedName = (() => {
      try { return JSON.parse(localStorage.getItem('hotel_data') || '{}')?.name || ''; }
      catch { return ''; }
    })();
    setHotelName(storedName);

    if (!hotelSlug) {
      window.location.href = '/admin/login';
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        // Reuse the transactions API — we only need commission_summary + total_bookings
        const res = await EvistaAPI.hotel.getTransactions(hotelSlug, {
          month: currentMonth(),
          page: 1,
          perPage: 10,
        });

        if (res.success) {
          setSummary(res.data.commission_summary ?? null);
          setTotalPaid(res.data.total_bookings ?? 0);
        } else {
          setError(res.message || 'Gagal memuat data');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // Determine current tier rate from total paid trx count this month
  const tierRate =
    totalPaid >= 21 ? 27 :
    totalPaid >= 11 ? 25 : 20;

  const tierLabel =
    totalPaid >= 21 ? 'Gold Tier Aktif' :
    totalPaid >= 11 ? 'Silver Tier Aktif' : 'Bronze (Base Rate)';

  const totalCommission = summary?.total_commission ?? 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 text-center">
          <p className="font-medium">Gagal memuat data</p>
          <p className="text-sm mt-1 text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Selamat datang{hotelName ? `, ${hotelName}` : ''}. Berikut ringkasan komisi bulan ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="Total Transaksi Bulan Ini"
          value={totalPaid.toString()}
          subtext="transaksi paid"
          trend={totalPaid > 0 ? 'up' : null}
          icon={Calendar}
        />
        <StatsCard
          title="Commission Rate"
          value={`${tierRate}%`}
          subtext={tierLabel}
          trend={totalPaid >= 11 ? 'up' : null}
          trendValue={totalPaid >= 11 ? `+${tierRate - 20}%` : null}
          icon={Percent}
        />
        <StatsCard
          title="Total Komisi Bulan Ini"
          value={fmt(totalCommission)}
          subtext="akumulasi dari transaksi paid"
          trend={totalCommission > 0 ? 'up' : null}
          icon={Wallet}
        />
      </div>

      {/* Tier Progress */}
      <TierProgress currentBookings={totalPaid} />
    </div>
  );
}
