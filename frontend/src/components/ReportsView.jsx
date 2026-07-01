import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ReactECharts from 'echarts-for-react';
import { 
  Building2, 
  Download, 
  Calendar, 
  TrendingUp, 
  Award
} from 'lucide-react';

const ReportsView = () => {
  const { locations, incidents, offices, devices } = useContext(AppContext);
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  // Filter locations by office
  const filteredLocations = selectedOffice === 'all'
    ? locations
    : locations.filter(loc => loc.officeId === parseInt(selectedOffice));

  // --- Chart 1: Bandwidth Over Time (Line Chart) ---
  const getBandwidthReportOption = () => {
    const days = timeRange === '7d' ? 7 : (timeRange === '30d' ? 30 : 90);
    const dateLabels = [];
    const inboundSpeeds = [];
    const outboundSpeeds = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      dateLabels.push(`${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()]}`);
      
      const baseIn = selectedOffice === '2' ? 180 : 340;
      const baseOut = selectedOffice === '2' ? 90 : 160;
      
      inboundSpeeds.push((baseIn + Math.random() * 80 - 40).toFixed(1));
      outboundSpeeds.push((baseOut + Math.random() * 40 - 20).toFixed(1));
    }

    return {
      title: {
        text: 'Tren Konsumsi Bandwidth Jaringan',
        subtext: 'Rata-rata kecepatan harian (Mbps)',
        textStyle: { color: '#ccc', fontSize: 14, fontWeight: 'bold', fontFamily: 'DM Sans, sans-serif' },
        subtextStyle: { color: '#666' }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        borderColor: '#27272a',
        textStyle: { color: '#fafafa' }
      },
      legend: {
        data: ['Trafik Masuk (Inbound)', 'Trafik Keluar (Outbound)'],
        textStyle: { color: '#888' },
        top: 25
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dateLabels,
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#888', rotate: days > 7 ? 45 : 0 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#888', formatter: '{value} Mbps' },
        splitLine: { lineStyle: { color: '#27272a', type: 'dashed' } }
      },
      series: [
        {
          name: 'Trafik Masuk (Inbound)',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: inboundSpeeds,
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 3 }
        },
        {
          name: 'Trafik Keluar (Outbound)',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: outboundSpeeds,
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 3 }
        }
      ]
    };
  };

  // --- Chart 2: Incidents per Office (Bar Chart) ---
  const getIncidentsReportOption = () => {
    const officeNames = offices.map(o => o.name);
    const incidentCounts = offices.map(o => {
      const officeLocs = locations.filter(l => l.officeId === o.id).map(l => l.id);
      return incidents.filter(i => officeLocs.includes(i.locationId)).length;
    });

    return {
      title: {
        text: 'Distribusi Tiket Insiden per Wilayah Kantor',
        subtext: 'Volume tiket kumulatif dalam periode terpilih',
        textStyle: { color: '#ccc', fontSize: 14, fontWeight: 'bold', fontFamily: 'DM Sans, sans-serif' },
        subtextStyle: { color: '#666' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        borderColor: '#27272a',
        textStyle: { color: '#fafafa' }
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: officeNames,
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#888', rotate: 20 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#27272a' } },
        axisLabel: { color: '#888' },
        splitLine: { lineStyle: { color: '#27272a', type: 'dashed' } }
      },
      series: [
        {
          name: 'Jumlah Insiden',
          type: 'bar',
          barWidth: '40%',
          data: incidentCounts,
          itemStyle: {
            color: '#e11d48',
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };
  };

  // --- Chart 3: Location Uptime breakdown (Pie Chart) ---
  const getUptimeReportOption = () => {
    const ok = filteredLocations.filter(l => l.status === 'OK').length;
    const warn = filteredLocations.filter(l => l.status === 'Warning').length;
    const crit = filteredLocations.filter(l => l.status === 'Critical').length;

    return {
      title: {
        text: 'Ketersediaan Titik Jaringan (Uptime)',
        subtext: 'Status operasional titik lokasi saat ini',
        textStyle: { color: '#ccc', fontSize: 14, fontWeight: 'bold', fontFamily: 'DM Sans, sans-serif' },
        subtextStyle: { color: '#666' }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        borderColor: '#27272a',
        textStyle: { color: '#fafafa' }
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: { color: '#888' }
      },
      series: [
        {
          name: 'Status Lokasi',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0c0c0f',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          data: [
            { value: ok, name: 'Normal (OK)', itemStyle: { color: '#10b981' } },
            { value: warn, name: 'Peringatan', itemStyle: { color: '#f59e0b' } },
            { value: crit, name: 'Kritis (Luring)', itemStyle: { color: '#ef4444' } }
          ]
        }
      ]
    };
  };

  const exportCSV = () => {
    alert("Metadata laporan berhasil diekspor. Unduhan CSV dipicu.");
  };

  const exportPDF = () => {
    alert("Mengekspor Laporan Kinerja Regional (PDF). Laporan ini mencakup daftar nama titik, koordinat spasial, dan alokasi batas bandwidth per kantor wilayah.");
  };

  return (
    <div className="space-y-6">
      {/* Builder Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex items-center gap-1 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-zinc-400" /> Pengelompokan Kantor:
          </div>

          <select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="all">Semua Wilayah</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs text-zinc-500 font-semibold uppercase tracking-wider pl-2">
            <Calendar className="w-4 h-4 text-zinc-400" /> Periode Waktu:
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-805 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={exportCSV}
            className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Ekspor CSV
          </button>
          <button
            onClick={exportPDF}
            className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" /> Unduh Dokumen PDF
          </button>
        </div>
      </div>

      {/* Analytical KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Uptime Rata-rata Titik</div>
          <div className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">98.42%</div>
          <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 text-emerald-500 font-sans">
            <TrendingUp className="w-3.5 h-3.5" /> Peningkatan +0.2% dibanding bulan lalu
          </div>
        </div>
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rata-rata Durasi Solusi</div>
          <div className="text-3xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">42 Menit</div>
          <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 text-emerald-500 font-sans">
            <TrendingUp className="w-3.5 h-3.5" /> Turun 50% (Goal Bisnis Terlampaui!)
          </div>
        </div>
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Kecepatan Bandwidth Puncak</div>
          <div className="text-3xl font-extrabold text-zinc-955 dark:text-zinc-55 mt-1">892.4 Mbps</div>
          <div className="text-xs text-zinc-450 mt-1">
            Tercatat di Jakarta Titik 02 (Core WAN)
          </div>
        </div>
      </div>

      {/* Analytical Charts Gallery */}
      <div className="space-y-6">
        
        {/* Row 1 */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <ReactECharts option={getBandwidthReportOption()} style={{ height: '320px', width: '100%' }} />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <ReactECharts option={getIncidentsReportOption()} style={{ height: '320px', width: '100%' }} />
          </div>
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <ReactECharts option={getUptimeReportOption()} style={{ height: '320px', width: '100%' }} />
          </div>
        </div>

        {/* Table of per-location metrics */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-widest">Tabel Metrik Kepatuhan Bandwidth per Titik</h3>
          <div className="overflow-x-auto max-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Titik Lokasi</th>
                  <th className="px-4 py-3">Uptime</th>
                  <th className="px-4 py-3">Trafik Saat Ini</th>
                  <th className="px-4 py-3">Batas Bandwidth (Mbps)</th>
                  <th className="px-4 py-3">Status Kepatuhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {filteredLocations.map(loc => {
                  const locDevs = devices.filter(d => d.locationId === loc.id && d.status === 'Online');
                  const totalIn = locDevs.reduce((acc, d) => acc + (parseFloat(d.bandwidthIn) || 0), 0);
                  const totalOut = locDevs.reduce((acc, d) => acc + (parseFloat(d.bandwidthOut) || 0), 0);
                  const avgSpeed = parseFloat((totalIn + totalOut).toFixed(1));
                  const usagePercent = loc.max_bandwidth_mbps > 0 ? Math.round((avgSpeed / loc.max_bandwidth_mbps) * 100) : 0;
                  
                  let complianceText = 'Patuh (Normal)';
                  let complianceBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';
                  if (usagePercent >= 100) {
                    complianceText = 'Beban Kritis (Overlimit)';
                    complianceBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-455';
                  } else if (usagePercent >= 80) {
                    complianceText = 'Beban Tinggi (Peringatan)';
                    complianceBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400';
                  }

                  return (
                    <tr key={loc.id} className="text-zinc-700 dark:text-zinc-300">
                      <td className="px-4 py-2.5 font-semibold">{loc.name}</td>
                      <td className="px-4 py-2.5 font-mono">{loc.status === 'Critical' ? '88.5%' : (loc.status === 'Warning' ? '97.2%' : '99.9%')}</td>
                      <td className="px-4 py-2.5 font-mono">{avgSpeed} Mbps</td>
                      <td className="px-4 py-2.5 font-mono">{loc.max_bandwidth_mbps} Mbps</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${complianceBadge}`}>
                          {complianceText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsView;
