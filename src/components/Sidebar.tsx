'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FileText,
  PlusCircle,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Categories & Sub',
      href: '/dashboard/categories',
      icon: Layers,
    },
    {
      name: 'All Articles',
      href: '/dashboard/news',
      icon: FileText,
    },
    {
      name: 'Create News',
      href: '/dashboard/news/create',
      icon: PlusCircle,
    },
  ];

  return (
    <aside
      className={`bg-[#01142e] text-white flex flex-col transition-all duration-300 border-r border-[#0d2a54] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#0d2a54] bg-[#000d20]">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/updatedlogo.svg"
            alt="BusinessBulletin"
            className="h-7 w-auto max-w-[130px] brightness-0 invert object-contain shrink-0"
          />
          {!collapsed && (
            <span className="text-[9px] uppercase font-bold tracking-wider text-white bg-[#0069f7] px-1.5 py-0.5 rounded shadow-xs shrink-0 ml-auto">
              Admin
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className={`text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-3 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•' : 'Management'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#0069f7] text-white shadow-md shadow-[#0069f7]/20 font-semibold'
                  : 'text-gray-300 hover:text-white hover:bg-[#07244d]'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
