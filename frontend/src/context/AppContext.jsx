import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Helper to format date
const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// Data schema version — increment when seeder structure changes to force localStorage reset
const DATA_VERSION = '3.0';
const STORED_VERSION_KEY = 'netpoint_data_version';
if (localStorage.getItem(STORED_VERSION_KEY) !== DATA_VERSION) {
  const keysToRemove = [
    'netpoint_offices', 'netpoint_locations', 'netpoint_devices',
    'netpoint_incidents', 'netpoint_maintenance', 'netpoint_spareparts',
    'netpoint_sparepart_usage', 'netpoint_technician_history', 'netpoint_device_history',
    'netpoint_current_user', 'netpoint_notifications', 'netpoint_users', 'netpoint_session'
  ];
  keysToRemove.forEach(k => localStorage.removeItem(k));
  localStorage.setItem(STORED_VERSION_KEY, DATA_VERSION);
}

export const AppProvider = ({ children }) => {
  // --- 1. KANTOR WILAYAH (OFFICES) ---
  const [offices, setOffices] = useState(() => {
    const saved = localStorage.getItem('netpoint_offices');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Kantor Pusat Jakarta' },
      { id: 2, name: 'Kantor Regional Surabaya' },
      { id: 3, name: 'Kantor Cabang Medan' },
      { id: 4, name: 'Kantor Cabang Bandung' },
      { id: 5, name: 'Kantor Cabang Makassar' }
    ];
  });

  // --- 2. TITIK LOKASI (LOCATIONS with GPS, PIC, and Bandwidth Limits) ---
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('netpoint_locations');
    if (saved) {
      const parsed = JSON.parse(saved);
      const speeds = [50, 100, 150, 200, 300, 500];
      return parsed.map(loc => ({
        ...loc,
        max_bandwidth_mbps: loc.max_bandwidth_mbps !== undefined 
          ? loc.max_bandwidth_mbps 
          : speeds[Math.floor(Math.random() * speeds.length)]
      }));
    }

    const seededLocations = [];
    const cities = [
      { name: 'Jakarta', officeId: 1, count: 12, lat: -6.2088, lng: 106.8456 },
      { name: 'Surabaya', officeId: 2, count: 10, lat: -7.2575, lng: 112.7521 },
      { name: 'Medan', officeId: 3, count: 10, lat: 3.5952, lng: 98.6722 },
      { name: 'Bandung', officeId: 4, count: 11, lat: -6.9175, lng: 107.6191 },
      { name: 'Makassar', officeId: 5, count: 11, lat: -5.1477, lng: 119.4327 }
    ];

    const picNames = ["Budi Utomo", "Siti Aminah", "Joko Susilo", "Hendra Wijaya", "Rani Septiani", "Agus Santoso", "Dewi Lestari", "Rudi Hermawan", "Lia Novita", "Ahmad Fauzi"];
    const picPositions = ["Teknisi Lapangan", "Koordinator IT Wilayah", "Staf Operasional", "Supervisi Jaringan", "Pimpinan Cabang"];
    const speeds = [50, 100, 150, 200, 300, 500];

    let locId = 1;
    cities.forEach(city => {
      for (let i = 1; i <= city.count; i++) {
        const rng = Math.random();
        let status = 'OK';
        if (rng > 0.90) status = 'Critical';
        else if (rng > 0.75) status = 'Warning';

        const year = 2023 + Math.floor(Math.random() * 3);
        const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
        const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
        const installationDate = `${year}-${month}-${day}`;

        const deviceCount = 2 + Math.floor(Math.random() * 4);

        const offsetLat = (Math.random() - 0.5) * 0.12;
        const offsetLng = (Math.random() - 0.5) * 0.12;
        const latitude = parseFloat((city.lat + offsetLat).toFixed(6));
        const longitude = parseFloat((city.lng + offsetLng).toFixed(6));

        const picName = picNames[Math.floor(Math.random() * picNames.length)];
        const picContact = `+62 812-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`;
        const picPosition = picPositions[Math.floor(Math.random() * picPositions.length)];

        // Assign random bandwidth limit
        const max_bandwidth_mbps = speeds[Math.floor(Math.random() * speeds.length)];

        seededLocations.push({
          id: locId,
          name: `${city.name} - Titik ${String(i).padStart(2, '0')}`,
          officeId: city.officeId,
          status: status,
          deviceCount: deviceCount,
          lastSeen: `${Math.floor(Math.random() * 59) + 1}m lalu`,
          installationDate: installationDate,
          latitude: latitude,
          longitude: longitude,
          picName: picName,
          picContact: picContact,
          picPosition: picPosition,
          max_bandwidth_mbps: max_bandwidth_mbps
        });
        locId++;
      }
    });

    return seededLocations;
  });

  // --- 3. INVENTARIS PERANGKAT (DEVICES) ---
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('netpoint_devices');
    if (saved) return JSON.parse(saved);

    const seededDevices = [];
    let devId = 1;

    locations.forEach(loc => {
      const isLocOffline = loc.status === 'Critical';
      const isLocWarn = loc.status === 'Warning';

      for (let i = 1; i <= loc.deviceCount; i++) {
        const isRouter = i === 1;
        const type = isRouter ? 'Router' : (i === 2 ? 'Switch' : 'Access Point');
        
        let status = 'Online';
        if (isLocOffline) {
          status = Math.random() > 0.3 ? 'Offline' : 'Warning';
        } else if (isLocWarn) {
          status = Math.random() > 0.5 ? 'Warning' : 'Online';
        } else {
          status = Math.random() > 0.95 ? 'Warning' : 'Online';
        }

        const ipThird = 10 + loc.officeId;
        const ipFourth = loc.id * 4 + i;
        const ipAddress = `192.168.${ipThird}.${ipFourth}`;

        const verMajor = 1 + Math.floor(Math.random() * 2);
        const verMinor = Math.floor(Math.random() * 5);
        const verPatch = Math.floor(Math.random() * 9);
        const firmware = `v${verMajor}.${verMinor}.${verPatch}`;

        const cpu = status === 'Online' ? Math.floor(20 + Math.random() * 45) : (status === 'Warning' ? Math.floor(80 + Math.random() * 19) : 0);
        const ram = status === 'Online' ? Math.floor(40 + Math.random() * 30) : (status === 'Warning' ? Math.floor(85 + Math.random() * 14) : 0);
        
        // Simulating live bandwidth consumption based on location limits
        // Some locations will exceed/approach their limits
        let bandwidthIn = 0;
        let bandwidthOut = 0;
        if (status === 'Online') {
          // 15% chance to exceed the limits for demo alerts
          const exceed = Math.random() > 0.85;
          const ratio = exceed ? (1.05 + Math.random() * 0.2) : (0.4 + Math.random() * 0.45);
          const totalUsage = loc.max_bandwidth_mbps * ratio;
          bandwidthIn = (totalUsage * 0.7).toFixed(1);
          bandwidthOut = (totalUsage * 0.3).toFixed(1);
        }

        seededDevices.push({
          id: devId,
          name: `${type}-${String(i).padStart(2, '0')}`,
          type: type,
          locationId: loc.id,
          officeId: loc.officeId, 
          status: status,
          ipAddress: ipAddress,
          firmware: firmware,
          uptime: status === 'Offline' ? '0h 0m' : `${Math.floor(Math.random() * 45) + 5}hari ${Math.floor(Math.random() * 23)}jam`,
          cpuUsage: cpu,
          ramUsage: ram,
          bandwidthIn: parseFloat(bandwidthIn),
          bandwidthOut: parseFloat(bandwidthOut),
          interfaces: [
            { name: 'WAN', status: status === 'Offline' ? 'Down' : 'Up', speed: '1 Gbps', traffic: 'Sedang' },
            { name: 'LAN1', status: status === 'Offline' ? 'Down' : 'Up', speed: '1 Gbps', traffic: 'Rendah' }
          ]
        });
        devId++;
      }
    });

    return seededDevices;
  });

  // --- 4. SUKU CADANG (SPARE PARTS INVENTORY) ---
  const [spareparts, setSpareparts] = useState(() => {
    const saved = localStorage.getItem('netpoint_spareparts');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Konektor RJ45 Cat6 (Box)', type: 'Konektor', locationStorage: 'Gudang Utama Jakarta', stock: 12, threshold: 3, status: 'Tersedia' },
      { id: 2, name: 'Kabel UTP Cat6 Rol (305m)', type: 'Kabel', locationStorage: 'Gudang Utama Jakarta', stock: 8, threshold: 2, status: 'Tersedia' },
      { id: 3, name: 'SFP Transceiver 10G Multi-mode', type: 'Modul SFP', locationStorage: 'Gudang Surabaya', stock: 2, threshold: 3, status: 'Menipis' },
      { id: 4, name: 'Core Router Board v2', type: 'Suku Cadang Inti', locationStorage: 'Gudang Surabaya', stock: 1, threshold: 1, status: 'Menipis' },
      { id: 5, name: 'UPS Battery Pack 12V 9Ah', type: 'Catu Daya', locationStorage: 'Gudang Bandung', stock: 0, threshold: 2, status: 'Habis' },
      { id: 6, name: 'Access Point Bracket Mount', type: 'Aksesori', locationStorage: 'Gudang Makassar', stock: 25, threshold: 5, status: 'Tersedia' }
    ];
  });

  // --- 5. TRANSAKSI PENGGUNAAN SUKU CADANG (SPARE PARTS USAGE LOG) ---
  const [sparepartUsage, setSparepartUsage] = useState(() => {
    const saved = localStorage.getItem('netpoint_sparepart_usage');
    return saved ? JSON.parse(saved) : [
      { id: 'USG-2001', maintenanceId: 'MNT-100', sparepartId: 5, quantityUsed: 2, date: '2026-06-20', locationId: 2 }
    ];
  });

  // --- 6. RIWAYAT PENUGASAN TEKNISI PER LOKASI (TECHNICIAN ASSIGNMENT HISTORY) ---
  const [technicianHistory, setTechnicianHistory] = useState(() => {
    const saved = localStorage.getItem('netpoint_tech_history');
    return saved ? JSON.parse(saved) : [
      { locationId: 1, name: 'Budi Utomo', date: '2026-05-10', action: 'Perbaikan Koneksi Fiber Optic Backbone' },
      { locationId: 2, name: 'Ferry (Teknisi)', date: '2026-06-20', action: 'Penggantian Sel Baterai UPS Mati' },
      { locationId: 3, name: 'Hasan Basri', date: '2026-04-12', action: 'Konfigurasi IP & Port Security Switch' },
      { locationId: 4, name: 'Andi Tech Support', date: '2026-06-15', action: 'Pemeriksaan Jalur Distribusi AP' }
    ];
  });

  // --- 7. RIWAYAT PERGANTIAN PERANGKAT PER LOKASI (DEVICE REPLACEMENT HISTORY) ---
  const [deviceHistory, setDeviceHistory] = useState(() => {
    const saved = localStorage.getItem('netpoint_device_history');
    return saved ? JSON.parse(saved) : [
      { locationId: 1, deviceName: 'Router-01', date: '2026-01-15', action: 'Instalasi Perangkat Utama Baru', technician: 'Budi Utomo' },
      { locationId: 2, deviceName: 'UPS Battery Pack', date: '2026-06-20', action: 'Pergantian Cadangan Daya UPS', technician: 'Ferry (Teknisi)' },
      { locationId: 3, deviceName: 'Switch-01', date: '2026-03-22', action: 'Penggantian Port Terbakar Induksi Petir', technician: 'Siti Aminah' }
    ];
  });

  // --- 8. TIKET INSIDEN (INCIDENTS with Bandwidth Exceeded alerts seeded) ---
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('netpoint_incidents');
    if (saved) return JSON.parse(saved);

    const seededIncidents = [];
    let incId = 1001;

    locations.forEach(loc => {
      if (loc.status !== 'OK') {
        const locDevices = devices.filter(d => d.locationId === loc.id);
        const targetDevice = locDevices[0] || { id: 1, name: 'Router-01' };
        const severity = loc.status === 'Critical' ? 'Critical' : 'High';
        const title = loc.status === 'Critical' ? `Kegagalan Koneksi Router Utama ${loc.name}` : `Latensi Tinggi & Packet Loss Terdeteksi di ${loc.name}`;

        seededIncidents.push({
          id: `INC-${incId++}`,
          severity: severity,
          title: title,
          locationId: loc.id,
          deviceId: targetDevice.id,
          timestamp: new Date(Date.now() - (Math.random() * 4 * 3600 * 1000)).toISOString(), 
          status: 'Open',
          assignedTo: Math.random() > 0.5 ? 'Budi Utomo (IT Pusat)' : 'Belum Ditugaskan',
          notes: [
            { author: 'Sistem Pemantau', text: 'Mendeteksi otomatis kehilangan sinyal detak jantung (heartbeat).', time: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
          ],
          timeline: [
            { text: 'Insiden dibuka otomatis oleh NetPoint Monitor.', time: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
          ]
        });
      }
    });

    // Seed a couple of bandwidth warning incidents for demo
    seededIncidents.push({
      id: `INC-${incId++}`,
      severity: 'Medium',
      title: 'Trafik Bandwidth Titik Cabang Jakarta - Titik 02 Mendekati Batas Maksimal (92%)',
      locationId: 2,
      deviceId: 4,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'Open',
      assignedTo: 'Belum Ditugaskan',
      notes: [{ author: 'Sistem QoS Monitor', text: 'Trafik mencapai 46 Mbps dari batas maksimal 50 Mbps.', time: new Date().toISOString() }],
      timeline: [{ text: 'Insiden utilisasi bandwidth dibuat.', time: new Date().toISOString() }]
    });

    seededIncidents.push({
      id: `INC-${incId++}`,
      severity: 'High',
      title: 'Trafik Bandwidth Titik Cabang Surabaya - Titik 01 Melebihi Batas Maksimal (106%)',
      locationId: 13,
      deviceId: 37,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'Open',
      assignedTo: 'Hasan Basri',
      notes: [{ author: 'Sistem QoS Monitor', text: 'Trafik mencapai 106 Mbps dari batas maksimal 100 Mbps.', time: new Date().toISOString() }],
      timeline: [{ text: 'Insiden limit terlampaui dibuat.', time: new Date().toISOString() }]
    });

    // Seed resolved incidents
    for (let i = 0; i < 5; i++) {
      seededIncidents.push({
        id: `INC-${incId++}`,
        severity: 'Medium',
        title: `Interupsi Uptime WiFi AP di Titik Cabang ${10 + i}`,
        locationId: 10 + i,
        deviceId: 30 + i,
        timestamp: new Date(Date.now() - (24 * 3600 * 1000 * (i + 1))).toISOString(),
        status: 'Resolved',
        assignedTo: 'Andi Tech Support',
        notes: [
          { author: 'Sistem Pemantau', text: 'AP terputus.', time: new Date(Date.now() - (24 * 3600 * 1000 * (i + 1))).toISOString() },
          { author: 'Andi Tech Support', text: 'Melakukan reboot AP lewat web GUI. Koneksi kembali normal.', time: new Date(Date.now() - (23 * 3600 * 1000 * (i + 1))).toISOString() }
        ],
        timeline: [
          { text: 'Insiden dibuka otomatis oleh sistem.', time: new Date(Date.now() - (24 * 3600 * 1000 * (i + 1))).toISOString() },
          { text: 'Ditugaskan ke Andi Tech Support.', time: new Date(Date.now() - (23.8 * 3600 * 1000 * (i + 1))).toISOString() },
          { text: 'Status diubah menjadi Selesai.', time: new Date(Date.now() - (23 * 3600 * 1000 * (i + 1))).toISOString() }
        ]
      });
    }

    // Seed tickets specifically assigned to Rian IT Support (default Teknisi user)
    seededIncidents.push({
      id: `INC-${incId++}`,
      severity: 'High',
      title: 'Switch Core Lantai 3 Tidak Merespons - Kantor Pusat Jakarta',
      locationId: 1,
      deviceId: 1,
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      status: 'Assigned',
      assignedTo: 'Rian IT Support',
      notes: [
        { author: 'Sistem Pemantau', text: 'Switch core lantai 3 tidak merespons ping selama 15 menit terakhir.', time: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
        { author: 'Aditya IT Admin', text: 'Ditugaskan ke Rian untuk pengecekan fisik langsung.', time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString() }
      ],
      timeline: [
        { text: 'Insiden dibuka otomatis oleh NetPoint Monitor.', time: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
        { text: 'Tiket ditugaskan ke Rian IT Support oleh Aditya IT Admin.', time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString() }
      ]
    });

    seededIncidents.push({
      id: `INC-${incId++}`,
      severity: 'Medium',
      title: 'Access Point Ruang Rapat B Tidak Terkoneksi ke Controller',
      locationId: 2,
      deviceId: 2,
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      status: 'In Progress',
      assignedTo: 'Rian IT Support',
      notes: [
        { author: 'Sistem Pemantau', text: 'AP terdeteksi offline sejak pukul 09.00 WIB.', time: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
        { author: 'Rian IT Support', text: 'Sedang melakukan pemeriksaan kabel PoE dan restart controller AP.', time: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
      ],
      timeline: [
        { text: 'Insiden dibuka otomatis oleh sistem.', time: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
        { text: 'Tiket ditugaskan ke Rian IT Support.', time: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
        { text: 'Status diubah menjadi In Progress oleh Rian IT Support.', time: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
      ]
    });

    return seededIncidents;

  });

  // --- 9. PENJADWALAN & LAPORAN AUDIT (MAINTENANCE) ---
  const [maintenance, setMaintenance] = useState(() => {
    const saved = localStorage.getItem('netpoint_maintenance');
    return saved ? JSON.parse(saved) : [
      {
        id: 'MNT-101',
        title: 'Peningkatan Firmware Berkala',
        locationId: 1,
        deviceId: 1,
        scheduledDate: '2026-07-05',
        status: 'Scheduled',
        performedBy: 'Budi Utomo (IT)',
        actionsTaken: '',
        outcome: '',
        photoUrl: '',
        signatureUrl: '',
        completedDate: ''
      },
      {
        id: 'MNT-102',
        title: 'Pembersihan Debu & Diagnostik Switch',
        locationId: 3,
        deviceId: 5,
        scheduledDate: '2026-06-25',
        status: 'Overdue',
        performedBy: 'Hasan (Teknisi)',
        actionsTaken: '',
        outcome: '',
        photoUrl: '',
        signatureUrl: '',
        completedDate: ''
      },
      {
        id: 'MNT-100',
        title: 'Penggantian Baterai Cadangan UPS',
        locationId: 2,
        deviceId: 3,
        scheduledDate: '2026-06-20',
        status: 'Completed',
        performedBy: 'Ferry (Teknisi)',
        actionsTaken: 'Mengganti sel baterai mati pada APC UPS. Menguji pemindahan beban ke generator.',
        outcome: 'Sistem teruji aman. Kesehatan baterai 100%.',
        photoUrl: 'simulated_battery_photo', 
        signatureUrl: 'simulated_sig',
        completedDate: '2026-06-20'
      }
    ];
  });

  // --- PERSISTENCE EFFECT BLOCKS ---
  useEffect(() => {
    localStorage.setItem('netpoint_offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('netpoint_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('netpoint_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('netpoint_spareparts', JSON.stringify(spareparts));
  }, [spareparts]);

  useEffect(() => {
    localStorage.setItem('netpoint_sparepart_usage', JSON.stringify(sparepartUsage));
  }, [sparepartUsage]);

  useEffect(() => {
    localStorage.setItem('netpoint_tech_history', JSON.stringify(technicianHistory));
  }, [technicianHistory]);

  useEffect(() => {
    localStorage.setItem('netpoint_device_history', JSON.stringify(deviceHistory));
  }, [deviceHistory]);

  useEffect(() => {
    localStorage.setItem('netpoint_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('netpoint_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

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
  const addOffice = (name) => {
    const newId = offices.length > 0 ? Math.max(...offices.map(o => o.id)) + 1 : 1;
    setOffices([...offices, { id: newId, name }]);
  };

  const editOffice = (id, name) => {
    setOffices(offices.map(o => o.id === id ? { ...o, name } : o));
  };

  const deleteOffice = (id) => {
    setOffices(offices.filter(o => o.id !== id));
    setLocations(locations.map(loc => loc.officeId === id ? { ...loc, officeId: 1 } : loc));
  };

  // --- Locations ---
  const addLocation = (locData) => {
    const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1;
    const newLoc = {
      id: newId,
      name: locData.name,
      officeId: parseInt(locData.officeId) || 1,
      status: 'OK',
      deviceCount: 0,
      lastSeen: 'Baru saja',
      installationDate: locData.installationDate || new Date().toISOString().split('T')[0],
      latitude: parseFloat(locData.latitude) || -6.2088,
      longitude: parseFloat(locData.longitude) || 106.8456,
      picName: locData.picName || '',
      picContact: locData.picContact || '',
      picPosition: locData.picPosition || '',
      max_bandwidth_mbps: parseInt(locData.max_bandwidth_mbps) || 100
    };
    
    const updated = [...locations, newLoc];
    setLocations(updated);

    // Add initial installation record to device history
    setDeviceHistory(prev => [
      {
        locationId: newId,
        deviceName: 'Instalasi Awal Titik',
        date: newLoc.installationDate,
        action: 'Inisialisasi Penempatan Titik Cabang Baru',
        technician: locData.picName || 'IT Pusat'
      },
      ...prev
    ]);

    return newId;
  };

  const editLocation = (id, updatedData) => {
    setLocations(locations.map(loc => loc.id === id ? {
      ...loc,
      name: updatedData.name,
      officeId: parseInt(updatedData.officeId),
      installationDate: updatedData.installationDate,
      latitude: parseFloat(updatedData.latitude) || loc.latitude,
      longitude: parseFloat(updatedData.longitude) || loc.longitude,
      picName: updatedData.picName,
      picContact: updatedData.picContact,
      picPosition: updatedData.picPosition,
      max_bandwidth_mbps: parseInt(updatedData.max_bandwidth_mbps) || loc.max_bandwidth_mbps
    } : loc));
    
    setDevices(prev => prev.map(d => d.locationId === id ? { ...d, officeId: parseInt(updatedData.officeId) } : d));
  };

  const deleteLocation = (id) => {
    setLocations(locations.filter(l => l.id !== id));
    setDevices(devices.filter(d => d.locationId !== id));
    setIncidents(incidents.filter(i => i.locationId !== id));
    setMaintenance(maintenance.filter(m => m.locationId !== id));
    setTechnicianHistory(technicianHistory.filter(h => h.locationId !== id));
    setDeviceHistory(deviceHistory.filter(h => h.locationId !== id));
  };

  // --- Devices ---
  const addDevice = (devData) => {
    const newId = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
    const loc = locations.find(l => l.id === parseInt(devData.locationId));
    
    const newDev = {
      id: newId,
      name: devData.name,
      type: devData.type,
      locationId: parseInt(devData.locationId),
      officeId: loc ? loc.officeId : 1,
      status: devData.status || 'Online',
      ipAddress: devData.ipAddress || '192.168.1.1',
      firmware: devData.firmware || 'v1.0.0',
      uptime: '1 hari 0jam',
      cpuUsage: devData.status === 'Online' ? 25 : 0,
      ramUsage: devData.status === 'Online' ? 45 : 0,
      bandwidthIn: devData.status === 'Online' ? 120 : 0,
      bandwidthOut: devData.status === 'Online' ? 80 : 0,
      interfaces: [
        { name: 'WAN', status: devData.status === 'Offline' ? 'Down' : 'Up', speed: '1 Gbps', traffic: 'Sedang' },
        { name: 'LAN1', status: devData.status === 'Offline' ? 'Down' : 'Up', speed: '1 Gbps', traffic: 'Rendah' }
      ]
    };

    const updatedDevices = [...devices, newDev];
    setDevices(updatedDevices);
    setLocations(locations.map(l => l.id === parseInt(devData.locationId) ? { ...l, deviceCount: l.deviceCount + 1 } : l));
    updateLocationHealth(parseInt(devData.locationId), updatedDevices);

    // Log to device replacement history
    setDeviceHistory(prev => [
      {
        locationId: parseInt(devData.locationId),
        deviceName: devData.name,
        date: new Date().toISOString().split('T')[0],
        action: `Pemasangan Perangkat Baru (${devData.type})`,
        technician: 'IT Support'
      },
      ...prev
    ]);
  };

  const editDevice = (id, updatedData) => {
    const oldDev = devices.find(d => d.id === id);
    const updatedDevices = devices.map(dev => dev.id === id ? {
      ...dev,
      name: updatedData.name,
      type: updatedData.type,
      ipAddress: updatedData.ipAddress,
      firmware: updatedData.firmware,
      status: updatedData.status,
      cpuUsage: updatedData.status === 'Online' ? 30 : (updatedData.status === 'Warning' ? 88 : 0),
      ramUsage: updatedData.status === 'Online' ? 50 : (updatedData.status === 'Warning' ? 90 : 0),
      bandwidthIn: updatedData.status === 'Online' ? 150 : 0,
      bandwidthOut: updatedData.status === 'Online' ? 95 : 0,
    } : dev);

    setDevices(updatedDevices);

    if (oldDev && oldDev.status !== updatedData.status) {
      updateLocationHealth(oldDev.locationId, updatedDevices);

      if (updatedData.status === 'Offline') {
        const loc = locations.find(l => l.id === oldDev.locationId);
        const incId = `INC-${Date.now()}`;
        setIncidents(prev => [
          {
            id: incId,
            severity: 'Critical',
            title: `Perangkat ${updatedData.name} di ${loc ? loc.name : 'Titik'} Luring (Offline)`,
            locationId: oldDev.locationId,
            deviceId: id,
            timestamp: new Date().toISOString(),
            status: 'Open',
            assignedTo: 'Belum Ditugaskan',
            notes: [{ author: 'Sistem Pemantau', text: 'Koneksi perangkat terputus.', time: new Date().toISOString() }],
            timeline: [{ text: 'Insiden dibuka otomatis oleh sistem.', time: new Date().toISOString() }]
          },
          ...prev
        ]);
      } else if (updatedData.status === 'Online') {
        setIncidents(prev => prev.map(inc => {
          if (inc.deviceId === id && inc.status !== 'Resolved') {
            return {
              ...inc,
              status: 'Resolved',
              timeline: [
                ...inc.timeline,
                { text: 'Perangkat kembali online. Insiden selesai otomatis.', time: new Date().toISOString() }
              ]
            };
          }
          return inc;
        }));
      }
    }
  };

  const deleteDevice = (id) => {
    const dev = devices.find(d => d.id === id);
    if (!dev) return;

    const updatedDevices = devices.filter(d => d.id !== id);
    setDevices(updatedDevices);
    setLocations(locations.map(l => l.id === dev.locationId ? { ...l, deviceCount: Math.max(0, l.deviceCount - 1) } : l));
    updateLocationHealth(dev.locationId, updatedDevices);

    // Log to device history
    setDeviceHistory(prev => [
      {
        locationId: dev.locationId,
        deviceName: dev.name,
        date: new Date().toISOString().split('T')[0],
        action: `Pelepasan / Penghapusan Perangkat (${dev.type})`,
        technician: 'IT Support'
      },
      ...prev
    ]);
  };

  // --- Bulk Device Actions ---
  const bulkRebootDevices = (ids) => {
    setDevices(prev => prev.map(d => ids.includes(d.id) ? { 
      ...d, 
      status: 'Warning',
      uptime: 'Baru saja di-reboot',
      cpuUsage: 99, 
      ramUsage: 45 
    } : d));
    
    setTimeout(() => {
      setDevices(prev => prev.map(d => ids.includes(d.id) ? { 
        ...d, 
        status: 'Online',
        uptime: '0hari 0jam 1menit',
        cpuUsage: 12,
        ramUsage: 35
      } : d));
    }, 4000);
  };

  const bulkPushConfig = (ids) => {
    setDevices(prev => prev.map(d => ids.includes(d.id) ? {
      ...d,
      firmware: d.firmware + ' (Konfigurasi Diperbarui)',
    } : d));
  };

  const bulkAssignOffice = (ids, officeId) => {
    setDevices(prev => prev.map(d => ids.includes(d.id) ? {
      ...d,
      officeId: parseInt(officeId)
    } : d));
  };

  // --- Incidents ---
  const acknowledgeIncident = (id, username = 'Admin IT') => {
    setIncidents(prev => prev.map(inc => inc.id === id ? {
      ...inc,
      status: 'Acknowledged',
      assignedTo: username,
      timeline: [
        ...inc.timeline,
        { text: `Insiden diakui (acknowledged) oleh ${username}.`, time: new Date().toISOString() }
      ]
    } : inc));
  };

  const resolveIncident = (id, username = 'Admin IT') => {
    setIncidents(prev => {
      const targetInc = prev.find(i => i.id === id);
      if (targetInc) {
        setDevices(devs => {
          const updatedDevs = devs.map(d => d.id === targetInc.deviceId ? { ...d, status: 'Online' } : d);
          setTimeout(() => updateLocationHealth(targetInc.locationId, updatedDevs), 0);
          return updatedDevs;
        });
      }
      
      return prev.map(inc => inc.id === id ? {
        ...inc,
        status: 'Resolved',
        assignedTo: username,
        timeline: [
          ...inc.timeline,
          { text: `Insiden diselesaikan oleh ${username}.`, time: new Date().toISOString() }
        ]
      } : inc);
    });
  };

  const addIncidentNote = (id, author, text) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? {
      ...inc,
      notes: [...inc.notes, { author, text, time: new Date().toISOString() }],
      timeline: [...inc.timeline, { text: `Catatan ditambahkan oleh ${author}: "${text.slice(0, 30)}..."`, time: new Date().toISOString() }]
    } : inc));
  };

  const createIncident = (incData) => {
    const incId = `INC-${Date.now()}`;
    const newInc = {
      id: incId,
      severity: incData.severity || 'Medium',
      title: incData.title,
      locationId: parseInt(incData.locationId),
      deviceId: parseInt(incData.deviceId) || null,
      timestamp: new Date().toISOString(),
      status: 'Open',
      assignedTo: incData.assignedTo || 'Belum Ditugaskan',
      notes: incData.note ? [{ author: 'Pembuat', text: incData.note, time: new Date().toISOString() }] : [],
      timeline: [{ text: 'Insiden dibuka secara manual.', time: new Date().toISOString() }]
    };

    setIncidents(prev => [newInc, ...prev]);

    if (incData.deviceId) {
      const targetStatus = incData.severity === 'Critical' ? 'Offline' : 'Warning';
      setDevices(devs => {
        const updated = devs.map(d => d.id === parseInt(incData.deviceId) ? { ...d, status: targetStatus } : d);
        setTimeout(() => updateLocationHealth(parseInt(incData.locationId), updated), 0);
        return updated;
      });
    }
  };

  // --- Maintenance & Stock decrementation ---
  const scheduleMaintenance = (mntData) => {
    const newId = `MNT-${Date.now()}`;
    const newMnt = {
      id: newId,
      title: mntData.title,
      locationId: parseInt(mntData.locationId),
      deviceId: parseInt(mntData.deviceId),
      scheduledDate: mntData.scheduledDate,
      status: 'Scheduled',
      performedBy: mntData.performedBy || 'Belum Ditugaskan',
      actionsTaken: '',
      outcome: '',
      photoUrl: '',
      signatureUrl: '',
      completedDate: ''
    };
    setMaintenance([newMnt, ...maintenance]);
  };

  const completeMaintenanceReport = (id, reportData) => {
    const mnt = maintenance.find(m => m.id === id);
    if (!mnt) return;

    // 1. Update maintenance logs
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

    // 2. Decrement selected spare part stock if applicable
    if (reportFormHasSparePart(reportData)) {
      const spId = parseInt(reportData.sparepartId);
      const qtyUsed = parseInt(reportData.sparepartQty);

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

      // Log spare part usage transaction
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

    // 3. Log technician history record
    setTechnicianHistory(prev => [
      {
        locationId: mnt.locationId,
        name: reportData.performedBy,
        date: new Date().toISOString().split('T')[0],
        action: `${mnt.title} - ${reportData.actionsTaken.slice(0, 45)}...`
      },
      ...prev
    ]);

    // 4. Log device history if title/action implies replacement/upgrade
    const lowerTitle = mnt.title.toLowerCase();
    const lowerActions = reportData.actionsTaken.toLowerCase();
    if (lowerTitle.includes('ganti') || lowerTitle.includes('pasang') || lowerActions.includes('ganti') || lowerActions.includes('mengganti')) {
      const dev = devices.find(d => d.id === mnt.deviceId);
      setDeviceHistory(prev => [
        {
          locationId: mnt.locationId,
          deviceName: dev ? dev.name : 'Perangkat Jaringan',
          date: new Date().toISOString().split('T')[0],
          action: `Pergantian/Perbaikan Perangkat: ${mnt.title}`,
          technician: reportData.performedBy
        },
        ...prev
      ]);
    }
  };

  // Helper check
  const reportFormHasSparePart = (data) => {
    return data.useSparePart && data.sparepartId && data.sparepartQty && parseInt(data.sparepartQty) > 0;
  };

  const deleteMaintenance = (id) => {
    setMaintenance(maintenance.filter(m => m.id !== id));
  };

  // --- USER MANAGEMENT & AUTH ---
  // Kredensial default dibaca dari .env (VITE_SEED_*) — fallback ke nilai hardcoded
  const ENV = import.meta.env;
  const defaultUsers = [
    {
      id: 1,
      name:     ENV.VITE_SEED_ADMIN_NAME     || 'Aditya Prasetyo',
      username: ENV.VITE_SEED_ADMIN_USERNAME || 'admin',
      password: ENV.VITE_SEED_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      jabatan:  ENV.VITE_SEED_ADMIN_JABATAN  || 'IT Administrator',
      status: 'aktif', createdAt: '2024-01-01'
    },
    {
      id: 2,
      name:     ENV.VITE_SEED_PIMPINAN_NAME     || 'Pak Budi Santoso',
      username: ENV.VITE_SEED_PIMPINAN_USERNAME || 'pimpinan',
      password: ENV.VITE_SEED_PIMPINAN_PASSWORD || 'pimpinan123',
      role: 'pimpinan',
      jabatan:  ENV.VITE_SEED_PIMPINAN_JABATAN  || 'Direktur Operasional',
      status: 'aktif', createdAt: '2024-01-01'
    },
    {
      id: 3, name: 'Rian IT Support', username: 'rian',
      password: ENV.VITE_SEED_TEKNISI_PASSWORD || 'teknisi123',
      role: 'teknisi', jabatan: 'Teknisi Lapangan Senior', status: 'aktif', createdAt: '2024-02-01'
    },
    {
      id: 4, name: 'Budi Utomo', username: 'budi',
      password: ENV.VITE_SEED_TEKNISI_PASSWORD || 'teknisi123',
      role: 'teknisi', jabatan: 'Teknisi IT Pusat', status: 'aktif', createdAt: '2024-02-10'
    },
    {
      id: 5, name: 'Siti Aminah', username: 'siti',
      password: ENV.VITE_SEED_TEKNISI_PASSWORD || 'teknisi123',
      role: 'teknisi', jabatan: 'Teknisi IT Jawa Barat', status: 'aktif', createdAt: '2024-03-01'
    },
    {
      id: 6, name: 'Joko Susilo', username: 'joko',
      password: ENV.VITE_SEED_TEKNISI_PASSWORD || 'teknisi123',
      role: 'teknisi', jabatan: 'Teknisi IT Jawa Timur', status: 'aktif', createdAt: '2024-03-15'
    },
  ];

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('netpoint_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  // Session: null means not logged in
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('netpoint_session');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username, password) => {
    const latestUsers = JSON.parse(localStorage.getItem('netpoint_users') || JSON.stringify(defaultUsers));
    const user = latestUsers.find(u => u.username === username && u.status === 'aktif');
    if (!user) return { success: false, error: 'Username tidak ditemukan atau akun dinonaktifkan.' };
    if (user.password !== password) return { success: false, error: 'Password salah. Silakan coba lagi.' };
    const { password: _pw, ...safeUser } = user;
    setCurrentUser(safeUser);
    localStorage.setItem('netpoint_session', JSON.stringify(safeUser));
    addNotification('Login Berhasil', `Selamat datang kembali, ${safeUser.name}!`);
    return { success: true, user: safeUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('netpoint_session');
  };

  const addUser = (userData) => {
    setUsers(prev => {
      const newUser = { ...userData, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] };
      const next = [...prev, newUser];
      localStorage.setItem('netpoint_users', JSON.stringify(next));
      return next;
    });
  };

  const editUser = (userId, updatedData) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, ...updatedData } : u);
      localStorage.setItem('netpoint_users', JSON.stringify(next));
      // If editing the currently logged-in user, refresh session
      if (currentUser && currentUser.id === userId) {
        const { password: _pw, ...safeUser } = next.find(u => u.id === userId);
        setCurrentUser(safeUser);
        localStorage.setItem('netpoint_session', JSON.stringify(safeUser));
      }
      return next;
    });
  };

  const deleteUser = (userId) => {
    setUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      localStorage.setItem('netpoint_users', JSON.stringify(next));
      return next;
    });
  };

  // --- AUTOMATED TICKETING NOTIFICATIONS ---
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('netpoint_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Sistem Terhubung', message: 'NetPoint centralized monitoring hub aktif.', time: new Date(Date.now() - 3600000).toISOString() }
    ];
  });

  const addNotification = (title, message) => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      time: new Date().toISOString()
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev].slice(0, 15); // Cap at 15 items
      localStorage.setItem('netpoint_notifications', JSON.stringify(next));
      return next;
    });
  };

  // --- NEW TICKETING MUTATORS ---
  const assignTicket = (ticketId, technicianName) => {
    setIncidents(prev => {
      const next = prev.map(inc => {
        if (inc.id === ticketId) {
          addNotification('Penugasan Tiket', `Tiket ${ticketId} ditugaskan ke ${technicianName}.`);
          return {
            ...inc,
            status: 'Assigned',
            assignedTo: technicianName,
            timeline: [
              ...inc.timeline,
              { text: `Tiket ditugaskan ke ${technicianName} oleh ${currentUser.name}.`, time: new Date().toISOString() }
            ]
          };
        }
        return inc;
      });
      localStorage.setItem('netpoint_incidents', JSON.stringify(next));
      return next;
    });
  };

  const updateTicketStatus = (ticketId, newStatus, noteText = '', photoUrl = '', signatureUrl = '') => {
    setIncidents(prev => {
      const next = prev.map(inc => {
        if (inc.id === ticketId) {
          addNotification('Update Status Tiket', `Tiket ${ticketId} diubah ke status ${newStatus.toUpperCase()}.`);
          
          let nextDevsStatus = undefined;
          if (newStatus === 'Resolved') {
            nextDevsStatus = 'Online';
          } else if (newStatus === 'In Progress') {
            nextDevsStatus = 'Warning';
          }

          if (nextDevsStatus) {
            setDevices(devs => {
              const updatedDevs = devs.map(d => d.id === inc.deviceId ? { ...d, status: nextDevsStatus } : d);
              setTimeout(() => updateLocationHealth(inc.locationId, updatedDevs), 0);
              return updatedDevs;
            });
          }

          const updatedNotes = noteText.trim()
            ? [...inc.notes, { author: currentUser.name, text: noteText, time: new Date().toISOString() }]
            : inc.notes;

          return {
            ...inc,
            status: newStatus,
            notes: updatedNotes,
            evidencePhoto: photoUrl || inc.evidencePhoto || null,
            evidenceSignature: signatureUrl || inc.evidenceSignature || null,
            timeline: [
              ...inc.timeline,
              { text: `Status tiket diubah menjadi ${newStatus} oleh ${currentUser.name}.`, time: new Date().toISOString() }
            ]
          };
        }
        return inc;
      });
      localStorage.setItem('netpoint_incidents', JSON.stringify(next));
      return next;
    });
  };

  const rejectTicket = (ticketId, reason) => {
    setIncidents(prev => {
      const next = prev.map(inc => {
        if (inc.id === ticketId) {
          addNotification('Tiket Ditolak', `Solusi tiket ${ticketId} ditolak.`);
          const updatedNotes = [
            ...inc.notes,
            { author: currentUser.name, text: `PENOLAKAN SOLUSI: ${reason}`, time: new Date().toISOString() }
          ];
          return {
            ...inc,
            status: 'Rejected',
            notes: updatedNotes,
            timeline: [
              ...inc.timeline,
              { text: `Solusi tiket ditolak oleh ${currentUser.name} dengan alasan: ${reason}`, time: new Date().toISOString() }
            ]
          };
        }
        return inc;
      });
      localStorage.setItem('netpoint_incidents', JSON.stringify(next));
      return next;
    });
  };

  // --- SPARE PARTS INVENTORY CRUD ACTIONS ---
  const restockSparePart = (id, amount) => {
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
    
    // Add usage transaction showing restock (negative usage as representation)
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

      // Auth & User Management
      users,
      currentUser,
      login,
      logout,
      addUser,
      editUser,
      deleteUser,
      notifications,
      addNotification,

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
      bulkAssignOffice,

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

      // Formatting utils
      formatDate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
