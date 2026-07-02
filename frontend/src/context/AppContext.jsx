// g:\netpoint\frontend\src\context\AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const API_BASE = 'http://localhost:8081/api';

// Helper to make API requests with credentials (sessions)
export const apiRequest = async (url, options = {}) => {
  options.credentials = 'include';
  if (!options.headers) {
    options.headers = {};
  }
  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server');
  }
  return data;
};

// Helper to format date
const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const AppProvider = ({ children }) => {
  // State variables (populated from API)
  const [offices, setOffices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [sparepartUsage, setSparepartUsage] = useState([]);
  const [technicianHistory, setTechnicianHistory] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState(['Router', 'Switch', 'Access Point']);
  
  // Auth state - initialized from localStorage for fast loading, verified by API
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('netpoint_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Client-only ephemeral notifications
  const [notifications, setNotifications] = useState([]);

  // Load app data from database on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const data = await apiRequest(`${API_BASE}/init.php`);
        
        setOffices(data.offices);
        setLocations(data.locations);
        setDevices(data.devices);
        setSpareparts(data.spareparts);
        setSparepartUsage(data.sparepartUsage);
        setTechnicianHistory(data.technicianHistory);
        setDeviceHistory(data.deviceHistory);
        setIncidents(data.incidents);
        setMaintenance(data.maintenance);
        setUsers(data.users);
        if (data.deviceTypes && data.deviceTypes.length > 0) {
          setDeviceTypes(data.deviceTypes);
        }
        
        // Sync active backend session user
        if (data.currentUser) {
          setCurrentUser(data.currentUser);
          localStorage.setItem('netpoint_session', JSON.stringify(data.currentUser));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('netpoint_session');
        }
      } catch (err) {
        console.error("Gagal memuat data awal dari backend:", err);
      }
    };
    initApp();
  }, []);

  // --- DARK MODE THEME ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('netpoint_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('netpoint_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Toast Notification Helper
  const addNotification = (title, text) => {
    const newNotif = {
      id: Date.now(),
      title,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Helper function to resolve static/uploads assets URL
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('blob:')) return url;
    return `http://localhost:8081${url}`;
  };

  // --- HELPER FUNCTION: Recalculate Location health based on devices ---
  const updateLocationHealth = (locId, currentDevices = devices) => {
    setLocations(prev => {
      return prev.map(loc => {
        if (loc.id === locId) {
          const locDevs = currentDevices.filter(d => d.locationId === locId);
          const hasOffline = locDevs.some(d => d.status === 'Offline');
          const hasWarning = locDevs.some(d => d.status === 'Warning');
          
          let newStatus = 'OK';
          if (hasOffline) newStatus = 'Critical';
          else if (hasWarning) newStatus = 'Warning';

          return { ...loc, status: newStatus };
        }
        return loc;
      });
    });
  };

  // --- CRUD ACTIONS ---

  // --- Offices ---
  const addOffice = async (name) => {
    try {
      const res = await apiRequest(`${API_BASE}/offices.php?action=add`, {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      setOffices(prev => [...prev, { id: res.id, name: res.name }]);
      addNotification('Kantor Ditambahkan', `Kantor ${res.name} berhasil dibuat.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const editOffice = async (id, name) => {
    try {
      await apiRequest(`${API_BASE}/offices.php?action=edit`, {
        method: 'POST',
        body: JSON.stringify({ id, name })
      });
      setOffices(prev => prev.map(o => o.id === id ? { ...o, name } : o));
      addNotification('Kantor Diperbarui', `Nama kantor berhasil diubah.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteOffice = async (id) => {
    try {
      await apiRequest(`${API_BASE}/offices.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      setOffices(prev => prev.filter(o => o.id !== id));
      setLocations(prev => prev.map(loc => loc.officeId === id ? { ...loc, officeId: 1 } : loc));
      addNotification('Kantor Dihapus', `Kantor berhasil dihapus.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Locations ---
  const addLocation = async (locData) => {
    try {
      const res = await apiRequest(`${API_BASE}/locations.php?action=add`, {
        method: 'POST',
        body: JSON.stringify(locData)
      });
      const newLoc = res.location;
      setLocations(prev => [...prev, newLoc]);
      
      // Seed history locally for immediate update
      setDeviceHistory(prev => [
        {
          locationId: newLoc.id,
          deviceName: 'Instalasi Awal Titik',
          date: newLoc.installationDate,
          action: 'Inisialisasi Penempatan Titik Cabang Baru',
          technician: locData.picName || 'IT Pusat'
        },
        ...prev
      ]);
      addNotification('Lokasi Baru', `Titik ${newLoc.name} berhasil didaftarkan.`);
      return newLoc.id;
    } catch (err) {
      alert(err.message);
    }
  };

  const editLocation = async (id, updatedData) => {
    try {
      await apiRequest(`${API_BASE}/locations.php?action=edit`, {
        method: 'POST',
        body: JSON.stringify({ id, ...updatedData })
      });
      
      setLocations(prev => prev.map(loc => loc.id === id ? {
        ...loc,
        name: updatedData.name,
        officeId: parseInt(updatedData.officeId),
        installationDate: updatedData.installationDate,
        latitude: parseFloat(updatedData.latitude) || loc.latitude,
        longitude: parseFloat(updatedData.longitude) || loc.longitude,
        picName: updatedData.picName,
        picContact: updatedData.picContact,
        picPosition: updatedData.picPosition,
        max_bandwidth_mbps: parseInt(updatedData.max_bandwidth_mbps) || loc.max_bandwidth_mbps,
        category: updatedData.category || loc.category
      } : loc));
      
      setDevices(prev => prev.map(d => d.locationId === id ? { ...d, officeId: parseInt(updatedData.officeId) } : d));
      addNotification('Lokasi Diperbarui', `Informasi titik berhasil diperbarui.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteLocation = async (id) => {
    try {
      await apiRequest(`${API_BASE}/locations.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      
      setLocations(prev => prev.filter(l => l.id !== id));
      setDevices(prev => prev.filter(d => d.locationId !== id));
      setIncidents(prev => prev.filter(i => i.locationId !== id));
      setMaintenance(prev => prev.filter(m => m.locationId !== id));
      setTechnicianHistory(prev => prev.filter(h => h.locationId !== id));
      setDeviceHistory(prev => prev.filter(h => h.locationId !== id));
      
      addNotification('Lokasi Dihapus', `Titik lokasi berhasil dihapus dari sistem.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Devices ---
  const addDevice = async (devData) => {
    try {
      const res = await apiRequest(`${API_BASE}/devices.php?action=add`, {
        method: 'POST',
        body: JSON.stringify(devData)
      });
      
      const newDev = res.device;
      const updatedDevices = [...devices, newDev];
      setDevices(updatedDevices);
      
      // Update local location device count
      setLocations(prev => prev.map(l => l.id === newDev.locationId ? { ...l, deviceCount: l.deviceCount + 1 } : l));
      
      // Local history update
      setDeviceHistory(prev => [
        {
          locationId: newDev.locationId,
          deviceName: newDev.name,
          date: new Date().toISOString().split('T')[0],
          action: 'Instalasi Perangkat Baru',
          technician: currentUser?.name || 'IT Support'
        },
        ...prev
      ]);
      
      updateLocationHealth(newDev.locationId, updatedDevices);
      addNotification('Perangkat Ditambahkan', `Perangkat ${newDev.name} berhasil terdaftar.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const editDevice = async (id, updatedData) => {
    try {
      await apiRequest(`${API_BASE}/devices.php?action=edit`, {
        method: 'POST',
        body: JSON.stringify({ id, ...updatedData })
      });

      const oldDev = devices.find(d => d.id === id);
      const oldLocId = oldDev ? oldDev.locationId : 0;
      const newLocId = parseInt(updatedData.locationId);

      const updatedDevices = devices.map(d => d.id === id ? {
        ...d,
        name: updatedData.name,
        type: updatedData.type,
        locationId: newLocId,
        ipAddress: updatedData.ipAddress,
        firmware: updatedData.firmware,
        status: updatedData.status
      } : d);

      setDevices(updatedDevices);

      // Update local location counters if changed
      if (oldLocId && oldLocId !== newLocId) {
        setLocations(prev => prev.map(l => {
          if (l.id === oldLocId) return { ...l, deviceCount: Math.max(0, l.deviceCount - 1) };
          if (l.id === newLocId) return { ...l, deviceCount: l.deviceCount + 1 };
          return l;
        }));
        
        setDeviceHistory(prev => [
          {
            locationId: newLocId,
            deviceName: updatedData.name,
            date: new Date().toISOString().split('T')[0],
            action: 'Relokasi Perangkat',
            technician: currentUser?.name || 'IT Support'
          },
          ...prev
        ]);
      }

      updateLocationHealth(newLocId, updatedDevices);
      if (oldLocId && oldLocId !== newLocId) {
        updateLocationHealth(oldLocId, updatedDevices);
      }
      
      addNotification('Perangkat Diperbarui', `Konfigurasi perangkat berhasil disimpan.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteDevice = async (id) => {
    try {
      const dev = devices.find(d => d.id === id);
      if (!dev) return;

      await apiRequest(`${API_BASE}/devices.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });

      const updatedDevices = devices.filter(d => d.id !== id);
      setDevices(updatedDevices);
      
      setLocations(prev => prev.map(l => l.id === dev.locationId ? { ...l, deviceCount: Math.max(0, l.deviceCount - 1) } : l));
      
      setDeviceHistory(prev => [
        {
          locationId: dev.locationId,
          deviceName: dev.name,
          date: new Date().toISOString().split('T')[0],
          action: 'Deinstalasi Perangkat',
          technician: currentUser?.name || 'IT Support'
        },
        ...prev
      ]);
      
      updateLocationHealth(dev.locationId, updatedDevices);
      addNotification('Perangkat Dihapus', `Perangkat telah dibersihkan dari database.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const bulkRebootDevices = async (ids) => {
    try {
      await apiRequest(`${API_BASE}/devices.php?action=reboot`, {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      
      setDevices(prev => prev.map(d => ids.includes(d.id) ? { ...d, uptime: '0hari 0jam', cpuUsage: 10, ramUsage: 35 } : d));
      addNotification('Reboot Terkirim', `${ids.length} perangkat dikirim instruksi reboot.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const bulkPushConfig = async (ids) => {
    try {
      await apiRequest(`${API_BASE}/devices.php?action=push_config`, {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      addNotification('Konfigurasi Didorong', `Skema konfig berhasil didorong ke ${ids.length} perangkat.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Auth & Session ---
  const login = async (username, password) => {
    try {
      const res = await apiRequest(`${API_BASE}/auth.php?action=login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setCurrentUser(res.user);
      localStorage.setItem('netpoint_session', JSON.stringify(res.user));
      addNotification('Login Berhasil', `Selamat datang kembali, ${res.user.name}!`);
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await apiRequest(`${API_BASE}/auth.php?action=logout`, { method: 'POST' });
    } catch (err) {
      console.error("Kesalahan saat logout:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem('netpoint_session');
  };

  // --- User Management ---
  const addUser = async (userData) => {
    try {
      const res = await apiRequest(`${API_BASE}/users.php?action=add`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      setUsers(prev => [...prev, res.user]);
      addNotification('User Terdaftar', `Akun ${res.user.username} berhasil dibuat.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const editUser = async (userId, updatedData) => {
    try {
      await apiRequest(`${API_BASE}/users.php?action=edit`, {
        method: 'POST',
        body: JSON.stringify({ id: userId, ...updatedData })
      });
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
      
      if (currentUser && currentUser.id === userId) {
        const updated = { ...currentUser, ...updatedData };
        setCurrentUser(updated);
        localStorage.setItem('netpoint_session', JSON.stringify(updated));
      }
      addNotification('User Diperbarui', `Informasi profil user berhasil disimpan.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await apiRequest(`${API_BASE}/users.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ id: userId })
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
      addNotification('User Dihapus', `Akun user berhasil dihapus dari sistem.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Incidents & Tickets ---
  const createIncident = async (incData) => {
    try {
      const res = await apiRequest(`${API_BASE}/incidents.php?action=create`, {
        method: 'POST',
        body: JSON.stringify(incData)
      });
      
      setIncidents(prev => [...prev, res.incident]);
      
      // Update location status locally
      const locStatus = incData.severity === 'Critical' ? 'Critical' : 'Warning';
      setLocations(prev => prev.map(l => l.id === parseInt(incData.locationId) ? { ...l, status: locStatus } : l));
      
      addNotification('Insiden Dilaporkan', `Tiket ${res.incident.id} berhasil diajukan.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const acknowledgeIncident = async (id) => {
    try {
      await apiRequest(`${API_BASE}/incidents.php?action=acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      
      const userName = currentUser?.name || 'Teknisi';
      setIncidents(prev => prev.map(inc => inc.id === id ? {
        ...inc,
        status: 'in progress',
        assignedTo: userName,
        timeline: [...inc.timeline, { text: `Tiket diterima oleh ${userName}.`, time: new Date().toISOString() }]
      } : inc));
      
      addNotification('Tiket Diterima', `Tiket insiden ${id} sekarang sedang Anda tangani.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const resolveIncident = async (id, solution) => {
    try {
      await apiRequest(`${API_BASE}/incidents.php?action=resolve`, {
        method: 'POST',
        body: JSON.stringify({ id, solution })
      });
      
      const userName = currentUser?.name || 'Teknisi';
      setIncidents(prev => {
        const next = prev.map(inc => {
          if (inc.id === id) {
            const notes = inc.notes || [];
            return {
              ...inc,
              status: 'resolved',
              notes: [...notes, { author: userName, text: `SOLUSI DIAJUKAN: ${solution}`, time: new Date().toISOString() }],
              timeline: [...inc.timeline, { text: `Tiket ditandai selesai oleh ${userName}.`, time: new Date().toISOString() }]
            };
          }
          return inc;
        });

        // Set location status back to OK locally if no other open incidents exist
        const targetInc = prev.find(i => i.id === id);
        if (targetInc) {
          const otherOpen = next.filter(i => i.locationId === targetInc.locationId && i.status !== 'resolved' && i.status !== 'closed' && i.id !== id);
          if (otherOpen.length === 0) {
            setLocations(lPrev => lPrev.map(l => l.id === targetInc.locationId ? { ...l, status: 'OK' } : l));
          }
        }
        return next;
      });

      addNotification('Tiket Diselesaikan', `Solusi untuk tiket ${id} telah diajukan ke admin.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const addIncidentNote = async (id, text) => {
    try {
      await apiRequest(`${API_BASE}/incidents.php?action=add_note`, {
        method: 'POST',
        body: JSON.stringify({ id, text })
      });
      
      const userName = currentUser?.name || 'System';
      setIncidents(prev => prev.map(inc => {
        if (inc.id === id) {
          const notes = inc.notes || [];
          return {
            ...inc,
            notes: [...notes, { author: userName, text, time: new Date().toISOString() }]
          };
        }
        return inc;
      }));
      addNotification('Catatan Ditambahkan', `Catatan baru ditambahkan pada tiket ${id}.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const assignTicket = async (id, assignee) => {
    try {
      await apiRequest(`${API_BASE}/incidents.php?action=assign`, {
        method: 'POST',
        body: JSON.stringify({ id, assignee })
      });
      
      const userName = currentUser?.name || 'Admin';
      setIncidents(prev => prev.map(inc => inc.id === id ? {
        ...inc,
        status: 'assigned',
        assignedTo: assignee,
        timeline: [...inc.timeline, { text: `Tiket ditugaskan ke ${assignee} oleh ${userName}.`, time: new Date().toISOString() }]
      } : inc));
      addNotification('Tiket Ditugaskan', `Tiket ${id} ditugaskan kepada ${assignee}.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateTicketStatus = async (id, status) => {
    try {
      await apiRequest(`${API_BASE}/incidents.php?action=update_status`, {
        method: 'POST',
        body: JSON.stringify({ id, status })
      });
      
      const userName = currentUser?.name || 'System';
      setIncidents(prev => prev.map(inc => inc.id === id ? {
        ...inc,
        status,
        timeline: [...inc.timeline, { text: `Status tiket diubah menjadi ${status} oleh ${userName}.`, time: new Date().toISOString() }]
      } : inc));
    } catch (err) {
      alert(err.message);
    }
  };

  const rejectTicket = async (id, reason) => {
    try {
      await apiRequest(`${API_BASE}/incidents.php?action=reject`, {
        method: 'POST',
        body: JSON.stringify({ id, reason })
      });
      
      const userName = currentUser?.name || 'Admin';
      setIncidents(prev => prev.map(inc => {
        if (inc.id === id) {
          const notes = inc.notes || [];
          return {
            ...inc,
            status: 'Rejected',
            notes: [...notes, { author: userName, text: `PENOLAKAN SOLUSI: ${reason}`, time: new Date().toISOString() }],
            timeline: [...inc.timeline, { text: `Solusi tiket ditolak oleh ${userName} dengan alasan: ${reason}`, time: new Date().toISOString() }]
          };
        }
        return inc;
      }));
      addNotification('Solusi Ditolak', `Solusi untuk tiket ${id} telah ditolak.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Maintenance / Audit Scheduling ---
  const scheduleMaintenance = async (mntData) => {
    try {
      const res = await apiRequest(`${API_BASE}/maintenance.php?action=schedule`, {
        method: 'POST',
        body: JSON.stringify(mntData)
      });
      setMaintenance(prev => [res.maintenance, ...prev]);
      addNotification('Jadwal Ditambahkan', `Jadwal pemeliharaan berhasil didaftarkan.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const completeMaintenanceReport = async (id, reportData) => {
    try {
      await apiRequest(`${API_BASE}/maintenance.php?action=complete`, {
        method: 'POST',
        body: JSON.stringify({ id, ...reportData })
      });
      
      const mnt = maintenance.find(m => m.id === id);
      if (!mnt) return;

      // Local update maintenance report logs
      setMaintenance(prev => prev.map(item => item.id === id ? {
        ...item,
        status: 'Completed',
        performedBy: reportData.performedBy,
        actionsTaken: reportData.actionsTaken,
        outcome: reportData.outcome,
        photoUrl: reportData.photoUrl,
        signatureUrl: reportData.signatureUrl,
        completedDate: new Date().toISOString().split('T')[0]
      } : item));

      // Local update selected spare part stock locally
      const spId = parseInt(reportData.sparepartId);
      const qtyUsed = parseInt(reportData.sparepartQty);
      if (spId && qtyUsed > 0) {
        setSpareparts(prev => prev.map(sp => {
          if (sp.id === spId) {
            const nextStock = Math.max(0, sp.stock - qtyUsed);
            let nextStatus = 'Tersedia';
            if (nextStock === 0) nextStatus = 'Habis';
            else if (nextStock <= sp.threshold) nextStatus = 'Menipis';
            return { ...sp, stock: nextStock, status: nextStatus };
          }
          return sp;
        }));

        setSparepartUsage(prev => [
          {
            id: `USG-${Date.now()}`,
            maintenanceId: id,
            sparepartId: spId,
            quantityUsed: qtyUsed,
            date: new Date().toISOString().split('T')[0],
            locationId: mnt.locationId
          },
          ...prev
        ]);
      }

      // Local technician history insert
      setTechnicianHistory(prev => [
        {
          locationId: mnt.locationId,
          name: reportData.performedBy,
          date: new Date().toISOString().split('T')[0],
          action: `${mnt.title} - ${reportData.actionsTaken.slice(0, 45)}...`
        },
        ...prev
      ]);

      // Local device history log replacement
      const lowerTitle = mnt.title.toLowerCase();
      const lowerActions = reportData.actionsTaken.toLowerCase();
      if (lowerTitle.includes('ganti') || lowerTitle.includes('pasang') || lowerActions.includes('ganti') || lowerActions.includes('mengganti')) {
        const dev = devices.find(d => d.id === mnt.deviceId);
        setDeviceHistory(prev => [
          {
            locationId: mnt.locationId,
            deviceName: dev ? dev.name : 'Perangkat Jaringan',
            date: new Date().toISOString().split('T')[0],
            action: mnt.title,
            technician: reportData.performedBy
          },
          ...prev
        ]);
      }
      
      addNotification('Laporan Terkirim', `Laporan audit pemeliharaan untuk ${mnt.title} berhasil disimpan.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteMaintenance = async (id) => {
    try {
      await apiRequest(`${API_BASE}/maintenance.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      setMaintenance(prev => prev.filter(m => m.id !== id));
      addNotification('Jadwal Dihapus', `Jadwal pemeliharaan berhasil dihapus.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Spare Parts ---
  const restockSparePart = async (id, amount) => {
    try {
      await apiRequest(`${API_BASE}/spareparts.php?action=restock`, {
        method: 'POST',
        body: JSON.stringify({ id, amount })
      });

      setSpareparts(prev => prev.map(sp => {
        if (sp.id === id) {
          const nextStock = sp.stock + parseInt(amount);
          let nextStatus = 'Tersedia';
          if (nextStock === 0) nextStatus = 'Habis';
          else if (nextStock <= sp.threshold) nextStatus = 'Menipis';
          return { ...sp, stock: nextStock, status: nextStatus };
        }
        return sp;
      }));

      setSparepartUsage(prev => [
        {
          id: `RESTOCK-${Date.now()}`,
          maintenanceId: 'Pemasokan Stok',
          sparepartId: id,
          quantityUsed: -parseInt(amount),
          date: new Date().toISOString().split('T')[0],
          locationId: 1
        },
        ...prev
      ]);
      addNotification('Restock Berhasil', `Stok barang berhasil dipasok.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Device Types ---
  const addDeviceType = async (newType) => {
    if (!newType.trim()) return;
    const cleanType = newType.trim();
    if (deviceTypes.includes(cleanType)) return;

    try {
      await apiRequest(`${API_BASE}/device_types.php?action=add`, {
        method: 'POST',
        body: JSON.stringify({ name: cleanType })
      });
      setDeviceTypes(prev => [...prev, cleanType]);
      addNotification('Tipe Perangkat Ditambahkan', `Tipe perangkat ${cleanType} siap digunakan.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteDeviceType = async (typeToDelete) => {
    try {
      await apiRequest(`${API_BASE}/device_types.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ name: typeToDelete })
      });
      setDeviceTypes(prev => prev.filter(t => t !== typeToDelete));
      addNotification('Tipe Perangkat Dihapus', `Tipe perangkat ${typeToDelete} dihapus dari referensi.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Database Backup & Restore ---
  const getBackups = async () => {
    try {
      const res = await apiRequest(`${API_BASE}/database.php?action=list`);
      return res.backups;
    } catch (err) {
      alert(err.message);
      return [];
    }
  };

  const createBackup = async () => {
    try {
      const res = await apiRequest(`${API_BASE}/database.php?action=backup`, {
        method: 'POST'
      });
      addNotification('Backup Sukses', `File ${res.backup.filename} berhasil dibuat.`);
      return res.backup;
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const restoreBackup = async (filename) => {
    try {
      await apiRequest(`${API_BASE}/database.php?action=restore`, {
        method: 'POST',
        body: JSON.stringify({ filename })
      });
      addNotification('Restore Sukses', `Database berhasil dipulihkan dari ${filename}.`);
      
      const data = await apiRequest(`${API_BASE}/init.php`);
      setOffices(data.offices);
      setLocations(data.locations);
      setDevices(data.devices);
      setSpareparts(data.spareparts);
      setSparepartUsage(data.sparepartUsage);
      setTechnicianHistory(data.technicianHistory);
      setDeviceHistory(data.deviceHistory);
      setIncidents(data.incidents);
      setMaintenance(data.maintenance);
      setUsers(data.users);
      if (data.deviceTypes && data.deviceTypes.length > 0) {
        setDeviceTypes(data.deviceTypes);
      }
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const deleteBackup = async (filename) => {
    try {
      await apiRequest(`${API_BASE}/database.php?action=delete`, {
        method: 'POST',
        body: JSON.stringify({ filename })
      });
      addNotification('Backup Dihapus', `File ${filename} berhasil dihapus.`);
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  const uploadRestoreBackup = async (file) => {
    try {
      const formData = new FormData();
      formData.append('backup_file', file);
      
      await apiRequest(`${API_BASE}/database.php?action=upload_restore`, {
        method: 'POST',
        body: formData
      });
      addNotification('Restore Sukses', `Database berhasil dipulihkan dari file unggahan.`);

      const data = await apiRequest(`${API_BASE}/init.php`);
      setOffices(data.offices);
      setLocations(data.locations);
      setDevices(data.devices);
      setSpareparts(data.spareparts);
      setSparepartUsage(data.sparepartUsage);
      setTechnicianHistory(data.technicianHistory);
      setDeviceHistory(data.deviceHistory);
      setIncidents(data.incidents);
      setMaintenance(data.maintenance);
      setUsers(data.users);
      if (data.deviceTypes && data.deviceTypes.length > 0) {
        setDeviceTypes(data.deviceTypes);
      }
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      offices,
      locations,
      devices,
      spareparts,
      sparepartUsage,
      technicianHistory,
      deviceHistory,
      incidents,
      maintenance,
      darkMode,
      setDarkMode,

      // Asset resolution helper
      getImageUrl,

      // Ephemerals
      notifications,
      addNotification,

      // Auth & User Management
      users,
      currentUser,
      login,
      logout,
      addUser,
      editUser,
      deleteUser,

      // Office actions
      addOffice,
      editOffice,
      deleteOffice,

      // Location actions
      addLocation,
      editLocation,
      deleteLocation,

      // Device actions
      addDevice,
      editDevice,
      deleteDevice,
      bulkRebootDevices,
      bulkPushConfig,

      // Incident / Ticket actions
      acknowledgeIncident,
      resolveIncident,
      addIncidentNote,
      createIncident,
      assignTicket,
      updateTicketStatus,
      rejectTicket,

      // Maintenance actions
      scheduleMaintenance,
      completeMaintenanceReport,
      deleteMaintenance,

      // Spare parts actions
      restockSparePart,

      // Device Type actions
      deviceTypes,
      addDeviceType,
      deleteDeviceType,

      // Database Backup & Restore actions
      getBackups,
      createBackup,
      restoreBackup,
      deleteBackup,
      uploadRestoreBackup,

      // Formatting utils
      formatDate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
