import logger from '@/lib/logger';
/**
 * Admin Dashboard Layout
 * Protected admin-only layout with sidebar and header
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check-access');
        if (!res.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        setLoading(false);
      } catch (error) {
        logger.error('Failed to verify admin access:', error);
        router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const adminMenuItems = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Analytics',
      href: '/dashboard/admin/analytics',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Users',
      href: '/dashboard/admin/users',
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Billing',
      href: '/dashboard/admin/billing',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/dashboard/admin/settings',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-6">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1 hover:bg-gray-800"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-2 px-2">
          {adminMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-gray-800 transition"
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 hover:bg-gray-800 transition"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Administrator</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">{children}</div>
      </div>
    </div>
  );
}
