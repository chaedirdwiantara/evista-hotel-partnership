'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Wallet, UserCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Transactions',
      href: '/admin/transactions',
      icon: Receipt,
    },
    {
      label: 'Payouts',
      href: '/admin/payouts',
      icon: Wallet,
    },
    // {
    //   label: 'Profile',
    //   href: '/admin/profile',
    //   icon: UserCircle,
    // },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Evista <span className="text-amber-400">Partner</span>
        </h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg text-sm font-medium transition-colors"
          onClick={() => console.log('Logout')}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
