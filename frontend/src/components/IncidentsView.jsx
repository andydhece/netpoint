import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  MapPin, 
  Cpu, 
  X, 
  Plus, 
  CheckSquare,
  Camera,
  RotateCcw,
  CheckCircle,
  PenLine
} from 'lucide-react';

const IncidentsView = ({ selectedLocationId, setSelectedLocationId }) => {
  const { 
    incidents, 
    locations, 
    devices, 
    offices,
    users,
    currentUser,
    assignTicket,
    updateTicketStatus,
    rejectTicket,
    addIncidentNote,
    createIncident,
    formatDate
  } = useContext(AppContext);

  // States
  const [activeIncidentId, setActiveIncidentId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  
  // onlyMyTickets syncs with role automatically
  const [onlyMyTickets, setOnlyMyTickets] = useState(currentUser.role === 'teknisi');
  useEffect(() => {
    setOnlyMyTickets(currentUser.role === 'teknisi');
  }, [currentUser.role]);

  // Assign dropdown
  const [selectedTech, setSelectedTech] = useState('Rian IT Support');

  // Modal states
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolvePhotoUrl, setResolvePhotoUrl] = useState('');
  const [resolveSignature, setResolveSignature] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [signatureSaved, setSignatureSaved] = useState(false);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const fileInputRef = useRef(null);

  const activeIncident = incidents.find(i => i.id === activeIncidentId) || null;

  // Technician list — dinamis dari users context (role teknisi, status aktif)
  const techniciansList = users
    ? users.filter(u => u.role === 'teknisi' && u.status === 'aktif').map(u => u.name)
    : ['Rian IT Support', 'Budi Utomo', 'Siti Aminah', 'Joko Susilo'];

  const getSlaTarget = (severity) => {
    if (severity === 'Critical') return '4 Jam';
    if (severity === 'High') return '8 Jam';
    if (severity === 'Medium') return '12 Jam';
    return '24 Jam';
  };

  // Filter logic
  const filteredIncidents = incidents.filter(inc => {
    const loc = locations.find(l => l.id === inc.locationId);
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;
    const matchesOffice = officeFilter === 'all' || (loc && loc.officeId === parseInt(officeFilter));
    const matchesLocation = !selectedLocationId || inc.locationId === selectedLocationId;
    const matchesMy = !onlyMyTickets || inc.assignedTo === currentUser.name;
    return matchesStatus && matchesSeverity && matchesOffice && matchesLocation && matchesMy;
  });

  const [newIncForm, setNewIncForm] = useState({
    title: '',
    severity: 'Medium',
    locationId: locations[0]?.id.toString() || '1',
    deviceId: '',
    assignedTo: 'Rian IT Support',
    note: ''
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newIncForm.title.trim()) return;
    createIncident(newIncForm);
    setIsNewIncidentOpen(false);
    setNewIncForm({
      title: '',
      severity: 'Medium',
      locationId: locations[0]?.id.toString() || '1',
      deviceId: '',
      assignedTo: 'Rian IT Support',
      note: ''
    });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeIncidentId) return;
    addIncidentNote(activeIncidentId, currentUser.name, newNoteText);
    setNewNoteText('');
  };

  // Canvas drawing
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    isDrawingRef.current = true;
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSignatureSaved(false);
    setResolveSignature('');
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    setResolveSignature(canvasRef.current.toDataURL('image/png'));
    setSignatureSaved(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setResolvePhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolveNotes.trim()) { alert("Catatan penyelesaian wajib diisi."); return; }
    if (!signatureSaved) { alert("Tanda tangan teknisi diperlukan sebelum submit."); return; }
    updateTicketStatus(activeIncidentId, 'Resolved', resolveNotes, resolvePhotoUrl, resolveSignature);
    setIsResolveOpen(false);
    setResolveNotes(''); setPhotoPreview(''); setSignatureSaved(false); setResolveSignature('');
    alert("Solusi berhasil dikirimkan. Menunggu verifikasi dari Admin.");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400';
      case 'Assigned': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Closed': return 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400';
      case 'Rejected': return 'bg-rose-50 text-rose-800 border-dashed border-rose-400 dark:bg-rose-950/10 dark:text-rose-500';
      default: return 'bg-zinc-50 text-zinc-500 border-zinc-200';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Low': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  const getRunbook = (inc) => {
    if (!inc) return [];
    const title = inc.title.toLowerCase();
    if (title.includes('offline') || title.includes('kegagalan') || title.includes('tidak merespons')) {
      return [
        { step: 1, text: 'Periksa koneksi kabel fisik dan catu daya di lokasi perangkat.' },
        { step: 2, text: 'Ping ke gateway default dan alamat loopback dari jaringan lokal.' },
        { step: 3, text: 'Verifikasi status interface WAN ISP pada panel kontrol perangkat.' },
        { step: 4, text: 'Lakukan force reboot melalui panel inventaris jika tidak merespons.' }
      ];
    }
    return [
      { step: 1, text: 'Periksa statistik interface untuk collision packet atau CRC error.' },
      { step: 2, text: 'Tinjau beban CPU dan penggunaan memori pada switch/AP yang bermasalah.' },
      { step: 3, text: 'Pastikan konfigurasi VLAN selaras dengan switch core.' },
      { step: 4, text: 'Dorong file konfigurasi terbaru menggunakan aksi massal perangkat.' }
    ];
  };

  return (
    <div className="flex gap-6 h-full items-start font-sans">
      {/* ===== LEFT: TICKET LIST ===== */}
      <div className={`transition-all duration-300 ${activeIncident ? 'w-3/5' : 'w-full'} flex flex-col space-y-4`}>
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Status filter tabs */}
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg text-[11px] font-semibold gap-0.5 flex-wrap">
              {['all', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === s
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {s === 'all' ? 'Semua' : s === 'Open' ? 'Terbuka' : s === 'In Progress' ? 'Progres' : s === 'Closed' ? 'Ditutup' : s === 'Assigned' ? 'Ditugaskan' : s}
                </button>
              ))}
            </div>

            {/* Severity filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Tingkat</option>
              <option value="Critical">Kritis</option>
              <option value="High">Tinggi</option>
              <option value="Medium">Sedang</option>
              <option value="Low">Rendah</option>
            </select>

            {/* Office filter */}
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">Semua Wilayah</option>
              {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>

            {/* My Tickets toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 ml-1">
              <input
                type="checkbox"
                checked={onlyMyTickets}
                onChange={(e) => setOnlyMyTickets(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-300 text-[#059669] accent-[#059669]"
              />
              Tugas Saya Saja
            </label>
          </div>

          {/* Create button – hidden for Pimpinan */}
          {currentUser.role !== 'pimpinan' && (
            <button
              onClick={() => setIsNewIncidentOpen(true)}
              className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Laporkan Insiden
            </button>
          )}
        </div>

        {/* Ticket Cards */}
        <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
          {filteredIncidents.map((inc) => {
            const loc = locations.find(l => l.id === inc.locationId);
            const dev = devices.find(d => d.id === inc.deviceId);
            const isActive = activeIncidentId === inc.id;

            return (
              <div
                key={inc.id}
                onClick={() => setActiveIncidentId(inc.id)}
                className={`p-4 bg-white dark:bg-[#0c0c0f] border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                  isActive
                    ? 'border-rose-400 ring-1 ring-rose-400/30 dark:border-rose-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded">
                      {inc.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity === 'Critical' ? 'Kritis' : inc.severity === 'High' ? 'Tinggi' : inc.severity === 'Medium' ? 'Sedang' : 'Rendah'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" /> SLA: {getSlaTarget(inc.severity)}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 mt-2 leading-snug">{inc.title}</h3>

                <div className="flex flex-wrap gap-4 text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {loc ? loc.name : 'Lokasi tidak diketahui'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> {dev ? dev.name : 'Tidak ada perangkat'}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {inc.assignedTo}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredIncidents.length === 0 && (
            <div className="text-center py-14 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold text-sm text-zinc-700 dark:text-zinc-300">Tidak ada tiket ditemukan</p>
              <p className="text-xs text-zinc-400 mt-1">Semua sistem beroperasi normal.</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT: DETAIL PANEL ===== */}
      {activeIncident && (
        <div className="w-2/5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col gap-4 max-h-[660px] overflow-y-auto relative">
          
          <button
            onClick={() => setActiveIncidentId(null)}
            className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div>
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> Triage Tiket Jaringan
            </div>
            <h2 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 leading-snug pr-6">
              {activeIncident.id}: {activeIncident.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(activeIncident.status)}`}>
                {activeIncident.status}
              </span>
              <span className="text-[10px] text-zinc-400">SLA: {getSlaTarget(activeIncident.severity)}</span>
              <span className="text-[10px] text-zinc-400">PJ: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{activeIncident.assignedTo}</span></span>
            </div>
          </div>

          <hr className="border-zinc-100 dark:border-zinc-800" />

          {/* ── ADMIN: Assign Panel ── */}
          {currentUser.role === 'admin' && ['Open', 'Assigned', 'Rejected'].includes(activeIncident.status) && (
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tugaskan Tiket ke Teknisi</p>
              <div className="flex gap-2">
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="flex-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  {techniciansList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button
                  onClick={() => assignTicket(activeIncident.id, selectedTech)}
                  className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                >
                  Tugaskan
                </button>
              </div>
            </div>
          )}

          {/* ── TEKNISI: Aksi Lapangan ── */}
          {(() => {
            // Cek apakah tiket ini milik teknisi yang sedang login
            const isMyTicket = currentUser.role === 'teknisi' && (
              activeIncident.assignedTo === currentUser.name ||
              activeIncident.assignedTo?.toLowerCase().includes(currentUser.name?.toLowerCase())
            );
            // Admin bisa lihat semua action
            const isAdmin = currentUser.role === 'admin';
            const canStart = ['Assigned', 'Open', 'Rejected'].includes(activeIncident.status);
            const canResolve = activeIncident.status === 'In Progress';

            if (!isMyTicket && !isAdmin) return null;
            if (isAdmin) return null; // Admin punya panel sendiri di atas

            return (
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Aksi Teknisi Lapangan</p>
                <div className="flex gap-2">
                  {canStart && (
                    <button
                      onClick={() => updateTicketStatus(activeIncident.id, 'In Progress', 'Pekerjaan dimulai oleh teknisi.')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold"
                    >
                      Mulai Pengerjaan (In Progress)
                    </button>
                  )}
                  {canResolve && (
                    <button
                      onClick={() => setIsResolveOpen(true)}
                      className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-2 rounded-lg text-xs font-bold"
                    >
                      Selesaikan Tiket (Resolve)
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── ADMIN: Mulai Pengerjaan (shortcut tanpa perlu assign) ── */}
          {currentUser.role === 'admin' && ['Open', 'Assigned', 'Rejected'].includes(activeIncident.status) && (
            <div className="mt-1">
              <button
                onClick={() => updateTicketStatus(activeIncident.id, 'In Progress', `Status diubah ke In Progress oleh Admin.`)}
                className="w-full border border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Tandai Dalam Pengerjaan (In Progress)
              </button>
            </div>
          )}

          {/* ── ADMIN: Verifikasi Resolusi ── */}
          {currentUser.role === 'admin' && activeIncident.status === 'Resolved' && (
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verifikasi Solusi (Admin)</p>
              {activeIncident.evidencePhoto && (
                <div>
                  <p className="text-[10px] text-zinc-400 mb-1">Bukti Foto Pengerjaan:</p>
                  <img src={activeIncident.evidencePhoto} className="w-full h-28 object-cover rounded border border-zinc-200" alt="Bukti" />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { updateTicketStatus(activeIncident.id, 'Closed', 'Tiket ditutup setelah verifikasi admin.'); }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold"
                >
                  Setujui & Tutup Tiket
                </button>
                <button
                  onClick={() => setIsRejectOpen(true)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg text-xs font-bold"
                >
                  Tolak Solusi
                </button>
              </div>
            </div>
          )}

          {/* ── REJECT REASON ── */}
          {isRejectOpen && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-rose-700">Alasan Penolakan:</p>
              <textarea
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                rows={2}
                className="w-full border border-rose-300 bg-white rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-rose-400"
                placeholder="Jelaskan alasan solusi belum memuaskan..."
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsRejectOpen(false)} className="px-3 py-1 bg-white border text-xs text-zinc-500 rounded-lg">Batal</button>
                <button
                  onClick={() => {
                    if (!rejectReasonText.trim()) return;
                    rejectTicket(activeIncident.id, rejectReasonText);
                    setIsRejectOpen(false);
                    setRejectReasonText('');
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                >
                  Kirim Penolakan
                </button>
              </div>
            </div>
          )}

          {/* ── RUNBOOK ── */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Panduan Troubleshooting
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              {getRunbook(activeIncident).map(s => (
                <li key={s.step} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 font-bold text-[10px] flex items-center justify-center shrink-0">{s.step}</span>
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── NOTES / ACTIVITY LOG ── */}
          <div className="flex flex-col flex-1 min-h-0">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Catatan Aktivitas
            </p>
            <div className="overflow-y-auto space-y-2 max-h-40 pr-1 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-transparent rounded-lg p-2.5 mb-2">
              {activeIncident.notes.map((note, i) => (
                <div key={i} className="text-xs bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-semibold mb-1">
                    <span>{note.author}</span>
                    <span>{new Date(note.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{note.text}</p>
                </div>
              ))}
              {activeIncident.notes.length === 0 && (
                <p className="text-xs text-center text-zinc-400 py-4">Belum ada catatan aktivitas.</p>
              )}
            </div>
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Tambahkan catatan..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-white dark:bg-[#262626] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold">
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: NEW INCIDENT ===== */}
      {isNewIncidentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsNewIncidentOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">Laporkan Masalah Jaringan</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Judul Insiden</label>
                <input
                  type="text" required value={newIncForm.title}
                  onChange={(e) => setNewIncForm({ ...newIncForm, title: e.target.value })}
                  className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Switch offline karena korsleting"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Keparahan</label>
                  <select value={newIncForm.severity} onChange={(e) => setNewIncForm({ ...newIncForm, severity: e.target.value })}
                    className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm">
                    <option value="Critical">Kritis</option>
                    <option value="High">Tinggi</option>
                    <option value="Medium">Sedang</option>
                    <option value="Low">Rendah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Tugaskan Ke</label>
                  <select value={newIncForm.assignedTo} onChange={(e) => setNewIncForm({ ...newIncForm, assignedTo: e.target.value })}
                    className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm">
                    {techniciansList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Lokasi</label>
                  <select value={newIncForm.locationId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const firstDev = devices.find(d => d.locationId === parseInt(id));
                      setNewIncForm({ ...newIncForm, locationId: id, deviceId: firstDev?.id.toString() || '' });
                    }}
                    className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm">
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Perangkat</label>
                  <select value={newIncForm.deviceId} onChange={(e) => setNewIncForm({ ...newIncForm, deviceId: e.target.value })}
                    className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm">
                    <option value="">Tidak ada perangkat</option>
                    {devices.filter(d => d.locationId === parseInt(newIncForm.locationId)).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Catatan Awal</label>
                <textarea value={newIncForm.note} onChange={(e) => setNewIncForm({ ...newIncForm, note: e.target.value })}
                  rows={3} className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi kondisi jaringan, lampu indikator, dll..." />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsNewIncidentOpen(false)}
                  className="bg-white dark:bg-[#262626] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg px-4 py-2 text-xs font-semibold">
                  Batal
                </button>
                <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 py-2 text-xs font-semibold">
                  Buat Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: RESOLVE WITH EVIDENCE ===== */}
      {isResolveOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c0c0f] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-md p-6 relative my-8">
            <button onClick={() => setIsResolveOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Selesaikan Tiket & Upload Bukti
            </h3>
            <form onSubmit={handleResolveSubmit} className="space-y-4">
              
              {/* Catatan Penyelesaian */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Tindakan yang Dilakukan *</label>
                <textarea
                  required rows={3} value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsikan tindakan perbaikan yang dilakukan..."
                />
              </div>

              {/* Upload Foto Bukti */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Foto Bukti Pengerjaan (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-[#262626] border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Pilih Foto
                  </button>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  {photoPreview
                    ? <img src={photoPreview} className="w-16 h-12 object-cover rounded border border-zinc-200" alt="Preview" />
                    : <span className="text-[11px] text-zinc-400 italic">Belum ada foto</span>
                  }
                </div>
              </div>

              {/* Signature Pad */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><PenLine className="w-3.5 h-3.5" /> Tanda Tangan Teknisi *</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={clearCanvas} className="text-[10px] text-zinc-400 hover:text-rose-500 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Hapus
                    </button>
                    {!signatureSaved && (
                      <button type="button" onClick={saveSignature} className="text-[10px] text-emerald-600 font-bold">
                        Kunci Tanda Tangan
                      </button>
                    )}
                  </div>
                </label>
                <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-200 h-28 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={400} height={110}
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none block"
                  />
                  {!signatureSaved && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[11px] text-zinc-400 italic">Gambar tanda tangan di sini...</span>
                    </div>
                  )}
                  {signatureSaved && (
                    <div className="absolute bottom-1 right-2 text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                      ✓ Terkunci
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsResolveOpen(false)}
                  className="bg-white dark:bg-[#262626] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg px-4 py-2 text-xs font-semibold">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!signatureSaved}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    signatureSaved
                      ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-sm'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  Kirim Solusi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsView;
