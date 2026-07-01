import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ReactECharts from 'echarts-for-react';
import { 
  Search, 
  Plus, 
  Cpu, 
  RefreshCw, 
  ChevronRight, 
  X,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Activity,
  Terminal,
  FileCode,
  Network
} from 'lucide-react';

const DevicesView = ({ selectedDeviceId, setSelectedDeviceId }) => {
  const { 
    devices, 
    locations, 
    offices,
    currentUser,
    addDevice, 
    editDevice, 
    deleteDevice, 
    bulkRebootDevices, 
    bulkPushConfig
  } = useContext(AppContext);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: 'Router', locationId: '1', ipAddress: '', firmware: 'v1.0.0' });
  const [editForm, setEditForm] = useState({ id: null, name: '', type: 'Router', locationId: '1', ipAddress: '', firmware: 'v2.0.0', status: 'Online' });

  // Detail views
  const activeDevice = devices.find(d => d.id === selectedDeviceId) || null;
  const activeLocation = activeDevice ? locations.find(l => l.id === activeDevice.locationId) : null;
  
  // Filter devices list
  const filteredDevices = devices.filter(dev => {
    const loc = locations.find(l => l.id === dev.locationId);
    const locName = loc ? loc.name : '';
    const matchesSearch = dev.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dev.ipAddress.includes(searchTerm);
    const matchesType = typeFilter === 'all' || dev.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || dev.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || dev.locationId === parseInt(locationFilter);
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const isAllSelected = filteredDevices.length > 0 && selectedIds.length === filteredDevices.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDevices.map(d => d.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenAdd = () => {
    setAddForm({
      name: `Perangkat-${devices.length + 1}`,
      type: 'Router',
      locationId: locations[0]?.id.toString() || '1',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      firmware: 'v1.0.0'
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addDevice(addForm);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (dev) => {
    setEditForm({
      id: dev.id,
      name: dev.name,
      type: dev.type,
      locationId: dev.locationId.toString(),
      ipAddress: dev.ipAddress,
      firmware: dev.firmware,
      status: dev.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editDevice(editForm.id, editForm);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus perangkat jaringan ini?")) {
      deleteDevice(id);
      if (selectedDeviceId === id) setSelectedDeviceId(null);
    }
  };

  const handleBulkReboot = () => {
    if (selectedIds.length === 0) return;
    bulkRebootDevices(selectedIds);
    alert(`Perintah reboot telah dikirim ke ${selectedIds.length} perangkat. Status akan disegarkan sesaat lagi.`);
    setSelectedIds([]);
  };

  const handleBulkPush = () => {
    if (selectedIds.length === 0) return;
    bulkPushConfig(selectedIds);
    alert(`Konfigurasi berhasil didorong ke ${selectedIds.length} perangkat.`);
    setSelectedIds([]);
  };

  // --- ECharts Options for Bandwidth Time Series Graph ---
  const getBandwidthChartOption = (dev) => {
    if (!dev || dev.status === 'Offline') return {};
    
    const dataPoints = 12;
    const now = new Date();
    const timeLabels = [];
    const inData = [];
    const outData = [];

    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      timeLabels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      const variance = Math.random() * 40 - 20;
      inData.push(Math.max(5, parseFloat(dev.bandwidthIn) + variance));
      outData.push(Math.max(5, parseFloat(dev.bandwidthOut) + variance * 0.7));
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        borderColor: '#27272a',
        textStyle: { color: '#fafafa' }
      },
      legend: {
        data: ['Kecepatan Unduh (Inbound)', 'Kecepatan Unggah (Outbound)'],
        textStyle: { color: '#888' },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
        top: '15%'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timeLabels,
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#888' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#888', formatter: '{value} Mb/s' },
        splitLine: { lineStyle: { color: '#27272a', type: 'dashed' } }
      },
      series: [
        {
          name: 'Kecepatan Unduh (Inbound)',
          type: 'line',
          smooth: true,
          data: inData,
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.4)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]
            }
          }
        },
        {
          name: 'Kecepatan Unggah (Outbound)',
          type: 'line',
          smooth: true,
          data: outData,
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.4)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]
            }
          }
        }
      ]
    };
  };

  return (
    <div className="flex gap-6 h-full items-start relative font-sans">
      {/* Left Column: Device Grid / Index */}
      <div className={`transition-all duration-300 ${activeDevice ? 'w-3/5' : 'w-full'} flex flex-col space-y-4`}>
        
        {/* Search, Filter Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-56">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama perangkat / IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-955 dark:text-zinc-50"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Tipe</option>
              <option value="Router">Router</option>
              <option value="Switch">Switch</option>
              <option value="Access Point">Access Point</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Status</option>
              <option value="Online">Online</option>
              <option value="Warning">Peringatan</option>
              <option value="Offline">Offline</option>
            </select>

            {/* Location filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-850 dark:text-zinc-200 max-w-[150px] truncate"
            >
              <option value="all">Semua Lokasi</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="w-full md:w-auto bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Perangkat
            </button>
          )}
        </div>

        {/* Index Table */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex-1">
          <div className="overflow-x-auto max-h-[460px]">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-zinc-500 hover:text-zinc-800">
                      {isAllSelected ? <CheckSquare className="w-4 h-4 text-[#059669]" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-5 py-3">Perangkat</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Alamat IP</th>
                  <th className="px-5 py-3">Titik Lokasi</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {filteredDevices.map((dev) => {
                  const loc = locations.find(l => l.id === dev.locationId);
                  const isSelected = selectedDeviceId === dev.id;
                  const isChecked = selectedIds.includes(dev.id);

                  let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';
                  if (dev.status === 'Offline') badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400';
                  if (dev.status === 'Warning') badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400';

                  return (
                    <tr
                      key={dev.id}
                      onClick={() => setSelectedDeviceId(dev.id)}
                      className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(dev.id)} className="text-zinc-500 hover:text-zinc-800">
                          {isChecked ? <CheckSquare className="w-4 h-4 text-[#059669]" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-zinc-400" />
                          {dev.name}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{dev.type}</td>
                      <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300 font-mono text-xs">{dev.ipAddress}</td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 truncate max-w-[130px]">
                        {loc ? loc.name : 'Unknown Location'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {dev.status === 'Online' ? 'Online' : (dev.status === 'Warning' ? 'Peringatan' : 'Offline')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {currentUser.role === 'admin' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenEdit(dev)}
                              className="p-1 hover:text-blue-500 text-zinc-400 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dev.id)}
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

                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-zinc-400">
                      Perangkat tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="bg-zinc-100 dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-inner">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Aksi Massal ({selectedIds.length} Terpilih):
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkReboot}
                className="bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reboot
              </button>
              <button
                onClick={handleBulkPush}
                className="bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" /> Dorong Konfig
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Detailed Split Device Panel */}
      {activeDevice && (
        <div className="w-2/5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5 flex flex-col h-[650px] transition-all duration-300 relative overflow-y-auto">
          
          <button
            onClick={() => setSelectedDeviceId(null)}
            className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Device header */}
          <div>
            <div className="text-[10px] font-bold text-[#059669] uppercase tracking-widest flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> Telemetri Perangkat Langsung
            </div>
            <h2 className="text-xl font-extrabold text-zinc-955 dark:text-zinc-50 mt-1">{activeDevice.name}</h2>
            <div className="flex gap-2 items-center mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeDevice.status === 'Online' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30' 
                  : (activeDevice.status === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30')
              }`}>
                Status: {activeDevice.status === 'Online' ? 'Online' : (activeDevice.status === 'Warning' ? 'Peringatan' : 'Offline')}
              </span>
              <span className="text-[10px] text-zinc-400">Uptime: {activeDevice.uptime}</span>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5">
              <div className="text-zinc-400 font-semibold mb-1">Beban CPU</div>
              <span className={`font-bold font-mono text-base ${activeDevice.cpuUsage > 80 ? 'text-rose-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
                {activeDevice.cpuUsage}%
              </span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5">
              <div className="text-zinc-400 font-semibold mb-1">Cache RAM</div>
              <span className="font-bold text-zinc-800 dark:text-zinc-100 font-mono text-base">{activeDevice.ramUsage}%</span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5">
              <div className="text-zinc-400 font-semibold mb-1">Firmware</div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate" title={activeDevice.firmware}>
                {activeDevice.firmware.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Bandwidth Area Graph */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Network className="w-3.5 h-3.5" /> Aktivitas Trafik Bandwidth
            </h3>
            {activeDevice.status !== 'Offline' ? (
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
                <ReactECharts 
                  option={getBandwidthChartOption(activeDevice)} 
                  style={{ height: '170px', width: '100%' }}
                />
              </div>
            ) : (
              <div className="h-[170px] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                Tidak ada data trafik. Perangkat sedang luring.
              </div>
            )}
          </div>

          {/* Interfaces Table */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Konfigurasi Interface Port
            </h3>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-1.5">Port</th>
                    <th className="px-3 py-1.5">State</th>
                    <th className="px-3 py-1.5">Speed</th>
                    <th className="px-3 py-1.5">Load</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                  {activeDevice.interfaces.map((intf, index) => (
                    <tr key={index} className="text-zinc-700 dark:text-zinc-300">
                      <td className="px-3 py-1.5 font-bold font-mono">{intf.name}</td>
                      <td className="px-3 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                          intf.status === 'Up' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {intf.status}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-zinc-400 font-mono">{intf.speed}</td>
                      <td className="px-3 py-1.5">{intf.traffic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QoS Shaping Control */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs space-y-2">
            <h4 className="font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"><Network className="w-3.5 h-3.5" /> Kontrol QoS / Limit Bandwidth Perangkat</h4>
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 block">Batas Maksimal Titik</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeLocation ? activeLocation.max_bandwidth_mbps : '100'} Mbps
                </span>
              </div>
              <button
                onClick={() => {
                  alert(`Konfigurasi QoS Shaping (${activeLocation ? activeLocation.max_bandwidth_mbps : '100'} Mbps) berhasil disinkronkan ke perangkat ${activeDevice.name}.`);
                }}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-[#059669]/10 hover:text-[#059669] hover:border-[#059669] rounded px-2.5 py-1 font-bold transition-all text-[10px] text-zinc-700 dark:text-zinc-200"
              >
                Sinkronkan Batas QoS
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                bulkRebootDevices([activeDevice.id]);
                alert('Sinyal reboot perangkat dikirim.');
              }}
              className="flex-1 bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              Reboot Paksa
            </button>
            <button
              onClick={() => {
                bulkPushConfig([activeDevice.id]);
                alert('Berkas konfigurasi berhasil diterapkan.');
              }}
              className="flex-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              Dorong Skema Konfig
            </button>
          </div>
        </div>
      )}

      {/* ADD DEVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Daftarkan Perangkat Jaringan</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Perangkat</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  placeholder="Contoh: Router-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tipe Perangkat</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                  >
                    <option value="Router">Router</option>
                    <option value="Switch">Switch</option>
                    <option value="Access Point">Access Point</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Versi Firmware</label>
                  <input
                    type="text"
                    required
                    value={addForm.firmware}
                    onChange={(e) => setAddForm({ ...addForm, firmware: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Alamat IPv4</label>
                <input
                  type="text"
                  required
                  value={addForm.ipAddress}
                  onChange={(e) => setAddForm({ ...addForm, ipAddress: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-955 dark:text-zinc-50"
                  placeholder="Contoh: 192.168.1.10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Titik Pemasangan Jaringan</label>
                <select
                  value={addForm.locationId}
                  onChange={(e) => setAddForm({ ...addForm, locationId: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
                >
                  Simpan Perangkat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEVICE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Ubah Data Perangkat</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Perangkat</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tipe</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-855 dark:text-zinc-100"
                  >
                    <option value="Router">Router</option>
                    <option value="Switch">Switch</option>
                    <option value="Access Point">Access Point</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Status Perangkat</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-855 dark:text-zinc-100"
                  >
                    <option value="Online">Online</option>
                    <option value="Warning">Peringatan</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Alamat IP</label>
                  <input
                    type="text"
                    required
                    value={editForm.ipAddress}
                    onChange={(e) => setEditForm({ ...editForm, ipAddress: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Firmware</label>
                  <input
                    type="text"
                    required
                    value={editForm.firmware}
                    onChange={(e) => setEditForm({ ...editForm, firmware: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Lokasi Pemasangan</label>
                <select
                  value={editForm.locationId}
                  onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
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

export default DevicesView;
