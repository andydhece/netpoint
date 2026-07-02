import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Package, 
  Plus, 
  Search, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Warehouse, 
  ArrowDownRight,
  ArrowUpRight,
  X
} from 'lucide-react';

const SparePartsView = () => {
  const { spareparts, sparepartUsage, locations, restockSparePart, formatDate, currentUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSp, setSelectedSp] = useState(null);
  
  // Restock Form State
  const [restockAmount, setRestockAmount] = useState('10');
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  // Filter lists
  const filteredParts = spareparts.filter(sp => {
    const matchesSearch = sp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sp.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedSp || !restockAmount || parseInt(restockAmount) <= 0) return;
    restockSparePart(selectedSp.id, restockAmount);
    setIsRestockOpen(false);
    setSelectedSp(null);
    alert(`Stok untuk ${selectedSp.name} berhasil ditambahkan.`);
  };

  // Get status color styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Tersedia':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Menipis':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Habis':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-955/20 dark:text-rose-400';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Inventaris Suku Cadang</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Pengelolaan stok cadangan hardware perangkat untuk perbaikan jaringan.</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100/40 dark:bg-emerald-950/20 text-emerald-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Item Suku Cadang</div>
            <div className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-0.5">{spareparts.length} Jenis</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100/40 dark:bg-amber-950/20 text-amber-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Perlu Restock (Menipis/Habis)</div>
            <div className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-0.5">
              {spareparts.filter(s => s.status !== 'Tersedia').length} Item
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100/40 dark:bg-blue-955/20 text-blue-500 rounded-lg">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gudang Penyimpanan</div>
            <div className="text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-0.5">4 Lokasi</div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="flex gap-6 items-start font-sans">
        
        {/* Left Side: Spare Parts Table List */}
        <div className={`transition-all duration-300 ${isRestockOpen ? 'w-3/5' : 'w-2/3'} space-y-4`}>
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama suku cadang atau jenis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-955 dark:text-zinc-50"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Status Stok</option>
              <option value="Tersedia">Tersedia (Normal)</option>
              <option value="Menipis">Menipis (Peringatan)</option>
              <option value="Habis">Habis (Kritis)</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-zinc-55 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nama Barang</th>
                  <th className="px-5 py-3">Jenis</th>
                  <th className="px-5 py-3">Lokasi Penyimpanan</th>
                  <th className="px-5 py-3 text-center">Stok / Batas</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {filteredParts.map((sp) => (
                  <tr key={sp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-200">{sp.name}</td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{sp.type}</td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 font-sans text-xs">
                      <div className="flex items-center gap-1.5"><Warehouse className="w-3.5 h-3.5 text-zinc-400" /> {sp.locationStorage}</div>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold">
                      <span className={sp.stock <= sp.threshold ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-300'}>
                        {sp.stock}
                      </span>
                      <span className="text-zinc-400 font-normal text-xs"> / {sp.threshold}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(sp.status)}`}>
                        {sp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedSp(sp);
                            setIsRestockOpen(true);
                          }}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-[#059669]/10 text-zinc-750 dark:text-zinc-200 hover:text-[#059669] border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                        >
                          Pasok Stok
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Log OR Restock Panel */}
        <div className={`transition-all duration-300 ${isRestockOpen ? 'w-2/5' : 'w-1/3'}`}>
          {isRestockOpen && selectedSp ? (
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col h-[580px]">
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                <div>
                  <div className="text-[10px] font-bold text-[#059669] uppercase tracking-widest flex items-center gap-1 mb-1">
                    <Plus className="w-3 h-3" /> Pasok Ulang Stok
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{selectedSp.name}</h3>
                </div>
                <button
                  onClick={() => {
                    setIsRestockOpen(false);
                    setSelectedSp(null);
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Jumlah Pasokan Stok (Qty)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669] text-zinc-950 dark:text-zinc-50 font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRestockOpen(false);
                      setSelectedSp(null);
                    }}
                    className="flex-1 bg-white dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#059669] hover:bg-[#047857] text-white rounded-lg py-2 text-xs font-semibold shadow-sm transition-colors"
                  >
                    Tambahkan Stok
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col h-[580px]">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-zinc-400" /> Riwayat Mutasi Stok
              </h3>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                {sparepartUsage.map((log) => {
                  const sp = spareparts.find(s => s.id === log.sparepartId);
                  const loc = locations.find(l => l.id === log.locationId);
                  const isRestock = log.quantityUsed < 0; // negative quantity used represents addition
                  
                  return (
                    <div key={log.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                          {sp ? sp.name : 'Unknown Item'}
                        </span>
                        <div className="text-[10px] text-zinc-400 space-y-0.5">
                          <p>Lokasi: {loc ? loc.name : 'Gudang Pusat'}</p>
                          <p>Keterangan: {log.maintenanceId}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`inline-flex items-center font-mono font-bold text-xs gap-0.5 px-2 py-0.5 rounded ${
                          isRestock 
                            ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-rose-100/50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400'
                        }`}>
                          {isRestock ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" /> +{Math.abs(log.quantityUsed)}
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5" /> -{log.quantityUsed}
                            </>
                          )}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-1 font-mono">{formatDate(log.date)}</span>
                      </div>
                    </div>
                  );
                })}

                {sparepartUsage.length === 0 && (
                  <p className="text-xs text-center text-zinc-405 p-8">Belum ada aktivitas mutasi stok.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SparePartsView;
