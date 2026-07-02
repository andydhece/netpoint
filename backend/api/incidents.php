<?php
// backend/api/incidents.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'create') {
        $severity = isset($input['severity']) ? trim($input['severity']) : 'High';
        $title = isset($input['title']) ? trim($input['title']) : '';
        $locationId = isset($input['locationId']) ? (int)$input['locationId'] : 0;
        $deviceId = isset($input['deviceId']) && $input['deviceId'] ? (int)$input['deviceId'] : null;

        if (!$title || !$locationId) {
            jsonResponse(['error' => 'Judul dan lokasi insiden wajib diisi'], 400);
        }

        $id = 'INC-' . mt_rand(1000, 9999);
        $timestamp = date('Y-m-d H:i:s');
        $slaTarget = $severity === 'Critical' ? '2 Jam' : ($severity === 'High' ? '4 Jam' : '24 Jam');

        $notes = [];
        $timeline = [
            ['text' => 'Tiket insiden dilaporkan secara manual.', 'time' => $timestamp]
        ];

        $stmt = $pdo->prepare("INSERT INTO incidents (id, severity, title, location_id, status, timestamp, assigned_to, sla_target, device_id, notes, timeline) VALUES (?, ?, ?, ?, 'open', ?, NULL, ?, ?, ?, ?)");
        $stmt->execute([
            $id, $severity, $title, $locationId, $timestamp, $slaTarget, $deviceId, 
            json_encode($notes), json_encode($timeline)
        ]);

        // Automatically update location status to match incident severity
        $locStatus = $severity === 'Critical' ? 'Critical' : 'Warning';
        $pdo->prepare("UPDATE locations SET status = ? WHERE id = ?")->execute([$locStatus, $locationId]);

        jsonResponse([
            'success' => true,
            'incident' => [
                'id' => $id,
                'severity' => $severity,
                'title' => $title,
                'locationId' => $locationId,
                'status' => 'open',
                'timestamp' => $timestamp,
                'assignedTo' => null,
                'slaTarget' => $slaTarget,
                'deviceId' => $deviceId,
                'notes' => $notes,
                'timeline' => $timeline
            ]
        ]);
    } else {
        $id = isset($input['id']) ? trim($input['id']) : '';
        if (!$id) {
            jsonResponse(['error' => 'ID insiden wajib diisi'], 400);
        }

        // Get current incident
        $stmt = $pdo->prepare("SELECT * FROM incidents WHERE id = ?");
        $stmt->execute([$id]);
        $inc = $stmt->fetch();
        if (!$inc) {
            jsonResponse(['error' => 'Insiden tidak ditemukan'], 404);
        }

        $notes = json_decode($inc['notes'], true);
        $timeline = json_decode($inc['timeline'], true);
        $userName = isset($_SESSION['user']['name']) ? $_SESSION['user']['name'] : 'System';

        if ($action === 'acknowledge') {
            $timeline[] = ['text' => "Tiket diterima oleh $userName.", 'time' => date('Y-m-d H:i:s')];
            $stmt = $pdo->prepare("UPDATE incidents SET status = 'in progress', assigned_to = ?, timeline = ? WHERE id = ?");
            $stmt->execute([$userName, json_encode($timeline), $id]);
            jsonResponse(['success' => true]);
        } elseif ($action === 'resolve') {
            $solution = isset($input['solution']) ? trim($input['solution']) : '';
            $notes[] = ['author' => $userName, 'text' => "SOLUSI DIAJUKAN: $solution", 'time' => date('Y-m-d H:i:s')];
            $timeline[] = ['text' => "Tiket ditandai selesai oleh $userName.", 'time' => date('Y-m-d H:i:s')];

            $stmt = $pdo->prepare("UPDATE incidents SET status = 'resolved', notes = ?, timeline = ? WHERE id = ?");
            $stmt->execute([json_encode($notes), json_encode($timeline), $id]);

            // Set location status back to OK if no other open incidents exist
            $otherOpenStmt = $pdo->prepare("SELECT COUNT(*) FROM incidents WHERE location_id = ? AND status NOT IN ('resolved', 'closed') AND id != ?");
            $otherOpenStmt->execute([$inc['location_id'], $id]);
            if ($otherOpenStmt->fetchColumn() == 0) {
                $pdo->prepare("UPDATE locations SET status = 'OK' WHERE id = ?")->execute([$inc['location_id']]);
            }

            jsonResponse(['success' => true]);
        } elseif ($action === 'add_note') {
            $text = isset($input['text']) ? trim($input['text']) : '';
            if ($text) {
                $notes[] = ['author' => $userName, 'text' => $text, 'time' => date('Y-m-d H:i:s')];
                $stmt = $pdo->prepare("UPDATE incidents SET notes = ? WHERE id = ?");
                $stmt->execute([json_encode($notes), $id]);
            }
            jsonResponse(['success' => true]);
        } elseif ($action === 'assign') {
            $assignee = isset($input['assignee']) ? trim($input['assignee']) : '';
            if ($assignee) {
                $timeline[] = ['text' => "Tiket ditugaskan ke $assignee oleh $userName.", 'time' => date('Y-m-d H:i:s')];
                $stmt = $pdo->prepare("UPDATE incidents SET status = 'assigned', assigned_to = ?, timeline = ? WHERE id = ?");
                $stmt->execute([$assignee, json_encode($timeline), $id]);
            }
            jsonResponse(['success' => true]);
        } elseif ($action === 'update_status') {
            $status = isset($input['status']) ? trim($input['status']) : '';
            if ($status) {
                $timeline[] = ['text' => "Status tiket diubah menjadi $status oleh $userName.", 'time' => date('Y-m-d H:i:s')];
                $stmt = $pdo->prepare("UPDATE incidents SET status = ?, timeline = ? WHERE id = ?");
                $stmt->execute([$status, json_encode($timeline), $id]);
            }
            jsonResponse(['success' => true]);
        } elseif ($action === 'reject') {
            $reason = isset($input['reason']) ? trim($input['reason']) : '';
            $notes[] = ['author' => $userName, 'text' => "PENOLAKAN SOLUSI: $reason", 'time' => date('Y-m-d H:i:s')];
            $timeline[] = ['text' => "Solusi tiket ditolak oleh $userName dengan alasan: $reason", 'time' => date('Y-m-d H:i:s')];

            $stmt = $pdo->prepare("UPDATE incidents SET status = 'Rejected', notes = ?, timeline = ? WHERE id = ?");
            $stmt->execute([json_encode($notes), json_encode($timeline), $id]);
            jsonResponse(['success' => true]);
        }
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
