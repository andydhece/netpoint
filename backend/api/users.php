<?php
// backend/api/users.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'add') {
        $name = isset($input['name']) ? trim($input['name']) : '';
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        $role = isset($input['role']) ? trim($input['role']) : 'teknisi';
        $avatar = isset($input['avatar']) ? trim($input['avatar']) : '';

        if (!$name || !$username || !$password) {
            jsonResponse(['error' => 'Nama, username, dan password wajib diisi'], 400);
        }

        // Check if username unique
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $checkStmt->execute([$username]);
        if ($checkStmt->fetchColumn() > 0) {
            jsonResponse(['error' => 'Username sudah digunakan'], 400);
        }

        if (!$avatar) {
            $avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face';
        }

        $stmt = $pdo->prepare("INSERT INTO users (name, username, password, role, avatar) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $username, $password, $role, $avatar]);
        $newId = (int)$pdo->lastInsertId();

        jsonResponse([
            'success' => true,
            'user' => [
                'id' => $newId,
                'name' => $name,
                'username' => $username,
                'role' => $role,
                'avatar' => $avatar
            ]
        ]);
    } elseif ($action === 'edit') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $username = isset($input['username']) ? trim($input['username']) : '';
        $role = isset($input['role']) ? trim($input['role']) : '';
        $avatar = isset($input['avatar']) ? trim($input['avatar']) : '';

        if (!$id || !$name || !$username || !$role) {
            jsonResponse(['error' => 'Data tidak lengkap untuk edit user'], 400);
        }

        // Check if username unique for other users
        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? AND id != ?");
        $checkStmt->execute([$username, $id]);
        if ($checkStmt->fetchColumn() > 0) {
            jsonResponse(['error' => 'Username sudah digunakan'], 400);
        }

        // Optional password update
        if (isset($input['password']) && !empty($input['password'])) {
            $password = $input['password'];
            $stmt = $pdo->prepare("UPDATE users SET name = ?, username = ?, role = ?, avatar = ?, password = ? WHERE id = ?");
            $stmt->execute([$name, $username, $role, $avatar, $password, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET name = ?, username = ?, role = ?, avatar = ? WHERE id = ?");
            $stmt->execute([$name, $username, $role, $avatar, $id]);
        }

        jsonResponse(['success' => true]);
    } elseif ($action === 'delete') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if (!$id) {
            jsonResponse(['error' => 'ID user wajib diisi'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
