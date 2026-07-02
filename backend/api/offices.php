<?php
// backend/api/offices.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'add') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        if (!$name) {
            jsonResponse(['error' => 'Nama kantor tidak boleh kosong'], 400);
        }
        $stmt = $pdo->prepare("INSERT INTO offices (name) VALUES (?)");
        $stmt->execute([$name]);
        $newId = (int)$pdo->lastInsertId();
        jsonResponse(['success' => true, 'id' => $newId, 'name' => $name]);
    } elseif ($action === 'edit') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = isset($input['name']) ? trim($input['name']) : '';
        if (!$id || !$name) {
            jsonResponse(['error' => 'ID dan Nama kantor harus diisi'], 400);
        }
        $stmt = $pdo->prepare("UPDATE offices SET name = ? WHERE id = ?");
        $stmt->execute([$name, $id]);
        jsonResponse(['success' => true]);
    } elseif ($action === 'delete') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            jsonResponse(['error' => 'ID kantor harus diisi'], 400);
        }
        $stmt = $pdo->prepare("DELETE FROM offices WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
