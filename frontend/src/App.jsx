import React, { useState, useEffect, useRef, useContext } from 'react';
import AppContext, { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import LocationsView from './components/LocationsView';
import DevicesView from './components/DevicesView';
import IncidentsView from './components/IncidentsView';
import ReportsView from './components/ReportsView';
import MaintenanceView from './components/MaintenanceView';
import SparePartsView from './components/SparePartsView';
import OfficesView from './components/OfficesView';
import UserManagementView from './components/UserManagementView';
import LoginScreen from './components/LoginScreen';
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  LogOut,
  X
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

function AppContent() {
  const { currentUser, logout, notifications } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Drill-down states
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Enforce role-based routing
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'teknisi') {
      const allowed = ['locations', 'incidents', 'maintenance', 'spareparts'];
      if (!allowed.includes(activeTab)) setActiveTab('incidents');
    }
    if (currentUser.role === 'pimpinan' && activeTab === 'users') {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role]);

  // Breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'NetPoint', active: false }];
    const map = {
      dashboard: 'Ikhtisar',
      incidents: 'Tiket Insiden & Gangguan',
      reports: 'Laporan Analisis Kinerja',
      maintenance: 'Audit & Pemeliharaan',
      spareparts: 'Inventaris Suku Cadang',
      offices: 'Kantor Wilayah',
      users: 'Manajemen Pengguna',
    };
    if (activeTab === 'locations') {
      crumbs.push({ label: 'Titik Lokasi', active: !selectedLocationId });
      if (selectedLocationId) crumbs.push({ label: `Titik ${String(selectedLocationId).padStart(2, '0')}`, active: true });
    } else if (activeTab === 'devices') {
      crumbs.push({ label: 'Inventaris Perangkat', active: !selectedDeviceId });
      if (selectedDeviceId) crumbs.push({ label: `Perangkat #${selectedDeviceId}`, active: true });
    } else {
      crumbs.push({ label: map[activeTab] || activeTab, active: true });
    }
    return crumbs;
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} setSelectedLocationId={setSelectedLocationId} />;
      case 'locations':
        return <LocationsView selectedLocationId={selectedLocationId} setSelectedLocationId={setSelectedLocationId} setActiveTab={setActiveTab} />;
      case 'devices':
        return <DevicesView selectedDeviceId={selectedDeviceId} setSelectedDeviceId={setSelectedDeviceId} />;
      case 'incidents':
        return <IncidentsView selectedLocationId={selectedLocationId} setSelectedLocationId={setSelectedLocationId} />;
      case 'reports':
        return <ReportsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'spareparts':
        return <SparePartsView />;
      case 'offices':
        return <OfficesView />;
      case 'users':
        return currentUser.role === 'admin' ? <UserManagementView /> : <DashboardView setActiveTab={setActiveTab} setSelectedLocationId={setSelectedLocationId} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} setSelectedLocationId={setSelectedLocationId} />;
    }
  };

  // Show login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#09090b] text-zinc-955 dark:text-zinc-50 transition-colors duration-200 font-sans">

      {/* SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOPBAR */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f] flex items-center justify-between px-6 z-20 flex-shrink-0 transition-colors duration-200">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            {getBreadcrumbs().map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-400/60" />}
                <span className={crumb.active ? 'text-zinc-900 dark:text-zinc-100 font-bold' : ''}>{crumb.label}</span>
              </React.Fragment>
            ))}
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-3">

            {/* Secure badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> KONSOL AMAN
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/50 relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                  </>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Notifikasi Jaringan</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Real-time</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                    {notifications.slice(0, 8).map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-xs">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{notif.title}</div>
                        <div className="text-zinc-500 dark:text-zinc-400 mt-0.5">{notif.message}</div>
                        <div className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-1">{new Date(notif.time).toLocaleTimeString('id-ID')}</div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-zinc-400 text-xs">Belum ada notifikasi baru.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

            {/* Profile + Logout */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                {/* Avatar initials */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold ${ROLE_COLORS[currentUser.role] || ROLE_COLORS.admin}`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</div>
                  <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {ROLE_LABELS[currentUser.role] || currentUser.role}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${ROLE_COLORS[currentUser.role]}`}>
                      {ROLE_LABELS[currentUser.role]}
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">@{currentUser.username}</p>
                    {currentUser.jabatan && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{currentUser.jabatan}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Keluar dari Sistem
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-[#09090b] transition-colors duration-200">
          <div className="max-w-[1600px] mx-auto h-full">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
