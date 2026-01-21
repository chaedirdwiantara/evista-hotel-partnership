'use client';
import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-6">
      <div>
        <h2 className="text-slate-800 font-semibold">Dashboard Overview</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">Ritz Carlton</p>
            <p className="text-xs text-slate-500">Partner Admin</p>
          </div>
          <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
