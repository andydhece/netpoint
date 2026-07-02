<?php
// backend/api/maintenance.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to save base64 image
function saveBase64Image($base64String, $subfolder) {
    if (strpos($base64String, 'data:image/') !== 0) {
        return $base64String;
    }
    
    preg_match('/^data:image\/(\w+);base64,/', $base64String, $type);
    $data = substr($base64String, strpos($base64String, ',') + 1);
    $data = base64_decode($data);
    
    if ($data === false) {
        return null;
    }
    
    $ext = isset($type[1]) ? $type[1] : 'png';
    $filename = uniqid('mnt_', true) . '.' . $ext;
    
    $relPath = '/uploads/' . $subfolder . '/' . $filename;
    $absPath = __DIR__ . '/../uploads/' . $subfolder . '/' . $filename;
    
    if (!is_dir(dirname($absPath))) {
        mkdir(dirname($absPath), 0777, true);
    }
    
    file_put_contents($absPath, $data);
    return $relPath;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'schedule') {
        $title = isset($input['title']) ? trim($input['title']) : 'Pemeliharaan Rutin';
        $locationId = isset($input['locationId']) ? (int)$input['locationId'] : 0;
        $deviceId = isset($input['deviceId']) && $input['deviceId'] ? (int)$input['deviceId'] : null;
        $scheduledDate = isset($input['scheduledDate']) ? $input['scheduledDate'] : date('Y-m-d');
        $performedBy = isset($input['performedBy']) ? trim($input['performedBy']) : '';

        if (!$locationId || !$performedBy) {
            jsonResponse(['error' => 'Lokasi dan penanggung jawab wajib diisi'], 400);
        }

        $id = 'MNT-' . mt_rand(1000, 9999);

        $stmt = $pdo->prepare("INSERT INTO maintenance (id, title, location_id, device_id, scheduled_date, performed_by, status, actions_taken, outcome, photo_url, signature_url, completed_date) VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', NULL, NULL, NULL, NULL, NULL)");
        $stmt->execute([$id, $title, $locationId, $deviceId, $scheduledDate, $performedBy]);

        jsonResponse([
            'success' => true,
            'maintenance' => [
                'id' => $id,
                'title' => $title,
                'locationId' => $locationId,
                'deviceId' => $deviceId,
                'scheduledDate' => $scheduledDate,
                'performedBy' => $performedBy,
                'status' => 'Scheduled',
                'actionsTaken' => '',
                'outcome' => '',
                'photoUrl' => '',
                'signatureUrl' => '',
                'completedDate' => ''
            ]
        ]);
    } elseif ($action === 'complete') {
        $id = isset($input['id']) ? trim($input['id']) : '';
        $performedBy = isset($input['performedBy']) ? trim($input['performedBy']) : '';
        $actionsTaken = isset($input['actionsTaken']) ? trim($input['actionsTaken']) : '';
        $outcome = isset($input['outcome']) ? trim($input['outcome']) : '';
        $photoRaw = isset($input['photoUrl']) ? $input['photoUrl'] : '';
        $signatureRaw = isset($input['signatureUrl']) ? $input['signatureUrl'] : '';
        
        $sparepartId = isset($input['sparepartId']) && $input['sparepartId'] ? (int)$input['sparepartId'] : null;
        $sparepartQty = isset($input['sparepartQty']) && $input['sparepartQty'] ? (int)$input['sparepartQty'] : 0;

        if (!$id || !$performedBy || !$actionsTaken || !$outcome) {
            jsonResponse(['error' => 'Laporan audit harus diisi lengkap'], 400);
        }

        // Get existing scheduled maintenance
        $stmt = $pdo->prepare("SELECT * FROM maintenance WHERE id = ?");
        $stmt->execute([$id]);
        $mnt = $stmt->fetch();
        if (!$mnt) {
            jsonResponse(['error' => 'Data jadwal pemeliharaan tidak ditemukan'], 404);
        }

        // Save uploaded files
        $photoUrl = saveBase64Image($photoRaw, 'photos');
        $signatureUrl = saveBase64Image($signatureRaw, 'signatures');
        $completedDate = date('Y-m-d');

        // Update maintenance
        $stmt = $pdo->prepare("UPDATE maintenance SET status = 'Completed', performed_by = ?, actions_taken = ?, outcome = ?, photo_url = ?, signature_url = ?, completed_date = ? WHERE id = ?");
        $stmt->execute([$performedBy, $actionsTaken, $outcome, $photoUrl, $signatureUrl, $completedDate, $id]);

        // Decrement spare part if applicable
        if ($sparepartId && $sparepartQty > 0) {
            // Update stock and status dynamically
            $spUpdate = $pdo->prepare("
                UPDATE spareparts 
                SET stock = GREATEST(0, stock - :qty),
                    status = CASE 
                               WHEN GREATEST(0, stock - :qty) = 0 THEN 'Habis' 
                               WHEN GREATEST(0, stock - :qty) <= threshold THEN 'Menipis' 
                               ELSE 'Tersedia' 
                             END 
                WHERE id = :id
            ");
            $spUpdate->execute(['qty' => $sparepartQty, 'id' => $sparepartId]);

            // Log spare part usage transaction
            $usageId = 'USG-' . mt_rand(1000, 9999);
            $usageStmt = $pdo->prepare("INSERT INTO sparepart_usage (id, maintenance_id, sparepart_id, quantity_used, date, location_id) VALUES (?, ?, ?, ?, ?, ?)");
            $usageStmt->execute([$usageId, $id, $sparepartId, $sparepartQty, $completedDate, $mnt['location_id']]);
        }

        // Log technician history record
        $techStmt = $pdo->prepare("INSERT INTO technician_history (location_id, name, date, action) VALUES (?, ?, ?, ?)");
        $actionDesc = $mnt['title'] . ' - ' . mb_substr($actionsTaken, 0, 45) . '...';
        $techStmt->execute([$mnt['location_id'], $performedBy, $completedDate, $actionDesc]);

        // Log device history if title/action implies replacement/upgrade
        $lowerTitle = mb_strtolower($mnt['title']);
        $lowerActions = mb_strtolower($actionsTaken);
        if (strpos($lowerTitle, 'ganti') !== false || strpos($lowerTitle, 'pasang') !== false || 
            strpos($lowerActions, 'ganti') !== false || strpos($lowerActions, 'mengganti') !== false) {
            
            $deviceName = 'Perangkat Jaringan';
            if ($mnt['device_id']) {
                $devStmt = $pdo->prepare("SELECT name FROM devices WHERE id = ?");
                $devStmt->execute([$mnt['device_id']]);
                $fetchedName = $devStmt->fetchColumn();
                if ($fetchedName) {
                    $deviceName = $fetchedName;
                }
            }

            $devHistStmt = $pdo->prepare("INSERT INTO device_history (location_id, device_name, date, action, technician) VALUES (?, ?, ?, ?, ?)");
            $devHistStmt->execute([$mnt['location_id'], $deviceName, $completedDate, $mnt['title'], $performedBy]);
        }

        jsonResponse(['success' => true]);
    } elseif ($action === 'delete') {
        $id = isset($input['id']) ? trim($input['id']) : '';
        if (!$id) {
            jsonResponse(['error' => 'ID jadwal pemeliharaan wajib diisi'], 400);
        }
        $stmt = $pdo->prepare("DELETE FROM maintenance WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
