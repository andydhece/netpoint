import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  Plus, 
  MapPin, 
  Cpu, 
  User, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  X,
  FileText,
  Camera,
  Signature,
  FileImage
} from 'lucide-react';

const MaintenanceView = () => {
  const { 
    maintenance, 
    locations, 
    devices, 
    spareparts,
    currentUser,
    scheduleMaintenance, 
    completeMaintenanceReport, 
    deleteMaintenance,
    formatDate
  } = useContext(AppContext);

  // States
  const [activeMntTab, setActiveMntTab] = useState('upcoming'); 
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [activeReportMnt, setActiveReportMnt] = useState(null); 

  // Scheduler Form State
  const [schedForm, setSchedForm] = useState({
    title: '',
    locationId: locations[0]?.id.toString() || '1',
    deviceId: '',
    scheduledDate: '',
    performedBy: 'Aditya IT Support'
  });

  // Report Logging Form State
  const [reportForm, setReportForm] = useState({
    performedBy: '',
    actionsTaken: '',
    outcome: 'Successful',
    photoUrl: '',
    signatureUrl: '',
    useSparePart: false,
    sparepartId: '',
    sparepartQty: '1'
  });

  // Photo Input Ref & State
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Signature Canvas Drawing State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);

  // Handle default device mapping in scheduler form
  useEffect(() => {
    const locDevs = devices.filter(d => d.locationId === parseInt(schedForm.locationId));
    setSchedForm(prev => ({
      ...prev,
      deviceId: locDevs[0]?.id.toString() || ''
    }));
  }, [schedForm.locationId, devices]);

  // Upcoming maintenance (Scheduled or Overdue)
  const upcomingMaintenance = maintenance.filter(m => m.status === 'Scheduled' || m.status === 'Overdue');
  // Completed maintenance
  const completedMaintenance = maintenance.filter(m => m.status === 'Completed');

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!schedForm.title.trim() || !schedForm.scheduledDate) return;
    scheduleMaintenance(schedForm);
    setIsScheduleOpen(false);
    setSchedForm(prev => ({
      ...prev,
      title: '',
      scheduledDate: ''
    }));
  };

  // --- Image Upload Converter (Base64) ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setReportForm(prev => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // --- Signature Pad Canvas Handlers ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; 

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); 
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
    setReportForm(prev => ({ ...prev, signatureUrl: '' }));
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64Sig = canvas.toDataURL('image/png');
    setReportForm(prev => ({ ...prev, signatureUrl: base64Sig }));
    setSignatureSaved(true);
  };

  const handleOpenReportModal = (mnt) => {
    setActiveReportMnt(mnt);
    setReportForm({
      performedBy: mnt.performedBy || 'Aditya IT Support',
      actionsTaken: '',
      outcome: 'Successful',
      photoUrl: '',
      signatureUrl: '',
      useSparePart: false,
      sparepartId: spareparts[0]?.id.toString() || '',
      sparepartQty: '1'
    });
    setPhotoPreview('');
    setSignatureSaved(false);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.actionsTaken.trim()) {
      alert("Tindakan pemeliharaan yang dilakukan wajib diisi.");
      return;
    }
    if (!reportForm.signatureUrl) {
      alert("Tanda tangan teknisi diperlukan sebagai verifikasi.");
      return;
    }
    
    completeMaintenanceReport(activeReportMnt.id, reportForm);
    setActiveReportMnt(null);
    alert("Laporan pemeliharaan berhasil dikirim. Status titik terbarui.");
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Navigation tabs */}
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg flex text-xs font-semibold shadow-inner">
          <button
            onClick={() => setActiveMntTab('upcoming')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${
              activeMntTab === 'upcoming' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Jadwal Audit Mendatang ({upcomingMaintenance.length})
          </button>
          <button
            onClick={() => setActiveMntTab('history')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-1.5 ${
              activeMntTab === 'history' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Laporan Riwayat Audit ({completedMaintenance.length})
          </button>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 font-medium text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Jadwalkan Pemeliharaan
          </button>
        )}
      </div>

      {/* Main List Container */}
      <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-6">
        
        {/* UPCOMING MAINTENANCE */}
        {activeMntTab === 'upcoming' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Antrean Pemeliharaan & Audit Rutin</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMaintenance.map((mnt) => {
                const loc = locations.find(l => l.id === mnt.locationId);
                const dev = devices.find(d => d.id === mnt.deviceId);
                const isOverdue = mnt.status === 'Overdue';

                return (
                  <div 
                    key={mnt.id} 
                    className={`p-4 border rounded-xl flex flex-col justify-between ${
                      isOverdue 
                        ? 'border-rose-200 dark:border-rose-955 bg-rose-50/20' 
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded">
                          {mnt.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isOverdue ? 'bg-rose-100 text-rose-800 dark:bg-rose-955/35' : 'bg-blue-100 text-blue-800 dark:bg-blue-955/35'
                        }`}>
                          {mnt.status === 'Overdue' ? 'Terlambat' : 'Terjadwal'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-zinc-955 dark:text-zinc-50 mt-2">{mnt.title}</h3>
                      
                      <div className="space-y-1.5 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {loc ? loc.name : 'Unknown Site'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-zinc-400" /> {dev ? `${dev.name} (${dev.type})` : 'Seluruh titik jaringan local'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" /> Teknisi PJ: {mnt.performedBy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-3">
                      <span className="text-[10px] font-semibold text-zinc-405">
                        Tgl Target: <span className="font-mono text-zinc-600 dark:text-zinc-350">{formatDate(mnt.scheduledDate)}</span>
                      </span>
                      <div className="flex gap-2">
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => deleteMaintenance(mnt.id)}
                            className="p-1.5 hover:text-rose-500 text-zinc-450 dark:text-zinc-500 transition-colors"
                            title="Batalkan audit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {currentUser.role !== 'pimpinan' && (
                          <button
                            onClick={() => handleOpenReportModal(mnt)}
                            className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-3 py-1.5 text-[10px] font-bold shadow-sm transition-colors"
                          >
                            Kirim Laporan Penyelesaian
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {upcomingMaintenance.length === 0 && (
                <div className="col-span-2 text-center py-10 text-zinc-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                  <p className="font-bold text-sm">Tidak ada agenda pemeliharaan.</p>
                  <p className="text-xs text-zinc-500 mt-1">Seluruh audit titik telah dipenuhi.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MAINTENANCE HISTORY */}
        {activeMntTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Laporan Riwayat Audit Masuk</h2>
            
            <div className="space-y-4">
              {completedMaintenance.map((mnt) => {
                const loc = locations.find(l => l.id === mnt.locationId);
                const dev = devices.find(d => d.id === mnt.deviceId);

                return (
                  <div key={mnt.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-zinc-150 dark:border-zinc-800/80">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-zinc-205 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                          {mnt.id}
                        </span>
                        <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 mt-1">{mnt.title}</h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">
                        Tanggal Rampung: {formatDate(mnt.completedDate)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <h4 className="font-bold text-zinc-400 mb-1">Cakupan Pemeliharaan:</h4>
                        <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
                          <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {loc ? loc.name : 'Unknown'}</p>
                          <p className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-zinc-400" /> {dev ? dev.name : 'Semua perangkat local'}</p>
                          <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-zinc-400" /> Teknisi: {mnt.performedBy}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-zinc-400 mb-1">Tindakan & Hasil Audit:</h4>
                        <p className="text-zinc-750 dark:text-zinc-200 font-semibold">{mnt.actionsTaken}</p>
                        <p className="text-[10px] text-[#059669] mt-1 font-semibold">Hasil Akhir: {
                          mnt.outcome === 'Successful' ? 'Berhasil (Beroperasi Normal)' : (mnt.outcome === 'Degraded' ? 'Terdegradasi (Perlu Tindak Lanjut)' : 'Gagal (Luring)')
                        }</p>
                      </div>

                      {/* Evidence Photo and Signature */}
                      <div className="flex gap-4 justify-end">
                        {mnt.photoUrl && (
                          <div className="text-center">
                            <h5 className="font-bold text-[9px] text-zinc-400 uppercase mb-1">Bukti Foto</h5>
                            <div className="w-20 h-16 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 overflow-hidden flex items-center justify-center">
                              {mnt.photoUrl === 'simulated_battery_photo' ? (
                                <FileImage className="w-6 h-6 text-zinc-400" />
                              ) : (
                                <img src={mnt.photoUrl} className="w-full h-full object-cover" alt="Bukti Lapangan" />
                              )}
                            </div>
                          </div>
                        )}
                        
                        {mnt.signatureUrl && (
                          <div className="text-center">
                            <h5 className="font-bold text-[9px] text-zinc-400 uppercase mb-1">Tanda Tangan</h5>
                            <div className="w-20 h-16 rounded border border-zinc-200 dark:border-zinc-800 bg-white overflow-hidden flex items-center justify-center p-1">
                              {mnt.signatureUrl === 'simulated_sig' ? (
                                <Signature className="w-6 h-6 text-zinc-400" />
                              ) : (
                                <img src={mnt.signatureUrl} className="w-full h-full object-contain" alt="Verifikasi" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {completedMaintenance.length === 0 && (
                <div className="text-center py-10 text-zinc-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-zinc-350" />
                  <p className="font-bold text-sm">Belum ada riwayat laporan masuk.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MAINTENANCE MODAL */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsScheduleOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Jadwalkan Pemeliharaan</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  value={schedForm.title}
                  onChange={(e) => setSchedForm({ ...schedForm, title: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  placeholder="Contoh: Audit berkala core switch LAN"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Lokasi Sasaran</label>
                  <select
                    value={schedForm.locationId}
                    onChange={(e) => setSchedForm({ ...schedForm, locationId: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Perangkat</label>
                  <select
                    value={schedForm.deviceId}
                    onChange={(e) => setSchedForm({ ...schedForm, deviceId: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                  >
                    <option value="">Seluruh jaringan lokasi</option>
                    {devices.filter(d => d.locationId === parseInt(schedForm.locationId)).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tanggal Audit</label>
                  <input
                    type="date"
                    required
                    value={schedForm.scheduledDate}
                    onChange={(e) => setSchedForm({ ...schedForm, scheduledDate: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-955 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Teknisi</label>
                  <input
                    type="text"
                    required
                    value={schedForm.performedBy}
                    onChange={(e) => setSchedForm({ ...schedForm, performedBy: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
                >
                  Jadwalkan Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILE ACTION REPORT MODAL */}
      {activeReportMnt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg p-6 relative my-8">
            <button
              onClick={() => setActiveReportMnt(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1 font-sans">Kirim Laporan Penyelesaian Audit</h3>
            <p className="text-xs text-zinc-400 mb-4">{activeReportMnt.id}: {activeReportMnt.title}</p>
            
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nama Teknisi Pemeriksa</label>
                  <input
                    type="text"
                    required
                    value={reportForm.performedBy}
                    onChange={(e) => setReportForm({ ...reportForm, performedBy: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Hasil Akhir Audit</label>
                  <select
                    value={reportForm.outcome}
                    onChange={(e) => setReportForm({ ...reportForm, outcome: e.target.value })}
                    className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
                  >
                    <option value="Successful">Berhasil (Beroperasi Normal)</option>
                    <option value="Degraded">Terdegradasi (Perlu Tindak Lanjut)</option>
                    <option value="Unsuccessful">Gagal (Luring, Perlu Penggantian Suku Cadang)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tindakan Pemeliharaan yang Dilakukan</label>
                <textarea
                  required
                  rows="3"
                  value={reportForm.actionsTaken}
                  onChange={(e) => setReportForm({ ...reportForm, actionsTaken: e.target.value })}
                  className="w-full bg-[#ffffff] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-950 dark:text-zinc-55"
                  placeholder="Deskripsikan pembersihan perangkat, verifikasi kabel optik, uji transfer daya cadangan..."
                ></textarea>
              </div>

              {/* Spare Part utilization */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-2 text-xs">
                <label className="flex items-center gap-2 font-semibold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={reportForm.useSparePart}
                    onChange={(e) => setReportForm({ ...reportForm, useSparePart: e.target.checked })}
                    className="w-4 h-4 text-[#059669] border-zinc-350 rounded"
                  />
                  <span>Gunakan Suku Cadang Jaringan (Spare Part)</span>
                </label>
                
                {reportForm.useSparePart && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Pilih Item Suku Cadang</label>
                      <select
                        value={reportForm.sparepartId}
                        onChange={(e) => setReportForm({ ...reportForm, sparepartId: e.target.value })}
                        className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-850 dark:text-zinc-100"
                      >
                        {spareparts.map(sp => (
                          <option key={sp.id} value={sp.id} disabled={sp.stock <= 0}>
                            {sp.name} (Stok: {sp.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Jumlah Digunakan (Qty)</label>
                      <input
                        type="number"
                        min="1"
                        max={spareparts.find(s => s.id === parseInt(reportForm.sparepartId))?.stock || 99}
                        value={reportForm.sparepartQty}
                        onChange={(e) => setReportForm({ ...reportForm, sparepartQty: e.target.value })}
                        className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-950 dark:text-zinc-50 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Upload Row */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  <Camera className="w-3.5 h-3.5 inline mr-1" /> Unggah Foto Bukti Kerja
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    Pilih Foto Bukti
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {photoPreview ? (
                    <div className="w-16 h-12 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden shadow-inner bg-zinc-50">
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Preview Bukti" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-450 italic">Belum ada foto yang diunggah.</span>
                  )}
                </div>
              </div>

              {/* Signature Canvas Drawing */}
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 flex items-center justify-between">
                  <span><Signature className="w-3.5 h-3.5 inline mr-1" /> Tanda Tangan Verifikasi Teknisi</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[10px] text-zinc-400 hover:text-rose-500"
                    >
                      Hapus Pad
                    </button>
                    {!signatureSaved && (
                      <button
                        type="button"
                        onClick={saveSignature}
                        className="text-[10px] text-emerald-500 font-bold"
                      >
                        Kunci Tanda Tangan
                      </button>
                    )}
                  </div>
                </label>

                {/* Canvas Drawing Surface */}
                <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-100 dark:bg-zinc-200 h-28 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair block touch-none"
                  />
                  {signatureSaved && (
                    <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 pointer-events-none flex items-center justify-center">
                      <span className="text-emerald-700 dark:text-emerald-500 bg-white dark:bg-zinc-900 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        ✓ Tanda Tangan Terkunci
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-zinc-450 mt-1 italic">
                  Gambar tanda tangan menggunakan mouse/sentuhan jari Anda. Klik "Kunci Tanda Tangan" sebelum menyimpan.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-805">
                <button
                  type="button"
                  onClick={() => setActiveReportMnt(null)}
                  className="bg-[#ffffff] dark:bg-[#262626] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-xs font-semibold"
                >
                  Buang Draft
                </button>
                <button
                  type="submit"
                  disabled={!signatureSaved}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${
                    signatureSaved 
                      ? 'bg-[#059669] hover:bg-[#047857] text-white cursor-pointer' 
                      : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Simpan Laporan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceView;
