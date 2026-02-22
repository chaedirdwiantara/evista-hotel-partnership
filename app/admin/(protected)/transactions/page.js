'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Search, Download, ChevronLeft, ChevronRight,
  Loader2, X, Info, TrendingUp,
} from 'lucide-react';
import { EvistaAPI } from '@/lib/evista-api';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// Service badge
const ServiceBadge = ({ type }) => {
  const map = {
    single_trip: { label: 'Single Trip', cls: 'bg-blue-100 text-blue-700' },
    round_trip:  { label: 'Round Trip',  cls: 'bg-purple-100 text-purple-700' },
    rental:      { label: 'Rental',      cls: 'bg-orange-100 text-orange-700' },
  };
  const { label, cls } = map[type] ?? { label: type, cls: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
};

// Trip status badge
const TripStatusBadge = ({ status }) => {
  const map = {
    scheduled:          'bg-blue-100 text-blue-700',
    waiting_for_driver: 'bg-purple-100 text-purple-700',
    on_the_way:         'bg-orange-100 text-orange-700',
    on_trip:            'bg-green-100 text-green-700',
    complete:           'bg-slate-100 text-slate-600',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600';
  const label = status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '-';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
};

// Commission tier badge
const CommissionBadge = ({ tier, rate, amount }) => {
  const map = {
    Bronze: { emoji: '🥉', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
    Silver: { emoji: '🥈', cls: 'text-slate-600 bg-slate-100 border-slate-200' },
    Gold:   { emoji: '🥇', cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  };
  const { emoji, cls } = map[tier] ?? { emoji: '', cls: 'text-slate-600 bg-slate-100 border-slate-200' };
  return (
    <div>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
        {emoji} {rate}%
      </span>
      <div className="text-xs text-emerald-700 font-semibold mt-0.5">{fmt(amount)}</div>
    </div>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const DetailModal = ({ trx, onClose }) => {
  if (!trx) return null;
  const rows = [
    ['Booking ID',    `#${trx.booking_id}`],
    ['No. Urut Bulan',`#${trx.seq}`],
    ['Tamu',          trx.guest_name],
    ['Layanan',       <ServiceBadge type={trx.service_type} />],
    ['Tipe Kendaraan',trx.car_type],
    ['Pickup',        trx.pickup_at],
    ['Return',        trx.return_at],
    ['Tanggal Bayar', trx.paid_at],
    ['Trip Status',   <TripStatusBadge status={trx.trip_status} />],
    ['Grand Total',   <span className="font-bold">{fmt(trx.grand_total)}</span>],
    ['Komisi',        <CommissionBadge tier={trx.commission_tier} rate={trx.commission_rate} amount={trx.commission_amount} />],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Detail Transaksi</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{label}</span>
              <span className="text-sm text-slate-800 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Commission Summary Card ──────────────────────────────────────────────────

const CommissionSummary = ({ summary, onDetail }) => {
  if (!summary || summary.total_paid_trx === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-wrap gap-6">
        {/* Commission */}
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">💰 Komisi Hotel</p>
          <p className="text-2xl font-bold text-blue-700">{fmt(summary.total_commission)}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {summary.month} · {summary.total_paid_trx} transaksi
          </p>
        </div>
        {/* Separator */}
        <div className="hidden sm:block w-px bg-slate-100" />
        {/* Revenue */}
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">📊 Total Revenue</p>
          <p className="text-2xl font-bold text-slate-800">{fmt(summary.total_revenue)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Gross dari tamu</p>
        </div>
      </div>
      <button
        onClick={onDetail}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        <TrendingUp size={16} />
        Breakdown Tier
      </button>
    </div>
  );
};

// ─── Tier Breakdown Modal ─────────────────────────────────────────────────────

const TierBreakdownModal = ({ summary, onClose }) => {
  if (!summary) return null;
  const tiers = [
    { key: 'bronze', emoji: '🥉', label: 'Bronze', cls: 'text-amber-700' },
    { key: 'silver', emoji: '🥈', label: 'Silver',  cls: 'text-slate-500' },
    { key: 'gold',   emoji: '🥇', label: 'Gold',    cls: 'text-yellow-600' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">Breakdown Komisi</h2>
            <p className="text-xs text-slate-400">{summary.month}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-1">Skema Tiering</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Trx #1–10 → <strong>20%</strong> (Bronze) · Trx #11–20 → <strong>25%</strong> (Silver) · Trx #21+ → <strong>27%</strong> (Gold). Urutan dihitung berdasarkan tanggal pembayaran (flip_paid_at) dalam satu bulan kalender.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Tier', 'Trx', 'Rate', 'Komisi Hotel'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold text-slate-500 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tiers.map(({ key, emoji, label, cls }) => {
                  const b = summary.breakdown[key];
                  if (!b || b.count === 0) return null;
                  return (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className={`font-bold ${cls}`}>{emoji} {label}</span>
                        <div className="text-xs text-slate-400">{b.trx_range}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{b.count} trx</td>
                      <td className="px-4 py-3 font-semibold">{b.rate}%</td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">{fmt(b.commission)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td className="px-4 py-3 text-slate-700" colSpan={3}>Total</td>
                  <td className="px-4 py-3 text-emerald-700">{fmt(summary.total_commission)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-slate-400">* Hanya transaksi <em>paid</em> yang dihitung. Urutan reset setiap awal bulan kalender.</p>
        </div>
        <div className="px-6 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [month, setMonth]               = useState(currentMonth());
  const [perPage, setPerPage]           = useState(20);
  const [page, setPage]                 = useState(1);
  const [searchTerm, setSearchTerm]     = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [pagination, setPagination]     = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedTrx, setSelectedTrx]   = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const hotelSlug = typeof window !== 'undefined' ? localStorage.getItem('hotel_slug') : null;

  const fetchTransactions = useCallback(async () => {
    if (!hotelSlug) {
      window.location.href = '/admin/login';
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await EvistaAPI.hotel.getTransactions(hotelSlug, {
        month,
        page,
        perPage,
      });
      if (response.success) {
        setTransactions(response.data.transactions ?? []);
        setSummary(response.data.commission_summary ?? null);
        setPagination({
          total:        response.data.total_bookings,
          current_page: response.data.current_page,
          last_page:    response.data.last_page,
        });
      } else {
        setError(response.message || 'Gagal memuat data transaksi');
      }
    } catch (err) {
      console.error('Transactions fetch error:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [hotelSlug, month, page, perPage]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // Reset to page 1 when filters change
  const handleMonthChange = (v)   => { setPage(1); setMonth(v); };
  const handlePerPageChange = (v) => { setPage(1); setPerPage(Number(v)); };

  // Client-side search filter
  const filtered = transactions.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.booking_id?.toLowerCase().includes(q) ||
      t.guest_name?.toLowerCase().includes(q)
    );
  });

  // Export CSV
  const exportCSV = () => {
    const cols = [
      'No', 'Booking ID', 'Tamu', 'Layanan', 'Tipe Kendaraan',
      'Pickup At', 'Return At', 'Tanggal Bayar', 'Trip Status',
      'Grand Total', 'Tier Komisi', 'Rate Komisi (%)', 'Jumlah Komisi',
    ];
    const rows = filtered.map((t) => [
      t.seq,
      t.booking_id,
      t.guest_name,
      t.service_type,
      t.car_type,
      t.pickup_at,
      t.return_at,
      t.paid_at,
      t.trip_status,
      t.grand_total,
      t.commission_tier,
      t.commission_rate,
      t.commission_amount,
    ]);
    const csv = [cols, ...rows].map((r) => r.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const monthLabel = month.replace('-', '-');
    a.href     = url;
    a.download = `transaksi-hotel-${monthLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Memuat transaksi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 px-6 py-5 rounded-2xl border border-red-100 text-center max-w-sm">
          <Info size={24} className="mx-auto mb-2 text-red-400" />
          <p className="font-semibold">Gagal memuat data</p>
          <p className="text-sm mt-1 text-red-400">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-4 text-xs bg-white border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Riwayat transaksi hotel yang sudah lunas (paid), diurutkan berdasarkan tanggal pembayaran.
        </p>
      </div>

      {/* Commission Summary Card */}
      <CommissionSummary summary={summary} onDetail={() => setShowBreakdown(true)} />

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari Booking ID atau nama tamu..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Month picker */}
        <label className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          Bulan:
          <input
            type="month"
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </label>

        {/* Per-page */}
        <label className="flex items-center gap-2 text-sm text-slate-500 font-medium ml-auto">
          Tampilkan:
          <select
            value={perPage}
            onChange={(e) => handlePerPageChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / halaman</option>)}
          </select>
        </label>

        {/* Export */}
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-semibold"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">#</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Booking ID</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Tamu</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Layanan</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Kendaraan</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Pickup</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Trip Status</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Grand Total</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Komisi</th>
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? (
                filtered.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">#{trx.seq}</td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800 text-xs whitespace-nowrap">
                      #{trx.booking_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{trx.guest_name}</td>
                    <td className="px-4 py-3">
                      <ServiceBadge type={trx.service_type} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{trx.car_type}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{trx.pickup_at}</td>
                    <td className="px-4 py-3">
                      <TripStatusBadge status={trx.trip_status} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {fmt(trx.grand_total)}
                    </td>
                    <td className="px-4 py-3">
                      <CommissionBadge
                        tier={trx.commission_tier}
                        rate={trx.commission_rate}
                        amount={trx.commission_amount}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedTrx(trx)}
                        className="text-amber-600 hover:text-amber-700 font-semibold text-xs whitespace-nowrap transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Info size={28} className="text-slate-300" />
                      <p className="font-medium">Tidak ada transaksi ditemukan</p>
                      <p className="text-xs">Coba ubah filter bulan atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Menampilkan <span className="text-slate-700 font-semibold">{filtered.length}</span> dari{' '}
            <span className="text-slate-700 font-semibold">{pagination.total}</span> transaksi
            {' '}(Halaman <span className="text-slate-700 font-semibold">{pagination.current_page}</span> dari{' '}
            <span className="text-slate-700 font-semibold">{pagination.last_page}</span>)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-500 font-medium px-2">
              {page} / {pagination.last_page}
            </span>
            <button
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DetailModal trx={selectedTrx} onClose={() => setSelectedTrx(null)} />
      {showBreakdown && (
        <TierBreakdownModal summary={summary} onClose={() => setShowBreakdown(false)} />
      )}
    </div>
  );
}
