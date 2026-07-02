<?php
// backend/api/spareparts.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'restock') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $amount = isset($input['amount']) ? (int)$input['amount'] : 0;

        if (!$id || $amount <= 0) {
            jsonResponse(['error' => 'ID dan jumlah pasokan stok harus valid'], 400);
        }

        // Update stock and status dynamically
        $stmt = $pdo->prepare("
            UPDATE spareparts 
            SET stock = stock + :amount,
                status = CASE 
                           WHEN (stock + :amount) = 0 THEN 'Habis'
                           WHEN (stock + :amount) <= threshold THEN 'Menipis'
                           ELSE 'Tersedia'
                         END
            WHERE id = :id
        ");
        $stmt->execute(['amount' => $amount, 'id' => $id]);

        // Log negative usage to represent restock (matching frontend pattern)
        $restockId = 'RESTOCK-' . mt_rand(1000, 9999);
        $usageStmt = $pdo->prepare("INSERT INTO sparepart_usage (id, maintenance_id, sparepart_id, quantity_used, date, location_id) VALUES (?, 'Pemasokan Stok', ?, ?, ?, 1)");
        $usageStmt->execute([$restockId, $id, -$amount, date('Y-m-d')]);

        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
