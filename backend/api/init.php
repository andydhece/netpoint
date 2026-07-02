<?php
// backend/api/init.php
$pdo = require_once __DIR__ . '/../config/database.php';

// Fetch tables
$offices = $pdo->query("SELECT * FROM offices")->fetchAll();
$locations = $pdo->query("SELECT * FROM locations")->fetchAll();
$devices = $pdo->query("SELECT * FROM devices")->fetchAll();
$spareparts = $pdo->query("SELECT * FROM spareparts")->fetchAll();
$sparepartUsage = $pdo->query("SELECT * FROM sparepart_usage")->fetchAll();
$technicianHistory = $pdo->query("SELECT * FROM technician_history")->fetchAll();
$deviceHistory = $pdo->query("SELECT * FROM device_history")->fetchAll();
$incidents = $pdo->query("SELECT * FROM incidents")->fetchAll();
$maintenance = $pdo->query("SELECT * FROM maintenance")->fetchAll();
$users = $pdo->query("SELECT * FROM users")->fetchAll();
$deviceTypes = $pdo->query("SELECT name FROM device_types")->fetchAll(PDO::FETCH_COLUMN);

// Format numeric and JSON columns
foreach ($locations as &$loc) {
    $loc['id'] = (int)$loc['id'];
    $loc['officeId'] = (int)$loc['office_id'];
    unset($loc['office_id']);
    $loc['deviceCount'] = (int)$loc['device_count'];
    unset($loc['device_count']);
    $loc['latitude'] = (float)$loc['latitude'];
    $loc['longitude'] = (float)$loc['longitude'];
    $loc['max_bandwidth_mbps'] = (int)$loc['max_bandwidth_mbps'];
}

foreach ($devices as &$dev) {
    $dev['id'] = (int)$dev['id'];
    $dev['locationId'] = (int)$dev['location_id'];
    unset($dev['location_id']);
    $dev['officeId'] = (int)$dev['office_id'];
    unset($dev['office_id']);
    $dev['cpuUsage'] = (int)$dev['cpu_usage'];
    unset($dev['cpu_usage']);
    $dev['ramUsage'] = (int)$dev['ram_usage'];
    unset($dev['ram_usage']);
    $dev['bandwidthIn'] = (float)$dev['bandwidth_in'];
    unset($dev['bandwidth_in']);
    $dev['bandwidthOut'] = (float)$dev['bandwidth_out'];
    unset($dev['bandwidth_out']);
    $dev['interfaces'] = json_decode($dev['interfaces'], true);
}

foreach ($spareparts as &$sp) {
    $sp['id'] = (int)$sp['id'];
    $sp['stock'] = (int)$sp['stock'];
    $sp['threshold'] = (int)$sp['threshold'];
}

foreach ($sparepartUsage as &$su) {
    $su['sparepartId'] = (int)$su['sparepart_id'];
    unset($su['sparepart_id']);
    $su['quantityUsed'] = (int)$su['quantity_used'];
    unset($su['quantity_used']);
    $su['locationId'] = (int)$su['location_id'];
    unset($su['location_id']);
}

foreach ($technicianHistory as &$th) {
    $th['locationId'] = (int)$th['location_id'];
    unset($th['location_id']);
}

foreach ($deviceHistory as &$dh) {
    $dh['locationId'] = (int)$dh['location_id'];
    unset($dh['location_id']);
}

foreach ($incidents as &$inc) {
    $inc['locationId'] = (int)$inc['location_id'];
    unset($inc['location_id']);
    $inc['deviceId'] = $inc['device_id'] ? (int)$inc['device_id'] : null;
    unset($inc['device_id']);
    $inc['notes'] = json_decode($inc['notes'], true);
    $inc['timeline'] = json_decode($inc['timeline'], true);
}

foreach ($maintenance as &$mnt) {
    $mnt['locationId'] = (int)$mnt['location_id'];
    unset($mnt['location_id']);
}

foreach ($users as &$u) {
    $u['id'] = (int)$u['id'];
    unset($u['password']);
}

$currentUser = isset($_SESSION['user']) ? $_SESSION['user'] : null;

jsonResponse([
    'offices' => $offices,
    'locations' => $locations,
    'devices' => $devices,
    'spareparts' => $spareparts,
    'sparepartUsage' => $sparepartUsage,
    'technicianHistory' => $technicianHistory,
    'deviceHistory' => $deviceHistory,
    'incidents' => $incidents,
    'maintenance' => $maintenance,
    'users' => $users,
    'deviceTypes' => $deviceTypes,
    'currentUser' => $currentUser
]);
?>
