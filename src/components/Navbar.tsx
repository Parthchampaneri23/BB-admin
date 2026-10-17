'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, UserCircle, Bell, Search } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  adminName?: string;
  adminEmail?: string;
}

export default function Navbar({
  onToggleSidebar,
  adminName = 'Super Admin',
  adminEmail = 'admin@businessbullet.com',
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Toggle & Page Title info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-[#0069f7] uppercase tracking-wider">
            BusinessBulletin Administration
          </span>
          <h2 className="text-sm font-bold text-[#01142e]">Editorial & Content Suite</h2>
        </div>
      </div>

      {/* Right: Actions, Profile & Logout */}
      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-[#01142e] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#0069f7]/20">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-[#01142e] leading-tight">{adminName}</p>
            <p className="text-[11px] text-gray-400 leading-tight">{adminEmail}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition cursor-pointer"
          title="Sign out of Admin"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
