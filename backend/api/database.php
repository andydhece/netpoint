<?php
// backend/api/database.php
$pdo = require_once __DIR__ . '/../config/database.php';
$action = isset($_GET['action']) ? $_GET['action'] : '';

$backupsDir = __DIR__ . '/../backups';
if (!file_exists($backupsDir)) {
    mkdir($backupsDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list') {
        $files = [];
        if (file_exists($backupsDir)) {
            $dir = new DirectoryIterator($backupsDir);
            foreach ($dir as $fileinfo) {
                if (!$fileinfo->isDot() && $fileinfo->getExtension() === 'sql') {
                    $files[] = [
                        'filename' => $fileinfo->getFilename(),
                        'size' => $fileinfo->getSize(),
                        'date' => date('Y-m-d H:i:s', $fileinfo->getMTime())
                    ];
                }
            }
        }
        
        // Sort files by date descending
        usort($files, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });

        jsonResponse(['backups' => $files]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if ($action === 'backup') {
        try {
            $sql = "-- NetPoint Database Backup\n";
            $sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";
            $sql .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

            // Get tables
            $tables = [];
            $result = $pdo->query("SHOW TABLES");
            while ($row = $result->fetch(PDO::FETCH_NUM)) {
                $tables[] = $row[0];
            }

            foreach ($tables as $table) {
                // Get drop and create table structure
                $sql .= "DROP TABLE IF EXISTS `$table`;\n";
                $createRes = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
                $sql .= $createRes['Create Table'] . ";\n\n";

                // Get insert data
                $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
                if (count($rows) > 0) {
                    $sql .= "INSERT INTO `$table` (";
                    $cols = array_keys($rows[0]);
                    $sql .= implode(", ", array_map(function($c) { return "`$c`"; }, $cols));
                    $sql .= ") VALUES\n";

                    $valueLines = [];
                    foreach ($rows as $row) {
                        $values = array_map(function($val) use ($pdo) {
                            if ($val === null) return 'NULL';
                            return $pdo->quote($val);
                        }, array_values($row));
                        $valueLines[] = "(" . implode(", ", $values) . ")";
                    }
                    $sql .= implode(",\n", $valueLines) . ";\n\n";
                }
            }

            $sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";

            $filename = 'backup_' . date('Ymd_His') . '.sql';
            $filepath = $backupsDir . '/' . $filename;
            file_put_contents($filepath, $sql);

            jsonResponse([
                'success' => true,
                'backup' => [
                    'filename' => $filename,
                    'size' => filesize($filepath),
                    'date' => date('Y-m-d H:i:s')
                ]
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Gagal membuat backup: ' . $e->getMessage()], 500);
        }
    } elseif ($action === 'restore') {
        $filename = isset($input['filename']) ? basename($input['filename']) : '';
        $filepath = $backupsDir . '/' . $filename;

        if (!$filename || !file_exists($filepath)) {
            jsonResponse(['error' => 'File backup tidak ditemukan'], 400);
        }

        try {
            $sqlContent = file_get_contents($filepath);
            
            // Execute restore
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
            $pdo->exec($sqlContent);
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Gagal melakukan restore: ' . $e->getMessage()], 500);
        }
    } elseif ($action === 'delete') {
        $filename = isset($input['filename']) ? basename($input['filename']) : '';
        $filepath = $backupsDir . '/' . $filename;

        if ($filename && file_exists($filepath)) {
            unlink($filepath);
            jsonResponse(['success' => true]);
        } else {
            jsonResponse(['error' => 'File tidak ditemukan'], 404);
        }
    } elseif ($action === 'upload_restore') {
        // Handle custom uploaded SQL file restore
        if (!isset($_FILES['backup_file'])) {
            jsonResponse(['error' => 'Tidak ada file yang diunggah'], 400);
        }

        $file = $_FILES['backup_file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(['error' => 'Error pengunggahan file'], 400);
        }

        try {
            $sqlContent = file_get_contents($file['tmp_name']);
            
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
            $pdo->exec($sqlContent);
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

            jsonResponse(['success' => true]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Gagal merestore file unggahan: ' . $e->getMessage()], 500);
        }
    }
}

jsonResponse(['error' => 'Invalid action'], 400);
?>
