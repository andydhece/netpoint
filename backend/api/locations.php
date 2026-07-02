<?php
// backend/api/locations.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'add') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        $officeId = isset($input['officeId']) ? (int)$input['officeId'] : 0;
        $installationDate = isset($input['installationDate']) ? $input['installationDate'] : date('Y-m-d');
        $latitude = isset($input['latitude']) ? (float)$input['latitude'] : 0.0;
        $longitude = isset($input['longitude']) ? (float)$input['longitude'] : 0.0;
        $picName = isset($input['picName']) ? trim($input['picName']) : '';
        $picContact = isset($input['picContact']) ? trim($input['picContact']) : '';
        $picPosition = isset($input['picPosition']) ? trim($input['picPosition']) : '';
        $maxBandwidth = isset($input['max_bandwidth_mbps']) ? (int)$input['max_bandwidth_mbps'] : 100;
        $category = isset($input['category']) ? trim($input['category']) : 'Perangkat Daerah';
        $connectionType = isset($input['connection_type']) ? trim($input['connection_type']) : 'Fiber Optic';
        $isIntranet = isset($input['is_intranet']) ? (int)$input['is_intranet'] : 0;
        
        $status = 'OK';
        $deviceCount = 0;
        $lastSeen = 'Baru terpasang';

        if (!$name || !$officeId) {
            jsonResponse(['error' => 'Nama dan Kantor Wilayah harus diisi'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO locations (name, office_id, status, device_count, last_seen, installation_date, latitude, longitude, pic_name, pic_contact, pic_position, max_bandwidth_mbps, category, connection_type, is_intranet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $name, $officeId, $status, $deviceCount, $lastSeen, $installationDate, 
            $latitude, $longitude, $picName, $picContact, $picPosition, $maxBandwidth, $category, $connectionType, $isIntranet
        ]);
        
        $newId = (int)$pdo->lastInsertId();

        jsonResponse([
            'success' => true,
            'location' => [
                'id' => $newId,
                'name' => $name,
                'officeId' => $officeId,
                'status' => $status,
                'deviceCount' => $deviceCount,
                'lastSeen' => $lastSeen,
                'installationDate' => $installationDate,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'picName' => $picName,
                'picContact' => $picContact,
                'picPosition' => $picPosition,
                'max_bandwidth_mbps' => $maxBandwidth,
                'category' => $category,
                'connection_type' => $connectionType,
                'is_intranet' => $isIntranet
            ]
        ]);
    } elseif ($action === 'edit') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $officeId = isset($input['officeId']) ? (int)$input['officeId'] : 0;
        $installationDate = isset($input['installationDate']) ? $input['installationDate'] : '';
        $latitude = isset($input['latitude']) ? (float)$input['latitude'] : 0.0;
        $longitude = isset($input['longitude']) ? (float)$input['longitude'] : 0.0;
        $picName = isset($input['picName']) ? trim($input['picName']) : '';
        $picContact = isset($input['picContact']) ? trim($input['picContact']) : '';
        $picPosition = isset($input['picPosition']) ? trim($input['picPosition']) : '';
        $maxBandwidth = isset($input['max_bandwidth_mbps']) ? (int)$input['max_bandwidth_mbps'] : 100;
        $category = isset($input['category']) ? trim($input['category']) : 'Perangkat Daerah';
        $connectionType = isset($input['connection_type']) ? trim($input['connection_type']) : 'Fiber Optic';
        $isIntranet = isset($input['is_intranet']) ? (int)$input['is_intranet'] : 0;

        if (!$id || !$name || !$officeId) {
            jsonResponse(['error' => 'ID, Nama, dan Kantor Wilayah harus diisi'], 400);
        }

        $stmt = $pdo->prepare("UPDATE locations SET name = ?, office_id = ?, installation_date = ?, latitude = ?, longitude = ?, pic_name = ?, pic_contact = ?, pic_position = ?, max_bandwidth_mbps = ?, category = ?, connection_type = ?, is_intranet = ? WHERE id = ?");
        $stmt->execute([
            $name, $officeId, $installationDate, $latitude, $longitude, 
            $picName, $picContact, $picPosition, $maxBandwidth, $category, $connectionType, $isIntranet, $id
        ]);

        jsonResponse(['success' => true]);
    } elseif ($action === 'delete') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            jsonResponse(['error' => 'ID lokasi harus diisi'], 400);
        }
        $stmt = $pdo->prepare("DELETE FROM locations WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
