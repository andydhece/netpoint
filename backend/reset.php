<?php
// backend/reset.php
$host = 'db';
$user = 'netpoint_user';
$pass = 'netpoint_pass';
$pdo = new PDO("mysql:host=$host", $user, $pass);
$pdo->exec("DROP DATABASE IF EXISTS netpoint; CREATE DATABASE netpoint;");
echo "Database netpoint recreated.\n";
?>
