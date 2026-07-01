import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Building, 
  Clock, 
  AlertCircle,
  Network,
  FileText,
  Printer,
  X,
  MapPin,
  FileDown
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DashboardView = ({ setActiveTab, setSelectedLocationId }) => {
  const { locations, devices, incidents, offices, formatDate } = useContext(AppContext);
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState('all');
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [pdfTargetOffice, setPdfTargetOffice] = useState('all');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerGroupRef = useRef(null);

  // Filter locations by office
  const filteredLocations = selectedOfficeFilter === 'all'
    ? locations
    : locations.filter(loc => loc.officeId === parseInt(selectedOfficeFilter));

  const totalLocs = filteredLocations.length;
  const criticalLocs = filteredLocations.filter(l => l.status === 'Critical').length;
  const warningLocs = filteredLocations.filter(l => l.status === 'Warning').length;
  const okLocs = totalLocs - criticalLocs - warningLocs;

  const filteredLocationIds = filteredLocations.map(l => l.id);
  const filteredDevices = devices.filter(d => filteredLocationIds.includes(d.locationId));
  const onlineDevicesCount = filteredDevices.filter(d => d.status === 'Online').length;
  const totalDevicesCount = filteredDevices.length;
  
  const uptimePercentage = totalDevicesCount > 0 
    ? ((onlineDevicesCount / totalDevicesCount) * 100).toFixed(1)
    : "100.0";

  const openIncidents = incidents.filter(i => 
    i.status === 'Open' && filteredLocationIds.includes(i.locationId)
  );

  // Global National Totals
  const totalNationalLocations = locations.length;
  const totalNationalBandwidth = locations.reduce((sum, l) => sum + (l.max_bandwidth_mbps || 0), 0);

  // --- Calculate Live Bandwidth usage for locations ---
  const getLocBandwidthUsage = (locId) => {
    const locDevs = devices.filter(d => d.locationId === locId && d.status === 'Online');
    const totalIn = locDevs.reduce((acc, d) => acc + (parseFloat(d.bandwidthIn) || 0), 0);
    const totalOut = locDevs.reduce((acc, d) => acc + (parseFloat(d.bandwidthOut) || 0), 0);
    return parseFloat((totalIn + totalOut).toFixed(1));
  };

  // --- Map Initialization ---
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([-2.5, 118.0], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // --- Markers Syncing with Leaflet ---
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (markerGroupRef.current) {
        mapInstanceRef.current.removeLayer(markerGroupRef.current);
      }

      const markerGroup = L.layerGroup().addTo(mapInstanceRef.current);
      markerGroupRef.current = markerGroup;

      filteredLocations.forEach(loc => {
        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);
        if (isNaN(lat) || isNaN(lng)) return; // Skip invalid coordinates

        const currentUsage = getLocBandwidthUsage(loc.id);
        const usagePercent = loc.max_bandwidth_mbps > 0 ? Math.round((currentUsage / loc.max_bandwidth_mbps) * 100) : 0;

        let color = '#10b981'; // Green
        let labelStatus = 'Sehat (OK)';
        if (loc.status === 'Critical') {
          color = '#ef4444'; // Red
          labelStatus = 'Kritis';
        } else if (loc.status === 'Warning') {
          color = '#f59e0b'; // Yellow
          labelStatus = 'Peringatan';
        }

        let bwStatusText = 'Normal';
        let bwColor = '#10b981';
        if (usagePercent >= 100) {
          bwStatusText = 'Melebihi Batas (Kritis)';
          bwColor = '#ef4444';
          if (loc.status === 'OK') {
            color = '#ef4444';
            labelStatus = 'Overlimit';
          }
        } else if (usagePercent >= 80) {
          bwStatusText = 'Mendekati Batas (Peringatan)';
          bwColor = '#f59e0b';
          if (loc.status === 'OK') {
            color = '#f59e0b';
            labelStatus = 'Beban Tinggi';
          }
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center w-5 h-5">
            ${loc.status !== 'OK' || usagePercent >= 80 ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${color}"></span>` : ''}
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 border border-white dark:border-zinc-900 shadow-sm" style="background-color: ${color}"></span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-map-marker-ping',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const popupContent = `
          <div style="font-family: 'DM Sans', sans-serif; min-width: 240px; padding: 4px; color: #1f2937;">
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #111827;">${loc.name}</h4>
            <div style="margin: 0 0 8px 0; font-size: 10px; font-weight: bold; color: ${color};">
              Status Operasional: ${labelStatus}
            </div>

            <div style="background-color: #f9fafb; border-radius: 6px; padding: 8px; margin-bottom: 6px; border: 1px solid #e5e7eb; font-size: 11px;">
              <div style="font-weight: bold; color: #4b5563; margin-bottom: 4px; text-transform: uppercase; font-size: 9px; tracking: 0.5px;">Beban Bandwidth</div>
              <div style="margin-bottom: 2px;"><b>Batas Kecepatan:</b> ${loc.max_bandwidth_mbps} Mbps</div>
              <div style="margin-bottom: 2px;"><b>Penggunaan Saat Ini:</b> ${currentUsage} Mbps</div>
              <div><b>Utilisasi:</b> <span style="color: ${bwColor}; font-weight: bold;">${usagePercent}% (${bwStatusText})</span></div>
            </div>
            
            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb; font-size: 11px;">
              <div style="font-weight: bold; color: #4b5563; margin-bottom: 4px; text-transform: uppercase; font-size: 9px; tracking: 0.5px;">Penanggung Jawab (PIC)</div>
              <div style="margin-bottom: 2px;"><b>Nama:</b> ${loc.picName || '-'}</div>
              <div style="margin-bottom: 2px;"><b>Kontak:</b> ${loc.picContact || '-'}</div>
              <div><b>Jabatan:</b> ${loc.picPosition || '-'}</div>
            </div>

            <div style="font-size: 9px; color: #9ca3af; margin-bottom: 6px;">
              Koordinat: ${loc.latitude}, ${loc.longitude}
            </div>
            
            <button 
              id="drill-btn-${loc.id}" 
              style="width: 100%; display: block; border: none; background-color: #059669; color: white; padding: 5px; font-size: 10px; font-weight: bold; border-radius: 4px; cursor: pointer; text-align: center;"
            >
              Lihat Detail Titik
            </button>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(markerGroup);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`drill-btn-${loc.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedLocationId(loc.id);
              setActiveTab('locations');
            };
          }
        });
      });

      const validLocs = filteredLocations.filter(l => {
        const lat = parseFloat(l.latitude);
        const lng = parseFloat(l.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      if (validLocs.length > 0) {
        const group = new L.featureGroup(validLocs.map(l => L.marker([parseFloat(l.latitude), parseFloat(l.longitude)])));
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
      } else {
        mapInstanceRef.current.setView([-2.5, 118.0], 5);
      }
    }
  }, [filteredLocations, devices, setActiveTab, setSelectedLocationId]);

  const handleAlertClick = (locId) => {
    setSelectedLocationId(locId);
    setActiveTab('incidents');
  };

  const handleOpenPdf = (officeId) => {
    setPdfTargetOffice(officeId);
    setIsPdfOpen(true);
  };

  const triggerMockPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">Ikhtisar Jaringan</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Status real-time dari titik perangkat kantor cabang nasional.</p>
        </div>

        {/* Office Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Filter Wilayah:</label>
          <select 
            value={selectedOfficeFilter} 
            onChange={(e) => setSelectedOfficeFilter(e.target.value)}
            className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm text-zinc-850 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="all">Semua Wilayah</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* KPI 1: Uptime */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Uptime Jaringan</span>
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">
              Target 99.9%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-zinc-955 dark:text-zinc-50">{uptimePercentage}%</span>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            Rasio Uptime dari {totalDevicesCount} perangkat aktif.
          </div>
        </div>

        {/* KPI 2: Average Latency */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rata-rata Latensi</span>
            <span className="bg-zinc-100 text-zinc-850 dark:bg-zinc-800 dark:text-zinc-350 text-xs px-2 py-0.5 rounded-full font-medium">
              Stabil
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-zinc-955 dark:text-zinc-50">14 ms</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            Rata-rata respons ping router (target &lt; 20ms).
          </div>
        </div>

        {/* KPI 3: Open Incidents */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Insiden Aktif</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              openIncidents.length > 0 
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-955/30 dark:text-rose-450' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
            }`}>
              {openIncidents.length > 0 ? 'Butuh Tindakan' : 'Aman'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-zinc-955 dark:text-zinc-50">{openIncidents.length}</span>
            <AlertTriangle className={`w-4 h-4 ${openIncidents.length > 0 ? 'text-rose-500 animate-bounce' : 'text-zinc-300'}`} />
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
            Gangguan atau pemutusan koneksi saat ini.
          </div>
        </div>

        {/* KPI 4: Executive Total Allocation */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Alokasi Bandwidth Nasional</span>
            <span className="bg-[#059669]/10 text-[#059669] text-xs px-2 py-0.5 rounded-full font-bold">
              Organisasi
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-extrabold text-zinc-955 dark:text-zinc-50">{totalNationalBandwidth}</span>
            <span className="text-xs font-bold text-zinc-405 font-mono">Mbps</span>
          </div>
          <div className="text-xs text-zinc-450 dark:text-zinc-500 mt-2">
            Akumulasi limit dari {totalNationalLocations} titik cabang.
          </div>
        </div>
      </div>

      {/* Map View & Live Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (2/3): Leaflet interactive Map */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col min-h-[460px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Pemetaan Geografis Jaringan</h3>
              <p className="text-xs text-zinc-450">Tampilan spatial posisi titik jaringan Indonesia beserta data PIC.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Normal ({okLocs})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> Beban Tinggi / Warning ({warningLocs})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Kritis / Overlimit ({criticalLocs})</span>
            </div>
          </div>

          {/* Leaflet container */}
          <div className="relative rounded-lg overflow-hidden flex-1 border border-zinc-200 dark:border-zinc-800 h-[360px] z-10">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>

        {/* Right Column (1/3): Alert feed */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col max-h-[460px]">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-3 flex items-center justify-between">
            <span>Peringatan Terbaru</span>
            {openIncidents.length > 0 && (
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
                {openIncidents.length} Insiden
              </span>
            )}
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {openIncidents.length > 0 ? (
              openIncidents.map((inc) => {
                const loc = locations.find(l => l.id === inc.locationId);
                const isBwLimitAlert = inc.title.toLowerCase().includes('bandwidth') || inc.title.toLowerCase().includes('limit');
                
                return (
                  <div 
                    key={inc.id} 
                    onClick={() => handleAlertClick(inc.locationId)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-150 ${
                      isBwLimitAlert 
                        ? 'bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/40 hover:border-amber-450' 
                        : 'bg-rose-50 dark:bg-rose-955/20 border-rose-100 dark:border-rose-900/40 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isBwLimitAlert ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        Tingkat: {inc.severity === 'Critical' ? 'Kritis' : (inc.severity === 'High' ? 'Tinggi' : 'Sedang')}
                      </span>
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500">
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 mt-1 line-clamp-2">{inc.title}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                      <Network className="w-3 h-3" /> {loc ? loc.name : 'Unknown Location'}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 py-10">
                <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500" />
                <p className="text-sm font-semibold">Semua titik terhubung sehat.</p>
                <p className="text-xs mt-1 text-zinc-505 font-sans">Tidak ada insiden aktif.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EXECUTIVE REGIONAL SUMMARY RECAP TABLE */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-lg text-zinc-955 dark:text-zinc-50 flex items-center gap-2">
              <Building className="w-5 h-5 text-zinc-400" /> Rekapitulasi Alokasi Jaringan Kantor Wilayah
            </h3>
            <p className="text-xs text-zinc-500">Rekap data kantor wilayah: jumlah titik cabang, koordinat, kecepatan aktual & batas maksimal bandwidth.</p>
          </div>
          
          <button 
            onClick={() => handleOpenPdf('all')}
            className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Ekspor Rekap PDF
          </button>
        </div>

        {/* Office Summary Recap */}
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Kantor Wilayah</th>
                <th className="px-4 py-3">Jumlah Titik</th>
                <th className="px-4 py-3">Daftar Titik Jaringan (Nama / Koordinat / Bandwidth Aktual vs Maks)</th>
                <th className="px-4 py-3 text-right">Alokasi Bandwidth Maks</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
              {offices.map(office => {
                const officeLocs = locations.filter(l => l.officeId === office.id);
                const locCount = officeLocs.length;
                const officeBandwidth = officeLocs.reduce((sum, l) => sum + (l.max_bandwidth_mbps || 0), 0);

                return (
                  <tr key={office.id} className="align-top hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-4 font-bold text-zinc-900 dark:text-zinc-100">{office.name}</td>
                    <td className="px-4 py-4 font-semibold text-zinc-600 dark:text-zinc-400">{locCount} Titik</td>
                    <td className="px-4 py-4 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {officeLocs.slice(0, 4).map(loc => {
                          const currentUsage = getLocBandwidthUsage(loc.id);
                          const isOver = currentUsage >= loc.max_bandwidth_mbps;
                          const isNear = currentUsage >= loc.max_bandwidth_mbps * 0.8 && currentUsage < loc.max_bandwidth_mbps;

                          return (
                            <div key={loc.id} className="p-2 border border-zinc-100 dark:border-zinc-800/80 rounded bg-zinc-50/30 dark:bg-zinc-900/10 text-[10px] space-y-0.5">
                              <div className="font-bold text-zinc-700 dark:text-zinc-200">{loc.name}</div>
                              <div className="text-zinc-400 font-mono">Coords: {loc.latitude}, {loc.longitude}</div>
                              <div className={`font-semibold ${
                                isOver ? 'text-rose-500' : (isNear ? 'text-amber-500' : 'text-[#059669]')
                              }`}>
                                Trafik: {currentUsage} / {loc.max_bandwidth_mbps} Mbps
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {locCount > 4 && (
                        <p className="text-[10px] text-zinc-450 italic pl-1">...dan {locCount - 4} titik lainnya. Lihat selengkapnya di tab Kantor Wilayah.</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {officeBandwidth} Mbps
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleOpenPdf(office.id)}
                        className="text-[10px] font-bold text-[#059669] hover:underline"
                      >
                        Ekspor Wilayah
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operations Quick links */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
        <span className="text-xs font-medium text-zinc-505 dark:text-zinc-400 font-sans">Panel Operasi Cepat</span>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('incidents')}
            className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-colors"
          >
            Tinjau Tiket Insiden
          </button>
          <button 
            onClick={() => setActiveTab('maintenance')}
            className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-colors"
          >
            Buat Laporan Audit
          </button>
        </div>
      </div>

      {/* PDF REPORT MOCK MODAL PREVIEW */}
      {isPdfOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-4xl p-8 relative my-8">
            
            <button
              onClick={() => setIsPdfOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Document Print preview layout */}
            <div id="print-area" className="bg-white text-slate-900 p-8 border border-zinc-300 rounded shadow-sm font-serif space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight uppercase">LAPORAN REKAPITULASI DUA-TAHUNAN ALOKASI BANDWIDTH KANTOR WILAYAH</h1>
                  <p className="text-xs text-slate-500 mt-1 font-sans">Dokumen Distribusi Eksekutif Jaringan Utama • NetPoint Enterprise</p>
                </div>
                <div className="text-right text-[10px] font-sans text-slate-500">
                  <p>Tanggal Cetak: {formatDate(new Date())}</p>
                  <p>Klasifikasi: Rahasia Perusahaan</p>
                </div>
              </div>

              {/* Summary recap text */}
              <div className="text-xs space-y-2 font-sans text-slate-700 leading-relaxed">
                <p>
                  Laporan rekapitulasi alokasi kecepatan internet (bandwidth) yang terdaftar di bawah pengawasan kantor wilayah administratif organisasi. Dokumen ini mendokumentasikan batas maksimal penyediaan (QoS Shaping) beserta statistik pemakaian aktual saat ini.
                </p>
              </div>

              {/* Data Table */}
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-100 font-sans font-bold">
                    <th className="p-2 border border-slate-300">Wilayah</th>
                    <th className="p-2 border border-slate-300">Titik Lokasi</th>
                    <th className="p-2 border border-slate-300 font-mono text-center">Latitude, Longitude</th>
                    <th className="p-2 border border-slate-300 text-right">Pemakaian Aktual</th>
                    <th className="p-2 border border-slate-300 text-right">Batas Maksimal</th>
                  </tr>
                </thead>
                <tbody>
                  {offices
                    .filter(o => pdfTargetOffice === 'all' || o.id === parseInt(pdfTargetOffice))
                    .map(office => {
                      const officeLocs = locations.filter(l => l.officeId === office.id);
                      return officeLocs.map((loc, index) => {
                        const currentUsage = getLocBandwidthUsage(loc.id);
                        return (
                          <tr key={loc.id} className="hover:bg-slate-50">
                            {index === 0 ? (
                              <td className="p-2 border border-slate-300 font-bold" rowSpan={officeLocs.length}>
                                {office.name}
                              </td>
                            ) : null}
                            <td className="p-2 border border-slate-300 font-sans">{loc.name}</td>
                            <td className="p-2 border border-slate-300 font-mono text-center text-[10px]">{loc.latitude}, {loc.longitude}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono">{currentUsage} Mbps</td>
                            <td className="p-2 border border-slate-300 text-right font-mono font-bold">{loc.max_bandwidth_mbps} Mbps</td>
                          </tr>
                        );
                      });
                    })}
                </tbody>
              </table>

              {/* Totals row */}
              <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs font-bold font-sans">
                <span>TOTAL KESELURUHAN LOKASI:</span>
                <span className="font-mono">
                  {offices
                    .filter(o => pdfTargetOffice === 'all' || o.id === parseInt(pdfTargetOffice))
                    .reduce((sum, o) => sum + locations.filter(l => l.officeId === o.id).length, 0)} Titik / {
                    offices
                      .filter(o => pdfTargetOffice === 'all' || o.id === parseInt(pdfTargetOffice))
                      .reduce((sum, o) => sum + locations.filter(l => l.officeId === o.id).reduce((s, l) => s + l.max_bandwidth_mbps, 0), 0)
                  } Mbps
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs font-sans">
                <div className="text-center space-y-12">
                  <p>Disusun Oleh,</p>
                  <div>
                    <p className="font-bold underline">Andy IT Admin</p>
                    <p className="text-[10px] text-slate-500">Supervisi Jaringan Utama</p>
                  </div>
                </div>
                <div className="text-center space-y-12">
                  <p>Disetujui Oleh,</p>
                  <div>
                    <p className="font-bold underline">IT Executive Leader</p>
                    <p className="text-[10px] text-slate-500">Kepala Divisi Teknologi & Komunikasi</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Print controls */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPdfOpen(false)}
                className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={triggerMockPrint}
                className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-4 h-4" /> Cetak / Simpan PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardView;
