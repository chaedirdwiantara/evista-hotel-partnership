import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />
      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
