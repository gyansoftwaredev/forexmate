"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNotificationStore } from '@/stores/notificationStore';
import { InAppNotificationListener } from '@/components/notifications/InAppNotificationListener';
import API_URL, { authFetch } from '@/lib/api';
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  Send, 
  Users, 
  ShieldCheck, 
  FileText, 
  Bell, 
  LifeBuoy, 
  Plane, 
  User, 
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Briefcase,
  Sparkles,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarGroups = [
  {
    title: 'COMMAND CENTER',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Active Orders', href: '/dashboard/orders', icon: ArrowRightLeft },
      { name: 'Forex Cards', href: '/dashboard/cards', icon: CreditCard },
      { name: 'Remittances', href: '/dashboard/remittances', icon: Send },
      { name: 'Dealer Desk', href: '/dashboard/dealer', icon: Briefcase },
    ]
  },
  {
    title: 'COMPLIANCE & DOCS',
    items: [
      { name: 'KYC Wizard', href: '/dashboard/kyc', icon: ShieldCheck },
      { name: 'Beneficiaries', href: '/dashboard/beneficiaries', icon: Users },
      { name: 'Invoices & Receipts', href: '/dashboard/invoices', icon: FileText },
    ]
  },
  {
    title: 'SERVICES & HUBS',
    items: [
      { name: 'Travel Hub', href: '/dashboard/travel', icon: Plane },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'Support Desk', href: '/dashboard/support', icon: LifeBuoy },
    ]
  },
  {
    title: 'ACCOUNT & SECURITY',
    items: [
      { name: 'Profile Details', href: '/dashboard/profile', icon: User },
      { name: 'Security Settings', href: '/dashboard/settings', icon: Settings },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'SUPER_ADMIN']}>
      <InAppNotificationListener />
      <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-amber-400 selection:text-slate-950 font-sans antialiased">
        
        {/* Desktop Sidebar (Light Premium Styling) */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/90 h-screen sticky top-0 z-30 shadow-2xs">
          
          {/* Brand Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-100 justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-amber-400 text-lg">
                  F
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Forex<span className="text-amber-600">mate</span>
                </span>
                <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block -mt-1">
                  EXECUTIVE PORTAL
                </span>
              </div>
            </Link>

            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              GOLD TIER
            </span>
          </div>
          
          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
            {sidebarGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
                  {group.title}
                </h4>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group relative overflow-hidden",
                          isActive 
                            ? "bg-amber-50 text-amber-950 border-l-4 border-amber-500 shadow-2xs font-extrabold" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                        )}
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-amber-600" : "text-slate-400 group-hover:text-amber-600")} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}

            {/* Quick Promo Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border border-amber-200/80 text-left space-y-2 mt-4 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-black">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Zero Markup Forex Card</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Load multi-currency cards at live interbank rates with zero hidden charges.
              </p>
              <button 
                onClick={() => router.push('/buy-forex?tab=buy')}
                className="w-full btn-gold py-2 rounded-lg text-xs font-black text-slate-950 shadow-sm hover:scale-102 transition-transform"
              >
                Order Card Now
              </button>
            </div>
          </div>

          {/* User Signout Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={logout} 
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span>Sign Out Account</span>
              </div>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-mono">SECURE</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          
          {/* Top Navigation Bar (Light Executive Header) */}
          <header className="h-20 bg-white/90 border-b border-slate-200/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-2xs">
            
            <div className="flex items-center flex-1 gap-4">
              <button 
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search Bar */}
              <div className="hidden sm:flex max-w-md w-full relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  placeholder="Search orders, cards, invoices, beneficiaries..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>

              {/* Ticker Strip */}
              <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-slate-200 text-[11px] font-extrabold text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  USD ₹84.13
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  EUR ₹91.05
                </span>
                <span className="flex items-center gap-1.5 text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  GBP ₹106.80
                </span>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-4">
              
              {/* Notifications Center */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-10 h-10 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-amber-500/50 transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-md shadow-amber-500/40 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-84 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Notifications</h3>
                        {unreadCount > 0 ? (
                          <button 
                            onClick={async () => {
                              try {
                                await authFetch(`${API_URL}/notifications/read-all`, { method: 'POST' });
                                markAllAsRead();
                              } catch (_) {}
                            }}
                            className="text-xs font-extrabold text-amber-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">All read</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-xs font-bold">No new notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div 
                              key={n.id}
                              onClick={async () => {
                                setIsNotificationsOpen(false);
                                if (!n.read) {
                                  try {
                                    await authFetch(`${API_URL}/notifications/${n.id}/read`, { method: 'POST' });
                                    markAsRead(n.id);
                                  } catch (_) {}
                                }
                                if (n.actionUrl) {
                                  router.push(n.actionUrl);
                                }
                              }}
                              className={cn(
                                "p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 text-left",
                                !n.read ? "bg-amber-50/50" : "opacity-80"
                              )}
                            >
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold",
                                !n.read ? "bg-amber-400 text-slate-950 border-amber-300" : "bg-slate-100 border-slate-200 text-slate-500"
                              )}>
                                🔔
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-xs leading-relaxed text-slate-700", !n.read ? "font-extrabold text-slate-900" : "font-semibold")}>
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
                        <Link href="/dashboard/notifications" className="text-xs font-extrabold text-amber-600 hover:underline" onClick={() => setIsNotificationsOpen(false)}>
                          View All Notifications →
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              
              {/* Profile Pill */}
              <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 p-1.5 pr-4 rounded-full shadow-2xs hover:border-slate-300 transition-all cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                  {user?.fullName?.charAt(0) || 'G'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-extrabold text-slate-900 leading-none flex items-center gap-1">
                    {user?.fullName || 'Gyan Vaibhav'}
                    <span className="text-[10px] text-amber-600">✓</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
                    {user?.role === 'SUPER_ADMIN' ? 'Administrator' : 'Gold Executive'}
                  </div>
                </div>
              </div>

            </div>
          </header>

          {/* Page Content Body */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </div>

        </main>

        {/* Mobile Navigation Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-72 bg-slate-900 flex flex-col shadow-2xl border-r border-slate-800">
               <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
                  <Link href="/" className="flex items-center gap-2 font-black text-xl text-white">
                    Forex<span className="text-amber-400">mate</span>
                  </Link>
                  <button className="p-2 rounded-xl text-slate-400 hover:text-white" onClick={() => setIsMobileOpen(false)}>
                    <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                 {sidebarGroups.map((group, idx) => (
                   <div key={idx} className="space-y-1">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">{group.title}</h4>
                     {group.items.map((item) => (
                       <Link 
                         key={item.name} 
                         href={item.href}
                         onClick={() => setIsMobileOpen(false)}
                         className={cn(
                           "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                           pathname === item.href ? "bg-amber-400/10 text-amber-400 border-l-4 border-amber-400" : "text-slate-400 hover:text-white"
                         )}
                       >
                         <item.icon className="w-4 h-4 text-amber-400" />
                         {item.name}
                       </Link>
                     ))}
                   </div>
                 ))}
               </div>
            </aside>
          </div>
        )}
        
        </div>
    </ProtectedRoute>
  );
}
