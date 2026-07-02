<?php
// backend/api/devices.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'add') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        $type = isset($input['type']) ? trim($input['type']) : '';
        $locationId = isset($input['locationId']) ? (int)$input['locationId'] : 0;
        $ipAddress = isset($input['ipAddress']) ? trim($input['ipAddress']) : '';
        $firmware = isset($input['firmware']) ? trim($input['firmware']) : 'v1.0.0';

        if (!$name || !$type || !$locationId || !$ipAddress) {
            jsonResponse(['error' => 'Nama, tipe, lokasi, dan IP Address wajib diisi'], 400);
        }

        // Get office ID of the location
        $locStmt = $pdo->prepare("SELECT office_id FROM locations WHERE id = ?");
        $locStmt->execute([$locationId]);
        $officeId = $locStmt->fetchColumn();

        if (!$officeId) {
            jsonResponse(['error' => 'Lokasi tidak valid'], 400);
        }

        $interfaces = [
            ['name' => 'WAN', 'status' => 'Up', 'speed' => '1 Gbps', 'traffic' => 'Rendah'],
            ['name' => 'LAN1', 'status' => 'Up', 'speed' => '1 Gbps', 'traffic' => 'Rendah']
        ];

        $stmt = $pdo->prepare("INSERT INTO devices (name, type, location_id, office_id, status, ip_address, firmware, uptime, cpu_usage, ram_usage, bandwidth_in, bandwidth_out, interfaces) VALUES (?, ?, ?, ?, 'Online', ?, ?, '0hari 0jam', 0, 0, 0, 0, ?)");
        $stmt->execute([$name, $type, $locationId, $officeId, $ipAddress, $firmware, json_encode($interfaces)]);
        $newId = (int)$pdo->lastInsertId();

        // Increment device count in location
        $pdo->prepare("UPDATE locations SET device_count = device_count + 1 WHERE id = ?")->execute([$locationId]);

        // Insert installation device history
        $histStmt = $pdo->prepare("INSERT INTO device_history (location_id, device_name, date, action, technician) VALUES (?, ?, ?, ?, ?)");
        $techName = isset($_SESSION['user']['name']) ? $_SESSION['user']['name'] : 'System';
        $histStmt->execute([$locationId, $name, date('Y-m-d'), 'Instalasi Perangkat Baru', $techName]);

        jsonResponse([
            'success' => true,
            'device' => [
                'id' => $newId,
                'name' => $name,
                'type' => $type,
                'locationId' => $locationId,
                'officeId' => $officeId,
                'status' => 'Online',
                'ipAddress' => $ipAddress,
                'firmware' => $firmware,
                'uptime' => '0hari 0jam',
                'cpuUsage' => 0,
                'ramUsage' => 0,
                'bandwidthIn' => 0.0,
                'bandwidthOut' => 0.0,
                'interfaces' => $interfaces
            ]
        ]);
    } elseif ($action === 'edit') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $type = isset($input['type']) ? trim($input['type']) : '';
        $locationId = isset($input['locationId']) ? (int)$input['locationId'] : 0;
        $ipAddress = isset($input['ipAddress']) ? trim($input['ipAddress']) : '';
        $firmware = isset($input['firmware']) ? trim($input['firmware']) : '';
        $status = isset($input['status']) ? trim($input['status']) : 'Online';

        if (!$id || !$name || !$type || !$locationId || !$ipAddress) {
            jsonResponse(['error' => 'Data perangkat tidak lengkap'], 400);
        }

        // Get current location to check if location changed
        $currDevStmt = $pdo->prepare("SELECT location_id FROM devices WHERE id = ?");
        $currDevStmt->execute([$id]);
        $oldLocationId = (int)$currDevStmt->fetchColumn();

        // Get office ID of new location
        $locStmt = $pdo->prepare("SELECT office_id FROM locations WHERE id = ?");
        $locStmt->execute([$locationId]);
        $officeId = $locStmt->fetchColumn();

        $stmt = $pdo->prepare("UPDATE devices SET name = ?, type = ?, location_id = ?, office_id = ?, ip_address = ?, firmware = ?, status = ? WHERE id = ?");
        $stmt->execute([$name, $type, $locationId, $officeId, $ipAddress, $firmware, $status, $id]);

        if ($oldLocationId !== $locationId) {
            // Decrement old
            $pdo->prepare("UPDATE locations SET device_count = GREATEST(0, device_count - 1) WHERE id = ?")->execute([$oldLocationId]);
            // Increment new
            $pdo->prepare("UPDATE locations SET device_count = device_count + 1 WHERE id = ?")->execute([$locationId]);
            
            // Log history
            $histStmt = $pdo->prepare("INSERT INTO device_history (location_id, device_name, date, action, technician) VALUES (?, ?, ?, ?, ?)");
            $techName = isset($_SESSION['user']['name']) ? $_SESSION['user']['name'] : 'System';
            $histStmt->execute([$locationId, $name, date('Y-m-d'), 'Pemindahan Perangkat dari lokasi lama', $techName]);
        }

        jsonResponse(['success' => true]);
    } elseif ($action === 'delete') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            jsonResponse(['error' => 'ID perangkat harus diisi'], 400);
        }

        // Get location id before delete
        $devStmt = $pdo->prepare("SELECT name, location_id FROM devices WHERE id = ?");
        $devStmt->execute([$id]);
        $dev = $devStmt->fetch();

        if ($dev) {
            $locationId = (int)$dev['location_id'];
            $name = $dev['name'];

            // Decrement location device count
            $pdo->prepare("UPDATE locations SET device_count = GREATEST(0, device_count - 1) WHERE id = ?")->execute([$locationId]);

            // Log history
            $histStmt = $pdo->prepare("INSERT INTO device_history (location_id, device_name, date, action, technician) VALUES (?, ?, ?, ?, ?)");
            $techName = isset($_SESSION['user']['name']) ? $_SESSION['user']['name'] : 'System';
            $histStmt->execute([$locationId, $name, date('Y-m-d'), 'Deinstalasi / Penghapusan Perangkat', $techName]);

            // Delete device
            $pdo->prepare("DELETE FROM devices WHERE id = ?")->execute([$id]);
        }

        jsonResponse(['success' => true]);
    } elseif ($action === 'reboot') {
        $ids = isset($input['ids']) ? $input['ids'] : [];
        if (empty($ids)) {
            jsonResponse(['error' => 'Tidak ada perangkat yang dipilih'], 400);
        }

        // Simulating reboot: set uptime to "0h 1m"
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("UPDATE devices SET uptime = '0hari 0jam', cpu_usage = 10, ram_usage = 35 WHERE id IN ($placeholders)");
        $stmt->execute($ids);

        jsonResponse(['success' => true]);
    } elseif ($action === 'push_config') {
        $ids = isset($input['ids']) ? $input['ids'] : [];
        if (empty($ids)) {
            jsonResponse(['error' => 'Tidak ada perangkat yang dipilih'], 400);
        }

        // Simulating push config: log something or just return success
        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
