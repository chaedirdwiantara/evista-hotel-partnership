import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ title, value, subtext, trend, trendValue, icon: Icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {trend === 'up' ? (
          <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <ArrowUpRight size={14} className="mr-1" />
            {trendValue}
          </span>
        ) : trend === 'down' ? (
           <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <ArrowDownRight size={14} className="mr-1" />
            {trendValue}
          </span>
        ) : null}
        <span className="text-xs text-slate-400">{subtext}</span>
      </div>
    </div>
  );
};

export default StatsCard;
