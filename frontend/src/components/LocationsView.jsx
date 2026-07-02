import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  Building2, 
  ChevronRight, 
  X,
  Trash2,
  Edit3,
  Contact,
  Locate,
  Laptop,
  Network,
  Wrench,
  Cpu
} from 'lucide-react';

const LocationsView = ({ selectedLocationId, setSelectedLocationId, setActiveTab }) => {
  const { 
    locations, 
    offices, 
    devices, 
    technicianHistory,
    deviceHistory,
    currentUser,
    addLocation, 
    editLocation, 
    deleteLocation,
    formatDate
  } = useContext(AppContext);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sidebar Detail sub-tab state
  const [sidebarTab, setSidebarTab] = useState('perangkat'); 

  // Panels â€” isAddPanelOpen replaces modal popup
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ 
    name: '', 
    officeId: '1', 
    installationDate: '',
    latitude: '',
    longitude: '',
    picName: '',
    picContact: '',
    picPosition: 'Teknisi Lapangan',
    max_bandwidth_mbps: '100'
  });
  const [editForm, setEditForm] = useState({ 
    id: null, 
    name: '', 
    officeId: '1', 
    installationDate: '',
    latitude: '',
    longitude: '',
    picName: '',
    picContact: '',
    picPosition: '',
    max_bandwidth_mbps: '100'
  });

  const activeLocation = locations.find(l => l.id === selectedLocationId) || null;
  const activeLocationDevices = activeLocation 
    ? devices.filter(d => d.locationId === activeLocation.id) 
    : [];

  const activeTechLogs = activeLocation
    ? technicianHistory.filter(h => h.locationId === activeLocation.id)
    : [];

  const activeDeviceLogs = activeLocation
    ? deviceHistory.filter(h => h.locationId === activeLocation.id)
    : [];

  // Filter list
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (loc.picName && loc.picName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesOffice = officeFilter === 'all' || loc.officeId === parseInt(officeFilter);
    const matchesStatus = statusFilter === 'all' || loc.status === statusFilter;
    return matchesSearch && matchesOffice && matchesStatus;
  });

  // Calculate live bandwidth usage
  const getLocBandwidthUsage = (locId) => {
    const locDevs = devices.filter(d => d.locationId === locId && d.status === 'Online');
    const totalIn = locDevs.reduce((acc, d) => acc + (parseFloat(d.bandwidthIn) || 0), 0);
    const totalOut = locDevs.reduce((acc, d) => acc + (parseFloat(d.bandwidthOut) || 0), 0);
    return parseFloat((totalIn + totalOut).toFixed(1));
  };

  const handleOpenAdd = () => {
    setAddForm({
      name: `Titik Lokasi ${String(locations.length + 1).padStart(2, '0')}`,
      officeId: offices[0]?.id.toString() || '1',
      installationDate: new Date().toISOString().split('T')[0],
      latitude: '-6.200000',
      longitude: '106.816666',
      picName: 'Hasan Basri',
      picContact: '+62 812-9900-8811',
      picPosition: 'Teknisi Lapangan',
      max_bandwidth_mbps: '100'
    });
    // Close detail panel when opening add panel
    setSelectedLocationId(null);
    setIsAddPanelOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    const newId = addLocation(addForm);
    setIsAddPanelOpen(false);
    setSelectedLocationId(newId);
  };

  const handleOpenEdit = (loc) => {
    setEditForm({
      id: loc.id,
      name: loc.name,
      officeId: (loc.officeId || '1').toString(),
      installationDate: loc.installationDate || '',
      latitude: (loc.latitude != null ? loc.latitude : '').toString(),
      longitude: (loc.longitude != null ? loc.longitude : '').toString(),
      picName: loc.picName || '',
      picContact: loc.picContact || '',
      picPosition: loc.picPosition || '',
      max_bandwidth_mbps: (loc.max_bandwidth_mbps || 100).toString()
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editLocation(editForm.id, editForm);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus titik lokasi ini? Semua perangkat yang terhubung akan ikut dihapus.")) {
      deleteLocation(id);
      if (selectedLocationId === id) setSelectedLocationId(null);
    }
  };

  // Determine left column width based on panels open
  const hasRightPanel = activeLocation || isAddPanelOpen;

  return (
    <div className="flex gap-6 h-full items-start relative font-sans">
      {/* Left Column: Locations Table */}
      <div className={`transition-all duration-300 ${hasRightPanel ? 'w-3/5' : 'w-full'} flex flex-col space-y-4`}>
        
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama titik / PIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-955 dark:text-zinc-50"
              />
            </div>

            {/* Office filter */}
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Wilayah</option>
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Status</option>
              <option value="OK">Sehat (OK)</option>
              <option value="Warning">Peringatan</option>
              <option value="Critical">Kritis (Offline)</option>
            </select>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Lokasi
            </button>
          )}
        </div>

        {/* Locations List Table */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex-1">
          <div className="overflow-x-auto max-h-[580px]">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Lokasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Wilayah</th>
                  <th className="px-4 py-3">Batas Bandwidth (Mbps)</th>
                  <th className="px-4 py-3">PIC (Nama / Kontak)</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {filteredLocations.map((loc) => {
                  const office = offices.find(o => o.id === loc.officeId);
                  const isSelected = selectedLocationId === loc.id;

                  const currentUsage = getLocBandwidthUsage(loc.id);
                  const usagePercent = loc.max_bandwidth_mbps > 0 ? Math.round((currentUsage / loc.max_bandwidth_mbps) * 100) : 0;
                  
                  let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
                  if (loc.status === 'Critical') badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450';
                  if (loc.status === 'Warning') badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';

                  // Bandwidth alert visual in row
                  let bwBadgeClass = 'text-zinc-500';
                  if (usagePercent >= 100) {
                    bwBadgeClass = 'text-rose-600 dark:text-rose-400 font-extrabold animate-pulse';
                  } else if (usagePercent >= 80) {
                    bwBadgeClass = 'text-amber-600 dark:text-amber-400 font-bold';
                  }

                  return (
                    <tr
                      key={loc.id}
                      onClick={() => setSelectedLocationId(loc.id)}
                      className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-955/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4 font-semibold text-zinc-900 dark:text-zinc-200">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {loc.name}</span>
                          <span className="text-[10px] text-zinc-400 pl-4 font-mono">{loc.deviceCount} Perangkat</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {loc.status === 'OK' ? 'OK' : (loc.status === 'Warning' ? 'Peringatan' : 'Kritis')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-zinc-700 dark:text-zinc-350">
                        {office ? office.name : 'Unknown Office'}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono font-bold">
                        <span className={bwBadgeClass}>
                          {currentUsage} / {loc.max_bandwidth_mbps} Mbps ({usagePercent}%)
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-250">{loc.picName || '-'}</span>
                          <span className="text-zinc-450 font-mono text-[10px]">{loc.picContact || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {currentUser.role === 'admin' && (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleOpenEdit(loc)}
                              className="p-1 hover:text-blue-500 text-zinc-400 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(loc.id)}
                              className="p-1 hover:text-rose-500 text-zinc-400 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredLocations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-zinc-405">
                      Tidak ada titik lokasi ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Location Inspection Panel */}
      {activeLocation && (
        <div className="w-2/5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5 flex flex-col h-[650px] transition-all duration-300 relative">
          
          <button
            onClick={() => setSelectedLocationId(null)}
            className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Heading */}
          <div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#059669] uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> Detail Titik Lokasi
            </div>
            <h2 className="text-xl font-extrabold text-zinc-955 dark:text-zinc-50 mt-1">{activeLocation.name}</h2>
            <div className="flex gap-2 items-center mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeLocation.status === 'OK' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30' 
                  : (activeLocation.status === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30' : 'bg-rose-100 text-rose-800 dark:bg-rose-955/30')
              }`}>
                Status: {activeLocation.status === 'OK' ? 'OK' : (activeLocation.status === 'Warning' ? 'Peringatan' : 'Kritis')}
              </span>
              <span className="text-[10px] text-zinc-400">Terpantau: {activeLocation.lastSeen}</span>
            </div>
          </div>

          {/* Tab Selection Row */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 flex text-xs font-semibold">
            <button
              onClick={() => setSidebarTab('perangkat')}
              className={`pb-2 px-2 border-b-2 transition-all ${
                sidebarTab === 'perangkat' ? 'border-[#059669] text-[#059669] dark:text-zinc-100' : 'border-transparent text-zinc-400'
              }`}
            >
              Perangkat
            </button>
            <button
              onClick={() => setSidebarTab('teknisi')}
              className={`pb-2 px-2 border-b-2 transition-all ${
                sidebarTab === 'teknisi' ? 'border-[#059669] text-[#059669] dark:text-zinc-100' : 'border-transparent text-zinc-400'
              }`}
            >
              Riwayat Teknisi
            </button>
            <button
              onClick={() => setSidebarTab('perangkatHistory')}
              className={`pb-2 px-2 border-b-2 transition-all ${
                sidebarTab === 'perangkatHistory' ? 'border-[#059669] text-[#059669] dark:text-zinc-100' : 'border-transparent text-zinc-400'
              }`}
            >
              Riwayat Hardware
            </button>
            <button
              onClick={() => setSidebarTab('pic')}
              className={`pb-2 px-2 border-b-2 transition-all ${
                sidebarTab === 'pic' ? 'border-[#059669] text-[#059669] dark:text-zinc-100' : 'border-transparent text-zinc-400'
              }`}
            >
              PIC & Spasial
            </button>
          </div>

          {/* Sub-tab: Perangkat Terdaftar */}
          {sidebarTab === 'perangkat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" /> Perangkat Terdaftar ({activeLocationDevices.length})
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {activeLocationDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-400 dark:hover:border-zinc-650 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-805 dark:text-zinc-200">{dev.name}</h4>
                      <p className="text-[10px] text-zinc-450 font-mono mt-0.5">{dev.type} â€¢ {dev.ipAddress}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        dev.status === 'Online' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' 
                          : (dev.status === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20' : 'bg-rose-100 text-rose-800 dark:bg-rose-955/20')
                      }`}>
                        {dev.status === 'Online' ? 'Online' : (dev.status === 'Warning' ? 'Peringatan' : 'Offline')}
                      </span>
                      <button 
                        onClick={() => setActiveTab('devices')}
                        className="p-1 rounded bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-350 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Inspect"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {activeLocationDevices.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-6">Belum ada perangkat terdaftar.</p>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: Riwayat Penugasan Teknisi */}
          {sidebarTab === 'teknisi' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Log Riwayat Teknisi Terpilih
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {activeTechLogs.map((log, index) => (
                  <div key={index} className="p-3 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold">
                      <span>{log.name}</span>
                      <span className="font-mono">{formatDate(log.date)}</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 font-bold">{log.action}</p>
                  </div>
                ))}

                {activeTechLogs.length === 0 && (
                  <p className="text-xs text-zinc-405 text-center py-8">Belum ada riwayat penugasan teknisi.</p>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: Riwayat Penggantian Perangkat */}
          {sidebarTab === 'perangkatHistory' && (
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Log Instalasi / Pergantian Hardware
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {activeDeviceLogs.map((log, index) => (
                  <div key={index} className="p-3 bg-zinc-55 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span className="font-bold text-zinc-500">{log.deviceName}</span>
                      <span className="font-mono">{formatDate(log.date)}</span>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 font-semibold">{log.action}</p>
                    <p className="text-[9px] text-zinc-450 italic">Teknisi PJ: {log.technician}</p>
                  </div>
                ))}

                {activeDeviceLogs.length === 0 && (
                  <p className="text-xs text-zinc-405 text-center py-8">Belum ada riwayat pergantian hardware.</p>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: PIC & Spasial */}
          {sidebarTab === 'pic' && (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5">
                  <div className="text-zinc-400 font-semibold mb-1 flex items-center gap-1"><Building2 className="w-3 h-3" /> Kantor Wilayah</div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                    {offices.find(o => o.id === activeLocation.officeId)?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5">
                  <div className="text-zinc-400 font-semibold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Tgl Instalasi</div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                    {formatDate(activeLocation.installationDate)}
                  </span>
                </div>
              </div>

              {/* Bandwidth Limits Config */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs">
                <div className="text-zinc-400 font-semibold mb-2 flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Konfigurasi Batas Bandwidth</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Batas Maksimal</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-100 font-mono text-sm">{activeLocation.max_bandwidth_mbps} Mbps</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block text-right">Pemakaian Aktif</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-100 font-mono text-sm text-right block">
                      {getLocBandwidthUsage(activeLocation.id)} Mbps
                    </span>
                  </div>
                </div>
              </div>

              {/* GPS coordinates details */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs">
                <div className="text-zinc-400 font-semibold mb-2 flex items-center gap-1.5"><Locate className="w-3.5 h-3.5" /> Koordinat Geografis (GPS)</div>
                <div className="grid grid-cols-2 gap-4 font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Latitude</span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-200">{activeLocation.latitude}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Longitude</span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-200">{activeLocation.longitude}</span>
                  </div>
                </div>
              </div>

              {/* PIC Contacts details */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs">
                <div className="text-zinc-400 font-semibold mb-2 flex items-center gap-1.5"><Contact className="w-3.5 h-3.5" /> Penanggung Jawab (PIC Jaringan)</div>
                <div className="space-y-1.5">
                  <p><span className="text-zinc-400 inline-block w-20">Nama:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeLocation.picName || '-'}</span></p>
                  <p><span className="text-zinc-400 inline-block w-20">Kontak:</span> <span className="font-mono text-zinc-800 dark:text-zinc-200">{activeLocation.picContact || '-'}</span></p>
                  <p><span className="text-zinc-400 inline-block w-20">Jabatan:</span> <span className="text-zinc-800 dark:text-zinc-200">{activeLocation.picPosition || '-'}</span></p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleOpenEdit(activeLocation)}
              className="flex-1 bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              Ubah Data Titik
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className="flex-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              Daftar Perangkat Baru
            </button>
          </div>
        </div>
      )}

      {/* ADD LOCATION â€” Inline Sliding Panel (replaces modal popup) */}
      {isAddPanelOpen && (
        <div className="w-2/5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col h-[650px] transition-all duration-300 relative overflow-y-auto">
          
          {/* Panel Header */}
          <div className="flex items-start justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-[#0c0c0f] z-10">
            <div>
              <div className="text-[10px] font-bold text-[#059669] uppercase tracking-widest flex items-center gap-1 mb-1">
                <Plus className="w-3 h-3" /> Tambah Titik Baru
              </div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">Daftarkan Titik Lokasi</h2>
            </div>
            <button
              onClick={() => setIsAddPanelOpen(false)}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Form Body */}
          <form onSubmit={handleAddSubmit} className="p-5 space-y-4 flex-1">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Titik / Lokasi</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Kantor Wilayah</label>
                <select
                  value={addForm.officeId}
                  onChange={(e) => setAddForm({ ...addForm, officeId: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-850 dark:text-zinc-100"
                >
                  {offices.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Batas Bandwidth (Mbps)</label>
                <input
                  type="number"
                  required
                  value={addForm.max_bandwidth_mbps}
                  onChange={(e) => setAddForm({ ...addForm, max_bandwidth_mbps: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tgl Instalasi</label>
                <input
                  type="date"
                  required
                  value={addForm.installationDate}
                  onChange={(e) => setAddForm({ ...addForm, installationDate: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Latitude (GPS)</label>
                <input
                  type="text"
                  required
                  value={addForm.latitude}
                  onChange={(e) => setAddForm({ ...addForm, latitude: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-55"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Longitude (GPS)</label>
                <input
                  type="text"
                  required
                  value={addForm.longitude}
                  onChange={(e) => setAddForm({ ...addForm, longitude: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-55"
                />
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-3">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block">Person In Charge (PIC)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 mb-1">Nama PIC</label>
                  <input
                    type="text"
                    required
                    value={addForm.picName}
                    onChange={(e) => setAddForm({ ...addForm, picName: e.target.value })}
                    className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-55"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 mb-1">Kontak PIC</label>
                  <input
                    type="text"
                    required
                    value={addForm.picContact}
                    onChange={(e) => setAddForm({ ...addForm, picContact: e.target.value })}
                    className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-55"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-1">Jabatan PIC</label>
                <input
                  type="text"
                  required
                  value={addForm.picPosition}
                  onChange={(e) => setAddForm({ ...addForm, picPosition: e.target.value })}
                  className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-55"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddPanelOpen(false)}
                className="flex-1 bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors"
              >
                Simpan Lokasi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT LOCATION MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Ubah Data Titik Jaringan</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Titik</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Kantor Wilayah</label>
                  <select
                    value={editForm.officeId}
                    onChange={(e) => setEditForm({ ...editForm, officeId: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                  >
                    {offices.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Batas Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    required
                    value={editForm.max_bandwidth_mbps}
                    onChange={(e) => setEditForm({ ...editForm, max_bandwidth_mbps: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-955 dark:text-zinc-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tgl Instalasi</label>
                  <input
                    type="date"
                    required
                    value={editForm.installationDate}
                    onChange={(e) => setEditForm({ ...editForm, installationDate: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Latitude (GPS)</label>
                  <input
                    type="text"
                    required
                    value={editForm.latitude}
                    onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-55"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Longitude (GPS)</label>
                  <input
                    type="text"
                    required
                    value={editForm.longitude}
                    onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-55"
                  />
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-lg p-3 space-y-3">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block">Person In Charge (PIC)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">Nama PIC</label>
                    <input
                      type="text"
                      required
                      value={editForm.picName}
                      onChange={(e) => setEditForm({ ...editForm, picName: e.target.value })}
                      className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-55"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">Kontak PIC</label>
                    <input
                      type="text"
                      required
                      value={editForm.picContact}
                      onChange={(e) => setEditForm({ ...editForm, picContact: e.target.value })}
                      className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-55"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 mb-1">Jabatan PIC</label>
                  <input
                    type="text"
                    required
                    value={editForm.picPosition}
                    onChange={(e) => setEditForm({ ...editForm, picPosition: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-55"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsView;
