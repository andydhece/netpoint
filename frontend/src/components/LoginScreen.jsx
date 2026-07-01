import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Eye, EyeOff, Network, ShieldCheck, Activity, Globe } from 'lucide-react';

const LoginScreen = () => {
  const { login } = useContext(AppContext);
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  // Generate animated network nodes for background
  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 6
    }));
    setParticles(pts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network
    const result = login(form.username.trim(), form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  const demoCredentials = [
    {
      label: 'Administrator',
      username: import.meta.env.VITE_SEED_ADMIN_USERNAME || 'admin',
      password: import.meta.env.VITE_SEED_ADMIN_PASSWORD || 'admin123',
      color: 'from-rose-500 to-orange-500'
    },
    {
      label: 'Pimpinan',
      username: import.meta.env.VITE_SEED_PIMPINAN_USERNAME || 'pimpinan',
      password: import.meta.env.VITE_SEED_PIMPINAN_PASSWORD || 'pimpinan123',
      color: 'from-violet-500 to-blue-500'
    },
    {
      label: 'Teknisi',
      username: 'rian',
      password: import.meta.env.VITE_SEED_TEKNISI_PASSWORD || 'teknisi123',
      color: 'from-emerald-500 to-teal-500'
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#080a0e] overflow-hidden relative font-sans">

      {/* ── Animated Network Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(5,150,105,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(5,150,105,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />

        {/* Glowing network nodes */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.id % 3 === 0 ? '#059669' : p.id % 3 === 1 ? '#7c3aed' : '#0ea5e9',
              boxShadow: `0 0 ${p.size * 3}px ${p.id % 3 === 0 ? '#059669' : p.id % 3 === 1 ? '#7c3aed' : '#0ea5e9'}`,
              animation: `pulse ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-900/20 rounded-full blur-3xl" />
      </div>

      {/* ── LEFT PANEL: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative p-12 xl:p-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">Net</span>
            <span className="text-xl font-black text-emerald-400 tracking-tight">Point</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Sistem Monitoring Aktif</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Pusat Kendali<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Jaringan
              </span>{' '}
              <span className="text-white">Nasional</span>
            </h1>
            <p className="mt-4 text-lg text-zinc-400 leading-relaxed max-w-md">
              Monitoring terpusat untuk 54 titik lokasi jaringan. Pantau, kelola, dan selesaikan insiden secara real-time.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {[
              { icon: Activity, label: 'Real-time Monitoring', desc: 'Status jaringan langsung' },
              { icon: ShieldCheck, label: 'Manajemen Insiden', desc: 'Ticketing & SLA tracking' },
              { icon: Globe, label: 'Peta Interaktif', desc: '54 titik tervisualisasi' },
              { icon: Network, label: 'Inventaris Perangkat', desc: 'Kontrol terpusat' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/8 transition-colors group">
                <Icon className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="flex items-center gap-8">
          {[
            { value: '54', label: 'Titik Lokasi' },
            { value: '99.7%', label: 'Uptime SLA' },
            { value: '5', label: 'Kantor Wilayah' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-black text-emerald-400">{s.value}</div>
              <div className="text-xs text-zinc-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-white">Net</span>
              <span className="text-lg font-black text-emerald-400">Point</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-white">Masuk ke Sistem</h2>
              <p className="text-sm text-zinc-400 mt-1">Masukkan kredensial akun Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(''); }}
                  placeholder="Masukkan username"
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
                    placeholder="Masukkan password"
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-rose-950/60 border border-rose-800/60 rounded-lg px-4 py-2.5 text-xs text-rose-400 font-medium">
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40 text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </span>
                ) : 'Masuk ke NetPoint'}
              </button>
            </form>
          </div>

          {/* Demo Credentials */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
              🔑 Kredensial Demo — Klik untuk Isi Otomatis
            </p>
            <div className="space-y-2">
              {demoCredentials.map(c => (
                <button
                  key={c.username}
                  type="button"
                  onClick={() => { setForm({ username: c.username, password: c.password }); setError(''); }}
                  className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3.5 py-2.5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${c.color}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{c.label}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{c.username} / {c.password}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">Pilih →</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-zinc-700">
            NetPoint v3.0 · Centralized Network Management System
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
