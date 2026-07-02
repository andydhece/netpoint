import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Users, Plus, Pencil, Trash2, X, ShieldCheck, Shield, Wrench,
  CheckCircle2, XCircle, Search
} from 'lucide-react';

const ROLE_META = {
  admin:    { label: 'Administrator', color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400', icon: ShieldCheck },
  pimpinan: { label: 'Pimpinan',      color: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400', icon: Shield },
  teknisi:  { label: 'Teknisi',       color: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400', icon: Wrench },
};

const emptyForm = { name: '', username: '', password: 'netpoint2024', role: 'teknisi', jabatan: '', status: 'aktif' };

const UserManagementView = () => {
  const { users, currentUser, addUser, editUser, deleteUser } = useContext(AppContext);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Panel states
  const [panelMode, setPanelMode] = useState(null); // 'add' | 'edit' | 'delete' | null
  const [targetUser, setTargetUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setPanelMode('add');
  };

  const handleOpenEdit = (user) => {
    setTargetUser(user);
    setForm({ name: user.name, username: user.username, password: user.password || '', role: user.role, jabatan: user.jabatan || '', status: user.status });
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
    // Check duplicate username (excluding self on edit)
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
    // Don't overwrite password if blank on edit
    const updates = { ...form, name: form.name.trim(), username: form.username.trim() };
    if (!form.password.trim()) delete updates.password;
    editUser(targetUser.id, updates);
    setPanelMode(null);
  };

  const handleDeleteConfirm = () => {
    if (targetUser.id === currentUser.id) return; // can't delete self
    deleteUser(targetUser.id);
    setPanelMode(null);
  };

  const FormFields = ({ isEdit = false }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
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
    <div className="flex gap-6 h-full items-start font-sans">
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
                {r === 'all' ? 'Semua' : ROLE_META[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Username</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Peran</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Jabatan</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Dibuat</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filtered.map(user => {
                const meta = ROLE_META[user.role] || ROLE_META.teknisi;
                const RoleIcon = meta.icon;
                const isSelf = currentUser && user.id === currentUser.id;
                return (
                  <tr key={user.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors ${isSelf ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          user.role === 'admin' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' :
                          user.role === 'pimpinan' ? 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400' :
                          'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                            {user.name}
                            {isSelf && <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Anda</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded font-mono">{user.username}</code>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
                        <RoleIcon className="w-3 h-3" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{user.jabatan || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        user.status === 'aktif'
                          ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {user.status === 'aktif'
                          ? <><CheckCircle2 className="w-3 h-3" /> Aktif</>
                          : <><XCircle className="w-3 h-3" /> Nonaktif</>}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-zinc-400 font-mono">{user.createdAt}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                          title="Edit pengguna"
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
                  <td colSpan={7} className="text-center py-12 text-zinc-400 text-xs">
                    <Users className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    Tidak ada pengguna yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  );
};

export default UserManagementView;
