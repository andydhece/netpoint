<?php
// backend/database/seeder.php

try {
    $pdo = require_once __DIR__ . '/../config/database.php';

    // 1. Run schema.sql to create tables if they don't exist
    $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
    // Simple split by semicolon. Since schema.sql doesn't have semicolons inside strings, this works.
    $queries = array_filter(array_map('trim', explode(';', $schemaSql)));
    foreach ($queries as $query) {
        if (!empty($query)) {
            $pdo->exec($query);
        }
    }
    echo "Database schema initialized successfully.\n";

    // 2. Check if users table is empty. If not, skip seeding.
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    if ($userCount > 0) {
        echo "Database already seeded. Skipping.\n";
        exit;
    }

    echo "Seeding default data...\n";

    // 3. Seed Users
    $defaultUsers = [
        ['Aditya Prasetyo', 'admin', 'admin123', 'admin', 'IT Administrator'],
        ['Pak Budi Santoso', 'pimpinan', 'pimpinan123', 'pimpinan', 'Direktur Operasional'],
        ['Budi Utomo', 'budi_teknisi', 'teknisi123', 'teknisi', 'Teknisi Lapangan Jakarta'],
        ['Siti Aminah', 'siti_teknisi', 'teknisi123', 'teknisi', 'Koordinator IT Surabaya'],
        ['Joko Susilo', 'joko_teknisi', 'teknisi123', 'teknisi', 'Teknisi Lapangan Medan'],
        ['Hendra Wijaya', 'hendra_teknisi', 'teknisi123', 'teknisi', 'Teknisi Lapangan Bandung'],
        ['Rani Septiani', 'rani_teknisi', 'teknisi123', 'teknisi', 'Teknisi Lapangan Makassar']
    ];

    $userStmt = $pdo->prepare("INSERT INTO users (name, username, password, role, avatar) VALUES (?, ?, ?, ?, ?)");
    foreach ($defaultUsers as $u) {
        $avatar = 'https://images.unsplash.com/photo-' . (
            $u[3] === 'admin' 
            ? '1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' 
            : ($u[3] === 'pimpinan' 
                ? '1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face' 
                : '1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face')
        );
        $userStmt->execute([$u[0], $u[1], $u[2], $u[3], $avatar]);
    }
    echo "Users seeded.\n";

    // 4. Seed Device Types
    $deviceTypes = ['Router', 'Switch', 'Access Point', 'Firewall'];
    $typeStmt = $pdo->prepare("INSERT INTO device_types (name) VALUES (?)");
    foreach ($deviceTypes as $type) {
        $typeStmt->execute([$type]);
    }
    echo "Device types seeded.\n";

    // 5. Seed Offices
    $offices = [
        'Kantor Pusat Jakarta',
        'Kantor Regional Surabaya',
        'Kantor Cabang Medan',
        'Kantor Cabang Bandung',
        'Kantor Cabang Makassar'
    ];
    $officeStmt = $pdo->prepare("INSERT INTO offices (name) VALUES (?)");
    foreach ($offices as $name) {
        $officeStmt->execute([$name]);
    }
    echo "Offices seeded.\n";

    // 6. Seed Locations & Devices
    $cities = [
        ['name' => 'Jakarta', 'officeId' => 1, 'count' => 12, 'lat' => -6.2088, 'lng' => 106.8456],
        ['name' => 'Surabaya', 'officeId' => 2, 'count' => 10, 'lat' => -7.2575, 'lng' => 112.7521],
        ['name' => 'Medan', 'officeId' => 3, 'count' => 10, 'lat' => 3.5952, 'lng' => 98.6722],
        ['name' => 'Bandung', 'officeId' => 4, 'count' => 11, 'lat' => -6.9175, 'lng' => 107.6191],
        ['name' => 'Makassar', 'officeId' => 5, 'count' => 11, 'lat' => -5.1477, 'lng' => 119.4327]
    ];

    $picNames = ["Budi Utomo", "Siti Aminah", "Joko Susilo", "Hendra Wijaya", "Rani Septiani", "Agus Santoso", "Dewi Lestari", "Rudi Hermawan", "Lia Novita", "Ahmad Fauzi"];
    $picPositions = ["Teknisi Lapangan", "Koordinator IT Wilayah", "Staf Operasional", "Supervisi Jaringan", "Pimpinan Cabang"];
    $speeds = [50, 100, 150, 200, 300, 500];

    $locStmt = $pdo->prepare("INSERT INTO locations (name, office_id, status, device_count, last_seen, installation_date, latitude, longitude, pic_name, pic_contact, pic_position, max_bandwidth_mbps, category, connection_type, is_intranet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $devStmt = $pdo->prepare("INSERT INTO devices (name, type, location_id, office_id, status, ip_address, firmware, uptime, cpu_usage, ram_usage, bandwidth_in, bandwidth_out, interfaces) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $locId = 1;
    $devId = 1;

    foreach ($cities as $city) {
        for ($i = 1; $i <= $city['count']; $i++) {
            $rng = mt_rand() / mt_getrandmax();
            $status = 'OK';
            if ($rng > 0.90) $status = 'Critical';
            elseif ($rng > 0.75) $status = 'Warning';

            $year = 2023 + mt_rand(0, 2);
            $month = str_pad(mt_rand(1, 12), 2, '0', STR_PAD_LEFT);
            $day = str_pad(mt_rand(1, 28), 2, '0', STR_PAD_LEFT);
            $installationDate = "$year-$month-$day";

            $deviceCount = mt_rand(2, 5);

            $offsetLat = (mt_rand() / mt_getrandmax() - 0.5) * 0.12;
            $offsetLng = (mt_rand() / mt_getrandmax() - 0.5) * 0.12;
            $latitude = round($city['lat'] + $offsetLat, 6);
            $longitude = round($city['lng'] + $offsetLng, 6);

            $picName = $picNames[array_rand($picNames)];
            $picContact = "+62 812-" . mt_rand(1000, 9999) . "-" . mt_rand(1000, 9999);
            $picPosition = $picPositions[array_rand($picPositions)];
            $maxBandwidth = $speeds[array_rand($speeds)];
            $lastSeen = mt_rand(1, 59) . "m lalu";

            $categories = ['Perangkat Daerah', 'WiFi Publik', 'Instansi Lain'];
            $category = $categories[array_rand($categories)];

            $connectionTypes = ['Fiber Optic', 'Wireless', 'VSAT', 'Lainnya'];
            $connectionType = $connectionTypes[array_rand($connectionTypes)];
            $isIntranet = mt_rand(0, 1);

            $locStmt->execute([
                "{$city['name']} - Titik " . str_pad($i, 2, '0', STR_PAD_LEFT),
                $city['officeId'],
                $status,
                $deviceCount,
                $lastSeen,
                $installationDate,
                $latitude,
                $longitude,
                $picName,
                $picContact,
                $picPosition,
                $maxBandwidth,
                $category,
                $connectionType,
                $isIntranet
            ]);

            // Add devices for this location
            $isLocOffline = $status === 'Critical';
            $isLocWarn = $status === 'Warning';

            for ($j = 1; $j <= $deviceCount; $j++) {
                $isRouter = $j === 1;
                $type = $isRouter ? 'Router' : ($j === 2 ? 'Switch' : 'Access Point');

                $devStatus = 'Online';
                if ($isLocOffline) {
                    $devStatus = (mt_rand() / mt_getrandmax() > 0.3) ? 'Offline' : 'Warning';
                } elseif ($isLocWarn) {
                    $devStatus = (mt_rand() / mt_getrandmax() > 0.5) ? 'Warning' : 'Online';
                } else {
                    $devStatus = (mt_rand() / mt_getrandmax() > 0.95) ? 'Warning' : 'Online';
                }

                $ipThird = 10 + $city['officeId'];
                $ipFourth = $locId * 4 + $j;
                $ipAddress = "192.168.$ipThird.$ipFourth";

                $verMajor = mt_rand(1, 3);
                $verMinor = mt_rand(0, 5);
                $verPatch = mt_rand(0, 9);
                $firmware = "v$verMajor.$verMinor.$verPatch";

                $cpu = $devStatus === 'Online' ? mt_rand(20, 65) : ($devStatus === 'Warning' ? mt_rand(80, 99) : 0);
                $ram = $devStatus === 'Online' ? mt_rand(40, 70) : ($devStatus === 'Warning' ? mt_rand(85, 99) : 0);

                $bandwidthIn = 0;
                $bandwidthOut = 0;
                if ($devStatus === 'Online') {
                    $exceed = (mt_rand() / mt_getrandmax() > 0.85);
                    $ratio = $exceed ? (1.05 + (mt_rand() / mt_getrandmax() * 0.2)) : (0.4 + (mt_rand() / mt_getrandmax() * 0.45));
                    $totalUsage = $maxBandwidth * $ratio;
                    $bandwidthIn = round($totalUsage * 0.7, 1);
                    $bandwidthOut = round($totalUsage * 0.3, 1);
                }

                $uptime = $devStatus === 'Offline' ? '0h 0m' : mt_rand(5, 50) . 'hari ' . mt_rand(0, 23) . 'jam';

                $interfaces = [
                    ['name' => 'WAN', 'status' => $devStatus === 'Offline' ? 'Down' : 'Up', 'speed' => '1 Gbps', 'traffic' => 'Sedang'],
                    ['name' => 'LAN1', 'status' => $devStatus === 'Offline' ? 'Down' : 'Up', 'speed' => '1 Gbps', 'traffic' => 'Rendah']
                ];

                $devStmt->execute([
                    "{$type}-" . str_pad($j, 2, '0', STR_PAD_LEFT),
                    $type,
                    $locId,
                    $city['officeId'],
                    $devStatus,
                    $ipAddress,
                    $firmware,
                    $uptime,
                    $cpu,
                    $ram,
                    $bandwidthIn,
                    $bandwidthOut,
                    json_encode($interfaces)
                ]);
                $devId++;
            }
            $locId++;
        }
    }
    echo "Locations and Devices seeded.\n";

    // 7. Seed Spare Parts
    $spareparts = [
        ['Konektor RJ45 Cat6 (Box)', 'Konektor', 'Gudang Utama Jakarta', 12, 3, 'Tersedia'],
        ['Kabel UTP Cat6 Rol (305m)', 'Kabel', 'Gudang Utama Jakarta', 8, 2, 'Tersedia'],
        ['SFP Transceiver 10G Multi-mode', 'Modul SFP', 'Gudang Surabaya', 2, 3, 'Menipis'],
        ['Core Router Board v2', 'Suku Cadang Inti', 'Gudang Surabaya', 1, 1, 'Menipis'],
        ['UPS Battery Pack 12V 9Ah', 'Catu Daya', 'Gudang Bandung', 0, 2, 'Habis'],
        ['Access Point Bracket Mount', 'Aksesori', 'Gudang Makassar', 25, 5, 'Tersedia']
    ];
    $partStmt = $pdo->prepare("INSERT INTO spareparts (name, type, location_storage, stock, threshold, status) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($spareparts as $sp) {
        $partStmt->execute($sp);
    }
    echo "Spare parts seeded.\n";

    // 8. Seed Spare Part Usage
    $pdo->exec("INSERT INTO sparepart_usage (id, maintenance_id, sparepart_id, quantity_used, date, location_id) VALUES 
        ('USG-2001', 'MNT-100', 5, 2, '2026-06-20', 2)
    ");
    echo "Spare part usage seeded.\n";

    // 9. Seed Histories
    $pdo->exec("INSERT INTO technician_history (location_id, name, date, action) VALUES 
        (1, 'Budi Utomo', '2026-05-10', 'Perbaikan Koneksi Fiber Optic Backbone'),
        (2, 'Ferry (Teknisi)', '2026-06-20', 'Penggantian Sel Baterai UPS Mati'),
        (3, 'Hasan Basri', '2026-04-12', 'Konfigurasi IP & Port Security Switch'),
        (4, 'Andi Tech Support', '2026-06-15', 'Pemeriksaan Jalur Distribusi AP')
    ");
    $pdo->exec("INSERT INTO device_history (location_id, device_name, date, action, technician) VALUES 
        (1, 'Router-01', '2026-01-15', 'Instalasi Perangkat Utama Baru', 'Budi Utomo'),
        (2, 'UPS Battery Pack', '2026-06-20', 'Pergantian Cadangan Daya UPS', 'Ferry (Teknisi)'),
        (3, 'Switch-01', '2026-03-22', 'Penggantian Port Terbakar Induksi Petir', 'Siti Aminah')
    ");
    echo "Histories seeded.\n";

    // 10. Seed Incidents
    // Get location 1 and 2 details to map devices correctly
    $incidents = [
        [
            'id' => 'INC-1001',
            'severity' => 'Critical',
            'title' => 'Kegagalan Koneksi Router Utama Jakarta - Titik 01',
            'location_id' => 1,
            'status' => 'open',
            'timestamp' => date('Y-m-d H:i:s', strtotime('-15 minutes')),
            'assigned_to' => null,
            'sla_target' => '2 Jam',
            'device_id' => 1,
            'notes' => json_encode([]),
            'timeline' => json_encode([
                ['text' => 'Tiket otomatis dibuat oleh sistem pemantauan.', 'time' => date('Y-m-d H:i:s', strtotime('-15 minutes'))]
            ])
        ]
    ];
    
    $incStmt = $pdo->prepare("INSERT INTO incidents (id, severity, title, location_id, status, timestamp, assigned_to, sla_target, device_id, notes, timeline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($incidents as $inc) {
        $incStmt->execute([
            $inc['id'],
            $inc['severity'],
            $inc['title'],
            $inc['location_id'],
            $inc['status'],
            $inc['timestamp'],
            $inc['assigned_to'],
            $inc['sla_target'],
            $inc['device_id'],
            $inc['notes'],
            $inc['timeline']
        ]);
    }
    echo "Incidents seeded.\n";

    // 11. Seed Maintenance schedule
    $pdo->exec("INSERT INTO maintenance (id, title, location_id, device_id, scheduled_date, performed_by, status, actions_taken, outcome, photo_url, signature_url, completed_date) VALUES 
        ('MNT-100', 'Pergantian Baterai UPS Cadangan', 2, 4, '2026-06-20', 'Ferry (Teknisi)', 'Completed', 'Melakukan pengecekan daya UPS dan mengganti baterai pack yang soak dengan UPS Battery Pack 12V 9Ah yang baru.', 'UPS kembali normal dan dapat menahan daya cadangan selama 45 menit saat simulasi pemadaman.', '/uploads/photos/ups_maintenance.jpg', '/uploads/signatures/ferry_sign.png', '2026-06-20'),
        ('MNT-101', 'Peningkatan Firmware Berkala', 3, NULL, '" . date('Y-m-d', strtotime('+3 days')) . "', 'Siti Aminah', 'Scheduled', NULL, NULL, NULL, NULL, NULL)
    ");
    echo "Maintenance scheduled seeded.\n";

    echo "Seeding completed successfully.\n";

} catch (\PDOException $e) {
    echo "Error seeding database: " . $e->getMessage() . "\n";
}
?>
