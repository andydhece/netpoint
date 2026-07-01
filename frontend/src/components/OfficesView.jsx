import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  MapPin
} from 'lucide-react';

const OfficesView = () => {
  const { 
    offices, 
    locations, 
    devices, 
    currentUser,
    addOffice, 
    editOffice, 
    deleteOffice 
  } = useContext(AppContext);

  // States
  const [selectedOfficeId, setSelectedOfficeId] = useState(offices[0]?.id || null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [editForm, setEditForm] = useState({ id: null, name: '' });

  const activeOffice = offices.find(o => o.id === selectedOfficeId) || null;
  
  // Locations linked to the active office
  const officeLocations = activeOffice 
    ? locations.filter(l => l.officeId === activeOffice.id) 
    : [];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newOfficeName.trim()) return;
    addOffice(newOfficeName.trim());
    setNewOfficeName('');
    setIsAddOpen(false);
  };

  const handleOpenEdit = (office) => {
    setEditForm({ id: office.id, name: office.name });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    editOffice(editForm.id, editForm.name.trim());
    setIsEditOpen(false);
  };

  const handleDelete = (id) => {
    if (offices.length <= 1) {
      alert("Minimal harus terdapat satu entitas kantor wilayah.");
      return;
    }
    
    if (confirm("Apakah Anda yakin ingin menghapus kantor wilayah ini? Seluruh titik lokasi terdaftar di dalamnya akan dialihkan ke kantor wilayah default.")) {
      deleteOffice(id);
      if (selectedOfficeId === id) {
        const remaining = offices.filter(o => o.id !== id);
        setSelectedOfficeId(remaining[0]?.id || null);
      }
    }
  };

  return (
    <div className="flex gap-6 h-full items-start relative font-sans">
      {/* Left Column: Offices List Table */}
      <div className={`transition-all duration-300 ${activeOffice ? 'w-1/2' : 'w-full'} flex flex-col space-y-4`}>
        
        {/* Toolbar header */}
        <div className="flex justify-between items-center bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-zinc-955 dark:text-zinc-50 font-sans">Kantor Wilayah</h2>
            <p className="text-xs text-zinc-400">Kelola pengelompokan regional kantor cabang.</p>
          </div>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Wilayah
            </button>
          )}
        </div>

        {/* List Table */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex-1">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-[#0c0c0f] border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nama Wilayah</th>
                  <th className="px-5 py-3">Jumlah Titik</th>
                  <th className="px-5 py-3">Total Bandwidth</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                {offices.map((office) => {
                  const mappedCount = locations.filter(l => l.officeId === office.id).length;
                  const totalOfficeBw = locations.filter(l => l.officeId === office.id).reduce((sum, l) => sum + (l.max_bandwidth_mbps || 0), 0);
                  const isSelected = selectedOfficeId === office.id;

                  return (
                    <tr
                      key={office.id}
                      onClick={() => setSelectedOfficeId(office.id)}
                      className={`cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-955/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-200">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-zinc-400" />
                          {office.name}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300 font-medium">
                        {mappedCount} Titik
                      </td>
                      <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300 font-mono font-bold">
                        {totalOfficeBw} Mbps
                      </td>
                      <td className="px-5 py-4 text-right animate-none" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-3 justify-end items-center">
                          <button
                            onClick={() => setSelectedOfficeId(office.id)}
                            className="text-[11px] font-bold text-[#059669] hover:underline"
                          >
                            Lihat Titik Jaringan
                          </button>
                          {currentUser.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(office)}
                                className="p-1 hover:text-blue-500 text-zinc-400 transition-colors"
                                title="Ubah nama"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(office.id)}
                                className="p-1 hover:text-rose-500 text-zinc-400 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Office Association Details Panel */}
      {activeOffice && (
        <div className="w-1/2 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-5 flex flex-col h-[570px] transition-all duration-300 relative">
          
          <div>
            <div className="text-[10px] font-bold text-[#059669] uppercase tracking-widest flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Inventaris Wilayah Kantor
            </div>
            <h2 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50 mt-1">{activeOffice.name}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Daftar lokasi kantor cabang yang dikelompokkan di bawah wilayah ini.</p>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* List of locations assigned */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Titik Lokasi Terdaftar ({officeLocations.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {officeLocations.map((loc) => {
                const locDevs = devices.filter(d => d.locationId === loc.id);
                return (
                  <div
                    key={loc.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200">{loc.name}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Instalasi: {loc.installationDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-semibold font-mono">
                        {locDevs.length} Perangkat
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        loc.status === 'OK' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20' 
                          : (loc.status === 'Warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20')
                      }`}>
                        {loc.status === 'OK' ? 'OK' : (loc.status === 'Warning' ? 'Peringatan' : 'Kritis')}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {officeLocations.length === 0 && (
                <div className="text-center py-12 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-lg text-zinc-400">
                  <p className="text-xs font-sans">Belum ada lokasi kantor cabang yang terhubung ke wilayah ini.</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Ubah wilayah pada data lokasi untuk mengaitkannya.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD OFFICE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-sm p-6 relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Buat Entitas Wilayah</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Wilayah Kantor</label>
                <input
                  type="text"
                  required
                  value={newOfficeName}
                  onChange={(e) => setNewOfficeName(e.target.value)}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  placeholder="Contoh: Kantor Cabang Bali"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
                >
                  Buat Wilayah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OFFICE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-sm p-6 relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Ubah Nama Wilayah</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Wilayah Kantor</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-955 dark:text-zinc-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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

export default OfficesView;
