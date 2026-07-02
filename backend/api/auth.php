<?php
// backend/api/auth.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'login') {
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(['error' => 'Username tidak ditemukan.'], 400);
        }

        if ($user['password'] !== $password) {
            jsonResponse(['error' => 'Password salah.'], 400);
        }

        // Safe user without password
        unset($user['password']);
        $user['id'] = (int)$user['id'];

        $_SESSION['user'] = $user;

        jsonResponse(['success' => true, 'user' => $user]);
    } elseif ($action === 'logout') {
        unset($_SESSION['user']);
        session_destroy();
        jsonResponse(['success' => true]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'session') {
        $user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
        jsonResponse(['user' => $user]);
    }
}
jsonResponse(['error' => 'Invalid action'], 400);
?>
