<?php
// backend/truncate.php
$pdo = require_once __DIR__ . '/config/database.php';

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    
    $tables = [
        'incidents',
        'maintenance',
        'sparepart_usage',
        'technician_history',
        'device_history',
        'devices',
        'locations',
        'offices',
        'device_types',
        'spareparts'
    ];
    
    foreach ($tables as $table) {
        $pdo->exec("TRUNCATE TABLE `$table` ");
        echo "Tabel `$table` berhasil dikosongkan.\n";
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "Seluruh isi database telah dikosongkan kecuali tabel users.\n";
} catch (Exception $e) {
    echo "Gagal mengosongkan database: " . $e->getMessage() . "\n";
}
?>
