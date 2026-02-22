'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Download, Clock, CheckCircle, FileText, Loader2, Info, AlertCircle,
} from 'lucide-react';
import { EvistaAPI } from '@/lib/evista-api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

// ─── Invoice Download ────────────────────────────────────────────────────────

function downloadInvoice(payout, hotelName) {
  const statusLabel = payout.status === 'paid' ? 'PAID' : 'PENDING';
  const statusColor = payout.status === 'paid' ? '#2e7d32' : '#e65100';

  const dateRow = payout.status === 'paid' && payout.paid_at
    ? `<tr><td style="padding:6px 0;color:#555;width:160px;">Payment Date</td><td style="padding:6px 0;font-weight:600;">${payout.paid_at}</td></tr>`
    : payout.due_date
      ? `<tr><td style="padding:6px 0;color:#555;width:160px;">Due Date</td><td style="padding:6px 0;font-weight:600;color:#e65100;">${payout.due_date}</td></tr>`
      : '';

  const notesRow = payout.notes
    ? `<tr><td style="padding:6px 0;color:#555;">Notes</td><td style="padding:6px 0;">${payout.notes}</td></tr>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${payout.invoice_number}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1a1a1a;
          background: #fff;
          padding: 40px;
          max-width: 720px;
          margin: 0 auto;
        }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
        .brand { font-size: 22px; font-weight: 800; color: #1a1a1a; }
        .brand span { color: #f59e0b; }
        .status-badge {
          display: inline-block; padding: 6px 18px; border-radius: 20px;
          font-size: 13px; font-weight: 800; letter-spacing: 1px;
          background: ${payout.status === 'paid' ? '#e8f5e9' : '#fff8e1'};
          color: ${statusColor};
          border: 2px solid ${statusColor};
        }
        h1 { font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 0 0 4px; }
        .subtitle { color: #777; font-size: 14px; margin: 0 0 32px; }
        .divider { border: none; border-top: 2px solid #f0f0f0; margin: 28px 0; }
        .info-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 32px; }
        .amount-box {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0;
        }
        .amount-label { color: #aaa; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .amount-value { color: #f59e0b; font-size: 36px; font-weight: 800; margin: 8px 0 0; }
        .footer { color: #aaa; font-size: 12px; text-align: center; margin-top: 40px; line-height: 1.6; }
        .print-btn {
          display: block; margin: 24px auto 0; padding: 12px 32px;
          background: #1a1a2e; color: #fff; border: none; border-radius: 8px;
          font-size: 14px; font-weight: 700; cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">Evista <span>Partner</span></div>
        <span class="status-badge">${statusLabel}</span>
      </div>

      <h1>Commission Invoice</h1>
      <p class="subtitle">Hotel Partnership Commission Statement</p>

      <hr class="divider">

      <table class="info-table">
        <tr><td style="padding:6px 0;color:#555;width:160px;">Invoice Number</td><td style="padding:6px 0;font-weight:700;font-family:monospace;">${payout.invoice_number}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Hotel</td><td style="padding:6px 0;font-weight:600;">${hotelName}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Period</td><td style="padding:6px 0;font-weight:600;">${payout.period_label}</td></tr>
        ${dateRow}
        ${notesRow}
      </table>

      <div class="amount-box">
        <div class="amount-label">Total Commission Payable</div>
        <div class="amount-value">${fmt(payout.amount)}</div>
      </div>

      <p style="font-size:13px;color:#777;text-align:center;">
        Commission is calculated based on the tiered structure: 20% (Bronze, Trx #1–10),
        25% (Silver, Trx #11–20), 27% (Gold, Trx #21+) — applied monthly per hotel.
      </p>

      <div class="footer">
        Evista Partner · Commission Management System<br>
        This document is generated automatically and serves as an official commission statement.
      </div>

      <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    // Slight delay to ensure styles load before auto-print
    setTimeout(() => win.print(), 400);
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PayoutsPage() {
  const [payouts, setPayouts]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [hotelName, setHotelName] = useState('');

  const hotelSlug =
    typeof window !== 'undefined' ? localStorage.getItem('hotel_slug') : null;

  const fetchPayouts = useCallback(async () => {
    if (!hotelSlug) {
      window.location.href = '/admin/login';
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await EvistaAPI.hotel.getPayouts(hotelSlug);
      if (response.success) {
        setPayouts(response.data.payouts ?? []);
        setSummary({
          totalPaid:     response.data.total_paid,
          totalPending:  response.data.total_pending,
          totalInvoices: response.data.total_invoices,
        });
      } else {
        setError(response.message || 'Gagal memuat data payout');
      }
    } catch (err) {
      console.error('Payouts fetch error:', err);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [hotelSlug]);

  // Load hotel name from localStorage (set during login as part of hotel_data)
  useEffect(() => {
    try {
      const hotelData = JSON.parse(localStorage.getItem('hotel_data') ?? '{}');
      setHotelName(hotelData.name ?? '');
    } catch {
      setHotelName('');
    }
  }, []);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Memuat data payout...</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 text-red-600 px-6 py-5 rounded-2xl border border-red-100 text-center max-w-sm">
          <Info size={24} className="mx-auto mb-2 text-red-400" />
          <p className="font-semibold">Gagal memuat data</p>
          <p className="text-sm mt-1 text-red-400">{error}</p>
          <button
            onClick={fetchPayouts}
            className="mt-4 text-xs bg-white border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  // ── No Data ──────────────────────────────────────────────────────────────
  if (payouts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payouts</h1>
          <p className="text-slate-500">Commission payment history and pending transfers.</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="bg-slate-50 rounded-2xl px-8 py-10 text-center border border-slate-200 max-w-sm">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">Belum ada data payout</p>
            <p className="text-sm text-slate-400 mt-1">
              Payout akan muncul di sini setelah admin Evista memprosesnya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payouts</h1>
        <p className="text-slate-500">Commission payment history and pending transfers.</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Received */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-emerald-600" size={24} />
              <p className="text-sm font-medium text-emerald-700">Total Received</p>
            </div>
            <p className="text-2xl font-bold text-emerald-800">{fmt(summary.totalPaid)}</p>
            <p className="text-xs text-emerald-600 mt-1">All time</p>
          </div>

          {/* Pending Payout */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-amber-600" size={24} />
              <p className="text-sm font-medium text-amber-700">Pending Payout</p>
            </div>
            <p className="text-2xl font-bold text-amber-800">{fmt(summary.totalPending)}</p>
            <p className="text-xs text-amber-600 mt-1">Awaiting transfer</p>
          </div>

          {/* Total Invoices */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-blue-600" size={24} />
              <p className="text-sm font-medium text-blue-700">Total Invoices</p>
            </div>
            <p className="text-2xl font-bold text-blue-800">{summary.totalInvoices}</p>
            <p className="text-xs text-blue-600 mt-1">All time</p>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Payment History</h3>
          <p className="text-sm text-slate-500">All commission payments and invoices</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice #</th>
                <th className="px-6 py-4 font-semibold">Period</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                  {/* Invoice Number */}
                  <td className="px-6 py-4 font-mono font-medium text-slate-800 text-xs whitespace-nowrap">
                    {payout.invoice_number}
                  </td>

                  {/* Period */}
                  <td className="px-6 py-4 text-slate-600">{payout.period_label}</td>

                  {/* Amount */}
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {fmt(payout.amount)}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {payout.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle size={13} />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <Clock size={13} />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {payout.status === 'paid' && payout.paid_at
                      ? payout.paid_at
                      : payout.due_date
                        ? <span className="text-amber-600">Due: {payout.due_date}</span>
                        : '-'}
                  </td>

                  {/* Download */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => downloadInvoice(payout, hotelName)}
                      className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-semibold text-xs transition-colors hover:underline"
                    >
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-blue-900 text-sm mb-1">Payment Information</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              All commission payments are processed within{' '}
              <span className="font-semibold">7 working days</span> after the invoice is issued.
              If you have any questions about a payment, please contact the Evista partnership team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
