import StatsCard from '@/components/admin/StatsCard';
import TierProgress from '@/components/admin/TierProgress';
import { Calendar, Percent, Wallet, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - replace with real API data
  const currentBookings = 15; // This month
  const totalRevenue = 128500000; // Gross revenue from all bookings
  const currentTierRate = currentBookings >= 20 ? 27 : currentBookings >= 10 ? 25 : 20;
  const estimatedCommission = totalRevenue * (currentTierRate / 100);
  const pendingPayout = 45200000; // From last month
  
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
          value={currentBookings.toString()}
          subtext="this month"
          trend="up"
          trendValue="+5"
          icon={Calendar}
        />
        <StatsCard
          title="Commission Rate"
          value={`${currentTierRate}%`}
          subtext={currentBookings >= 10 ? 'Silver Tier Active' : 'Base Rate'}
          trend={currentBookings >= 10 ? "up" : null}
          trendValue={currentBookings >= 10 ? '+5%' : null}
          icon={Percent}
        />
        <StatsCard
          title="Est. Commission"
          value={`Rp ${(estimatedCommission / 1000000).toFixed(1)}M`}
          subtext="this month (accumulated)"
          trend="up"
          trendValue="+8.2%"
          icon={TrendingUp}
        />
        <StatsCard
          title="Pending Payout"
          value={`Rp ${(pendingPayout / 1000000).toFixed(1)}M`}
          subtext="due in 7 working days"
          icon={Wallet}
        />
      </div>

      {/* Tier Progress */}
      <TierProgress currentBookings={currentBookings} />

      {/* Recent Transactions Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</button>
        </div>
        <div className="p-6">
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                Booking ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Guest Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Service
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Amount
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                #TRX-89012
                            </th>
                            <td className="px-6 py-4">
                                Sarah Jenkins
                            </td>
                            <td className="px-6 py-4">
                                Luxury Rental (12 Hours)
                            </td>
                            <td className="px-6 py-4">
                                Jan 15, 2026
                            </td>
                            <td className="px-6 py-4">
                                Rp 2.500.000
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Completed</span>
                            </td>
                        </tr>
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                #TRX-89011
                            </th>
                            <td className="px-6 py-4">
                                Michael Chang
                            </td>
                            <td className="px-6 py-4">
                                Airport Transfer (Drop-off)
                            </td>
                            <td className="px-6 py-4">
                                Jan 14, 2026
                            </td>
                            <td className="px-6 py-4">
                                Rp 850.000
                            </td>
                            <td className="px-6 py-4">
                                 <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">On Trip</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
