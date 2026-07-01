import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Building2,
  Sun,
  Moon,
  Network,
  Package,
  Users,
  LogOut
} from 'lucide-react';

const ROLE_LABELS = {
  admin: 'Administrator',
  pimpinan: 'Pimpinan',
  teknisi: 'Teknisi Lapangan',
};

const ROLE_COLORS = {
  admin: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
  pimpinan: 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400',
  teknisi: 'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400',
};

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { darkMode, setDarkMode, incidents, spareparts, currentUser, logout } = useContext(AppContext);

  const openIncidentsCount = incidents.filter(i => i.status === 'Open').length;
  const lowStockCount = spareparts.filter(s => s.status !== 'Tersedia').length;

  const menuItems = [
    { id: 'dashboard',   name: 'Ikhtisar',          icon: LayoutDashboard, roles: ['admin', 'pimpinan'] },
    { id: 'locations',   name: 'Titik Lokasi',       icon: MapPin,          roles: ['admin', 'pimpinan', 'teknisi'] },
    { id: 'devices',     name: 'Daftar Perangkat',   icon: Cpu,             roles: ['admin', 'pimpinan'] },
    {
      id: 'incidents', name: 'Tiket Insiden', icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? openIncidentsCount : null, badgeColor: 'bg-rose-500 animate-bounce',
      roles: ['admin', 'pimpinan', 'teknisi']
    },
    { id: 'reports',     name: 'Laporan Analisis',   icon: BarChart3,       roles: ['admin', 'pimpinan'] },
    { id: 'maintenance', name: 'Audit & Jadwal',     icon: CalendarClock,   roles: ['admin', 'pimpinan', 'teknisi'] },
    {
      id: 'spareparts', name: 'Suku Cadang', icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-amber-500',
      roles: ['admin', 'pimpinan', 'teknisi']
    },
    { id: 'offices',     name: 'Kantor Wilayah',     icon: Building2,       roles: ['admin', 'pimpinan'] },
    { id: 'users',       name: 'Manajemen Pengguna', icon: Users,           roles: ['admin'] },
  ];

  const filtered = currentUser ? menuItems.filter(item => item.roles.includes(currentUser.role)) : [];

  return (
    <aside className="w-64 bg-white dark:bg-[#0c0c0f] border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full transition-all duration-300">

      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div className="bg-[#059669]/10 text-[#059669] p-2 rounded-lg">
          <Network className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">NetPoint</span>
          <span className="text-[10px] block font-semibold text-zinc-500 uppercase tracking-widest leading-none">Manajemen</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">

        {/* Section divider for user management */}
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isFirstAdmin = item.id === 'users';

          return (
            <React.Fragment key={item.id}>
              {isFirstAdmin && (
                <div className="pt-3 pb-1.5 px-1">
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-2" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Administrasi</span>
                </div>
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#059669]' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge != null && (
                  <span className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-rose-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer: Theme Toggle + User Profile */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">

        {/* Dark mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tampilan</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
            title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>

        {/* Logged-in user card */}
        {currentUser && (
          <div className="flex items-center gap-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl px-3 py-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${ROLE_COLORS[currentUser.role] || ROLE_COLORS.admin}`}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">@{currentUser.username}</p>
            </div>
            <button
              onClick={logout}
              title="Keluar"
              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
