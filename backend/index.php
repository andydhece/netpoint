<?php
// backend/index.php

// CORS Headers
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Session configuration for cross-origin local development
ini_set('session.cookie_samesite', 'Lax');
session_start();

// Auto-seed database if needed on first run
try {
    require_once __DIR__ . '/database/seeder.php';
} catch (Exception $e) {
    // Keep running but log error
    error_log("Seeding failed: " . $e->getMessage());
}

// Get the requested path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Helper function to return JSON response
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Router
if (preg_match('/^\/api\/init(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/init.php';
} elseif (preg_match('/^\/api\/auth(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/auth.php';
} elseif (preg_match('/^\/api\/offices(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/offices.php';
} elseif (preg_match('/^\/api\/locations(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/locations.php';
} elseif (preg_match('/^\/api\/devices(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/devices.php';
} elseif (preg_match('/^\/api\/incidents(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/incidents.php';
} elseif (preg_match('/^\/api\/maintenance(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/maintenance.php';
} elseif (preg_match('/^\/api\/spareparts(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/spareparts.php';
} elseif (preg_match('/^\/api\/users(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/users.php';
} elseif (preg_match('/^\/api\/device_types(\.php)?$/', $uri)) {
    require_once __DIR__ . '/api/device_types.php';
} else {
    jsonResponse(['error' => 'Endpoint not found', 'uri' => $uri], 404);
}
?>
