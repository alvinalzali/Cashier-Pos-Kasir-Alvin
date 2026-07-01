"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/services/authServices';
import { FiGrid, FiBox, FiShoppingCart, FiFileText, FiLogOut, FiMenu } from 'react-icons/fi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk kontrol buka/tutup sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
    { name: 'Manajemen Produk', path: '/products', icon: <FiBox /> },
    { name: 'Keranjang Kasir', path: '/cart', icon: <FiShoppingCart /> },
    { name: 'Riwayat Transaksi', path: '/history', icon: <FiFileText /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar dengan durasi animasi transisi */}
      <aside 
        className={`bg-white shadow-md flex flex-col border-r border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3 whitespace-nowrap">
          <div className="bg-blue-600 text-white p-2 rounded-lg flex-shrink-0">
            <FiShoppingCart className="text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-blue-600">POS Kasir</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto whitespace-nowrap">
          {menuItems.map((item) => {
            const isActive = pathname?.startsWith(item.path);
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <span className={`text-xl ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 whitespace-nowrap">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header dengan tombol toggle menu */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 border-b border-gray-100 flex-shrink-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              title={isSidebarOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
            >
              <FiMenu className="text-xl" />
            </button>
            <h2 className="text-lg font-semibold text-gray-700 capitalize">
              {pathname?.split('/')[1] || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-700 leading-none">Kasir Aktif</span>
              <span className="text-xs text-green-600 mt-1 font-medium">Online</span>
            </div>
          </div>
        </header>

        <main className="h-[calc(100vh-64px)] overflow-y-auto p-8 w-full block content-start">
          <div className="w-full h-auto min-h-full pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}