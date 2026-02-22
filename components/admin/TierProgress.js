'use client';
import { Trophy, TrendingUp } from 'lucide-react';

const TierProgress = ({ currentBookings = 15, monthlyData = {} }) => {
  const tiers = [
    { name: 'Bronze', min: 0,  max: 10, rate: 20, icon: '🥉' },
    { name: 'Silver', min: 11, max: 20, rate: 25, icon: '🥈' },
    { name: 'Gold',   min: 21, max: Infinity, rate: 27, icon: '🥇' },
  ];

  const getCurrentTier = () => {
    return tiers.find(tier => currentBookings >= tier.min && currentBookings <= tier.max);
  };

  const getNextTier = () => {
    const current = getCurrentTier();
    const currentIndex = tiers.findIndex(t => t.name === current.name);
    return tiers[currentIndex + 1] || null;
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const bookingsToNextTier = nextTier ? nextTier.min - currentBookings : 0;
  const progressPercentage = nextTier 
    ? ((currentBookings - currentTier.min) / (nextTier.min - currentTier.min)) * 100 
    : 100;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Trophy className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Tier Status</h3>
            <p className="text-sm text-slate-500">Commission Level Progress</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentTier.icon}</span>
            <div>
              <p className="text-lg font-bold text-slate-800">{currentTier.name}</p>
              <p className="text-sm text-slate-500">{currentTier.rate}% Commission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">{currentBookings} bookings this month</span>
          {nextTier && (
            <span className="text-amber-600 font-medium">
              {bookingsToNextTier} more to {nextTier.name}
            </span>
          )}
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Tier List */}
      <div className="grid grid-cols-3 gap-3">
        {tiers.map((tier) => {
          const isActive = tier.name === currentTier.name;
          const isPassed = currentBookings > tier.max;
          
          return (
            <div 
              key={tier.name}
              className={`p-3 rounded-lg border-2 transition-all ${
                isActive 
                  ? 'border-amber-500 bg-amber-50' 
                  : isPassed
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{tier.icon}</div>
                <p className={`text-xs font-semibold mb-1 ${
                  isActive ? 'text-amber-700' : isPassed ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  {tier.name}
                </p>
                <p className={`text-lg font-bold ${
                  isActive ? 'text-amber-600' : isPassed ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {tier.rate}%
                </p>
                <p className="text-xs text-slate-500">
                  {tier.max === Infinity ? `Trx #${tier.min}+` : `Trx #${tier.min}–#${tier.max}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {nextTier && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-blue-600" />
            <p className="text-blue-800">
              <span className="font-semibold">Unlock {nextTier.name}:</span> Get {bookingsToNextTier} more booking{bookingsToNextTier > 1 ? 's' : ''} to earn <span className="font-bold">{nextTier.rate}%</span> commission on all future bookings this month!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierProgress;
