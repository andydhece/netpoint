// g:\netpoint\frontend\src\components\UserManagementView.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Users, Plus, Pencil, Trash2, X, ShieldCheck, Shield, Wrench,
  CheckCircle2, XCircle, Search, Database, Download, RotateCcw, Upload
} from 'lucide-react';

const ROLE_META = {
  admin:    { label: 'Administrator', color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400', icon: ShieldCheck },
  pimpinan: { label: 'Pimpinan',      color: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400', icon: Shield },
  teknisi:  { label: 'Teknisi',       color: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400', icon: Wrench },
};

const emptyForm = { name: '', username: '', password: 'netpoint2024', role: 'teknisi', jabatan: '', status: 'aktif', avatar: '' };

const UserManagementView = () => {
  const { 
    users, 
    currentUser, 
    addUser, 
    editUser, 
    deleteUser,
    getBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    uploadRestoreBackup,
    getImageUrl
  } = useContext(AppContext);

  // Tab State
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'backup'

  // User tab states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [panelMode, setPanelMode] = useState(null); // 'add' | 'edit' | 'delete' | null
  const [targetUser, setTargetUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  // Backup tab states
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState('');
  const [isUploadingRestore, setIsUploadingRestore] = useState(false);

  const fetchBackups = async () => {
    setLoadingBackups(true);
    const list = await getBackups();
    setBackups(list || []);
    setLoadingBackups(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'backup') {
      fetchBackups();
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleOpenAdd = () => {
    setForm({ ...emptyForm, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face' });
    setFormError('');
    setPanelMode('add');
  };

  const handleOpenEdit = (user) => {
    setTargetUser(user);
    setForm({ name: user.name, username: user.username, password: user.password || '', role: user.role, jabatan: user.jabatan || '', status: user.status, avatar: user.avatar || '' });
    setFormError('');
    setPanelMode('edit');
  };

  const handleOpenDelete = (user) => {
    setTargetUser(user);
    setPanelMode('delete');
  };

  const validateForm = (isEdit = false) => {
    if (!form.name.trim()) return 'Nama lengkap wajib diisi.';
    if (!form.username.trim()) return 'Username wajib diisi.';
    if (!isEdit && !form.password.trim()) return 'Password wajib diisi untuk pengguna baru.';
    const duplicate = users.find(u => u.username === form.username.trim() && (!isEdit || u.id !== targetUser?.id));
    if (duplicate) return `Username "${form.username}" sudah dipakai oleh pengguna lain.`;
    return null;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const err = validateForm(false);
    if (err) { setFormError(err); return; }
    addUser({ ...form, name: form.name.trim(), username: form.username.trim() });
    setPanelMode(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const err = validateForm(true);
    if (err) { setFormError(err); return; }
    const updates = { ...form, name: form.name.trim(), username: form.username.trim() };
    if (!form.password.trim()) delete updates.password;
    editUser(targetUser.id, updates);
    setPanelMode(null);
  };

  const handleDeleteConfirm = () => {
    if (targetUser.id === currentUser.id) return;
    deleteUser(targetUser.id);
    setPanelMode(null);
  };

  // Backup handlers
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      await createBackup();
      await fetchBackups();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (filename) => {
    if (!window.confirm(`Apakah Anda yakin ingin memulihkan database dari ${filename}? Semua data saat ini akan ditimpa.`)) {
      return;
    }
    setRestoringFilename(filename);
    try {
      await restoreBackup(filename);
      alert(`Database berhasil dipulihkan dari ${filename}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setRestoringFilename('');
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Hapus file backup ${filename}?`)) {
      return;
    }
    try {
      await deleteBackup(filename);
      await fetchBackups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm("Apakah Anda yakin ingin memulihkan database menggunakan file SQL ini? Semua data saat ini akan ditimpa.")) {
      return;
    }
    setIsUploadingRestore(true);
    try {
      await uploadRestoreBackup(file);
      alert("Database berhasil dipulihkan dari file SQL yang diunggah!");
      e.target.value = null;
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingRestore(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const FormFields = ({ isEdit = false }) => (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-2 gap-3">
        {/* Avatar upload preview section */}
        <div className="col-span-2 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-750 bg-white flex-shrink-0">
            <img 
              src={getImageUrl(form.avatar)} 
              alt="Preview" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face';
              }}
            />
          </div>
          <div className="flex-1">
            <span className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Foto Profil</span>
            <label className="inline-flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded px-2.5 py-1.5 text-[11px] font-bold shadow-sm hover:bg-zinc-55 dark:hover:bg-zinc-700 transition-colors cursor-pointer select-none">
              <Upload className="w-3 h-3 text-[#059669]" />
              Pilih Foto
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Nama Lengkap *</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormError(''); }}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669]"
            placeholder="Contoh: Budi Santoso"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Username *</label>
          <input
            type="text" required value={form.username}
            onChange={(e) => { setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') }); setFormError(''); }}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669] font-mono"
            placeholder="contoh: budi123"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
            Password {isEdit && <span className="font-normal text-zinc-400">(kosongkan jika tidak diubah)</span>}
          </label>
          <input
            type="text" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669] font-mono"
            placeholder="netpoint2024"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Peran *</label>
          <select
            value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="admin">Administrator</option>
            <option value="pimpinan">Pimpinan</option>
            <option value="teknisi">Teknisi</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Status Akun</label>
          <select
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">Jabatan</label>
          <input
            type="text" value={form.jabatan}
            onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669]"
            placeholder="Contoh: Teknisi Lapangan Senior"
          />
        </div>
      </div>

      {formError && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs rounded-lg px-3 py-2.5">
          ⚠ {formError}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 h-full font-sans">
      {/* Top Tab Bar Navigation */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-xl w-fit border border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-0.5 shadow-inner">
        <button
          onClick={() => handleTabChange('users')}
          className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-350'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#059669]" /> Manajemen Pengguna
        </button>
        <button
          onClick={() => handleTabChange('backup')}
          className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-50 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-750 dark:hover:text-zinc-350'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#059669]" /> Cadangkan & Pulihkan Database
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === 'users' ? (
        <div className="flex gap-6 h-full items-start">
          {/* Left: User Table */}
          <div className={`transition-all duration-300 ${panelMode ? 'w-3/5' : 'w-full'} flex flex-col space-y-5`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                            bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#059669]" /> Manajemen Pengguna
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">{users.length} akun terdaftar di sistem</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="bg-[#059669] hover:bg-[#047857] text-white rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Pengguna
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau username..."
                  className="w-full bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg text-[11px] font-semibold gap-0.5">
                {['all', 'admin', 'pimpinan', 'teknisi'].map(r => (
                  <button key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-md transition-all ${
                      roleFilter === r
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 font-semibold">
                      <th className="px-5 py-3">Nama</th>
                      <th className="px-5 py-3">Username</th>
                      <th className="px-5 py-3">Peran</th>
                      <th className="px-5 py-3">Jabatan</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filtered.map(user => {
                      const isSelf = user.id === currentUser.id;
                      const role = ROLE_META[user.role] || { label: user.role, color: 'bg-zinc-100 text-zinc-700' };
                      const RoleIcon = role.icon || Users;

                      return (
                        <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/35 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={getImageUrl(user.avatar)}
                                alt={user.name}
                                className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-850"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face';
                                }}
                              />
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                                  {user.name}
                                  {isSelf && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider dark:bg-emerald-950/30 dark:text-emerald-400">
                                      Saya
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono font-medium text-zinc-500 dark:text-zinc-400">{user.username}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${role.color}`}>
                              <RoleIcon className="w-3 h-3" />
                              {role.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{user.jabatan || '-'}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              user.status === 'aktif'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'aktif' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                              {user.status || 'aktif'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                                title="Edit profil pengguna"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(user)}
                                disabled={isSelf}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus pengguna'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs">
                          <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                          Tidak ada pengguna yang sesuai filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Sliding Panel */}
          {panelMode && (
            <div className="w-2/5 bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col transition-all duration-300 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-[#0c0c0f] z-10">
                <div>
                  <div className="text-[10px] font-bold text-[#059669] uppercase tracking-widest flex items-center gap-1 mb-1">
                    {panelMode === 'delete'
                      ? <><Trash2 className="w-3 h-3 text-rose-500" /> <span className="text-rose-500">Hapus Pengguna</span></>
                      : <><Plus className="w-3 h-3" /> {panelMode === 'add' ? 'Pengguna Baru' : 'Edit Pengguna'}</>}
                  </div>
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                    {panelMode === 'add' ? 'Tambah Pengguna Baru'
                      : panelMode === 'edit' ? `Edit — ${targetUser?.name}`
                      : 'Konfirmasi Hapus Akun'}
                  </h2>
                </div>
                <button onClick={() => setPanelMode(null)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg mt-0.5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Delete Confirmation */}
              {panelMode === 'delete' && targetUser && (
                <div className="p-5 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mt-4">
                    <Trash2 className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{targetUser.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Akun <strong>({targetUser.username})</strong> akan dihapus permanen dari sistem.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full mt-2">
                    <button onClick={() => setPanelMode(null)}
                      className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg py-2.5 text-xs font-semibold">
                      Batal
                    </button>
                    <button onClick={handleDeleteConfirm}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2.5 text-xs font-bold">
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Add / Edit Form */}
              {(panelMode === 'add' || panelMode === 'edit') && (
                <form onSubmit={panelMode === 'add' ? handleAddSubmit : handleEditSubmit} className="p-5 space-y-4 flex-1">
                  <FormFields isEdit={panelMode === 'edit'} />
                  <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button type="button" onClick={() => setPanelMode(null)}
                      className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg py-2 text-xs font-semibold">
                      Batal
                    </button>
                    <button type="submit"
                      className={`flex-1 rounded-lg py-2 text-xs font-bold text-white ${
                        panelMode === 'add' ? 'bg-[#059669] hover:bg-[#047857]' : 'bg-blue-600 hover:bg-blue-700'
                      }`}>
                      {panelMode === 'add' ? 'Simpan Pengguna' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Database Backup & Restore Tab Layout */
        <div className="flex flex-col space-y-5 w-full">
          {/* Header Dashboard */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
                          bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#059669]" /> Cadangkan & Pulihkan Database
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Kelola salinan data cadangan database MySQL NetPoint Anda</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {/* Upload file restore */}
              <label className="flex items-center gap-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg px-4 py-2.5 text-xs font-bold shadow-sm transition-colors cursor-pointer select-none">
                <Upload className="w-3.5 h-3.5" /> 
                {isUploadingRestore ? 'Merestore...' : 'Unggah & Restore'}
                <input type="file" accept=".sql" onChange={handleUploadRestore} className="hidden" disabled={isUploadingRestore || restoringFilename} />
              </label>
              <button
                onClick={handleCreateBackup}
                disabled={isBackingUp || restoringFilename || isUploadingRestore}
                className="bg-[#059669] hover:bg-[#047857] disabled:bg-zinc-400 text-white rounded-lg px-4 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 
                {isBackingUp ? 'Membuat Backup...' : 'Buat Backup Baru'}
              </button>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 font-semibold">
                    <th className="px-5 py-3">Nama File</th>
                    <th className="px-5 py-3">Tanggal Dibuat</th>
                    <th className="px-5 py-3">Ukuran</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {backups.map(b => (
                    <tr key={b.filename} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/35 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-zinc-950 dark:text-zinc-100">{b.filename}</td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{b.date}</td>
                      <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{formatBytes(b.size)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <a 
                            href={`http://localhost:8081/backups/${b.filename}`}
                            download 
                            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                            title="Unduh File SQL"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleRestore(b.filename)}
                            disabled={isBackingUp || restoringFilename || isUploadingRestore}
                            className="p-1.5 text-zinc-400 hover:text-[#059669] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors disabled:opacity-30"
                            title="Restore Data ke DB"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${restoringFilename === b.filename ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(b.filename)}
                            disabled={isBackingUp || restoringFilename || isUploadingRestore}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors disabled:opacity-30"
                            title="Hapus File Backup"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {backups.length === 0 && !loadingBackups && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-zinc-400 text-xs">
                        <Database className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                        Belum ada cadangan data yang tersimpan. Klik "Buat Backup Baru" untuk memulai.
                      </td>
                    </tr>
                  )}
                  {loadingBackups && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-zinc-400 text-xs animate-pulse">
                        Memuat daftar cadangan data...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
