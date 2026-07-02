<?php
// backend/api/device_types.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'add') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        if (!$name) {
            jsonResponse(['error' => 'Nama tipe perangkat tidak boleh kosong'], 400);
        }

        // Check if exists
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM device_types WHERE name = ?");
        $checkStmt->execute([$name]);
        if ($checkStmt->fetchColumn() > 0) {
            jsonResponse(['error' => 'Tipe perangkat sudah terdaftar'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO device_types (name) VALUES (?)");
        $stmt->execute([$name]);

        jsonResponse(['success' => true]);
    } elseif ($action === 'delete') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        if (!$name) {
            jsonResponse(['error' => 'Nama tipe perangkat wajib diisi'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM device_types WHERE name = ?");
        $stmt->execute([$name]);

        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
