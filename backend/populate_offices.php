<?php
// backend/populate_offices.php
$pdo = require_once __DIR__ . '/config/database.php';

$offices = [
    "Badan Kepegawaian Dan Pengembangan Sumber Daya Manusia",
    "Badan Kesatuan Bangsa Dan Politik",
    "Badan Penanggulangan Bencana Daerah",
    "Badan Pendapatan Daerah",
    "Badan Pengelolaan Keuangan Dan Aset Daerah",
    "Badan Perencanaan Pembangunan, Riset Dan Inovasi Daerah",
    "Bagian Administrasi Pembangunan",
    "Bagian Hukum",
    "Bagian Kesejahteraan Rakyat",
    "Bagian Organisasi",
    "Bagian Pemerintahan",
    "Bagian Pengadaan Barang/Jasa",
    "Bagian Perekonomian Dan Sumber Daya Alam",
    "Bagian Protokol Dan Komunikasi Pimpinan",
    "Bagian Umum",
    "Dinas Kependudukan Dan Pencatatan Sipil",
    "Dinas Kesehatan",
    "Dinas Ketahanan Pangan Dan Peternakan",
    "Dinas Komunikasi Dan Informatika",
    "Dinas Lingkungan Hidup",
    "Dinas Pariwisata, Pemuda Dan Olah Raga",
    "Dinas Pekerjaan Umum Dan Penataan Ruang",
    "Dinas Pemberdayaan Masyarakat Dan Desa",
    "Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu",
    "Dinas Pendidikan Dan Kebudayaan",
    "Dinas Pengendalian Penduduk Dan Keluarga Berencana, Pemberdayaan Perempuan Dan Perlindungan Anak",
    "Dinas Perdagangan, Koperasi Dan Usaha Mikro",
    "Dinas Perhubungan",
    "Dinas Perpustakaan Dan Kearsipan",
    "Dinas Pertanian Dan Perikanan",
    "Dinas Perumahan Dan Kawasan Permukiman",
    "Dinas Sosial",
    "Dinas Tenaga Kerja Dan Perindustrian",
    "Inspektorat",
    "Kecamatan Balerejo",
    "Kecamatan Dagangan",
    "Kecamatan Dolopo",
    "Kecamatan Geger",
    "Kecamatan Gemarang",
    "Kecamatan Jiwan",
    "Kecamatan Kare",
    "Kecamatan Kebonsari",
    "Kecamatan Madiun",
    "Kecamatan Mejayan",
    "Kecamatan Pilangkenceng",
    "Kecamatan Saradan",
    "Kecamatan Sawahan",
    "Kecamatan Wonoasri",
    "Kecamatan Wungu",
    "Kelurahan Bangunsari (Kecamatan Dolopo)",
    "Kelurahan Bangunsari (Kecamatan Mejayan)",
    "Kelurahan Krajan (Kecamatan Mejayan)",
    "Kelurahan Mlilir (Kecamatan Dolopo)",
    "Kelurahan Munggut (Kecamatan Wungu)",
    "Kelurahan Nglames (Kecamatan Madiun)",
    "Kelurahan Pandean (Kecamatan Mejayan)",
    "Kelurahan Wungu (Kecamatan Wungu)",
    "Rumah Sakit Umum Daerah Caruban",
    "Rumah Sakit Umum Daerah Dolopo",
    "Satuan Polisi Pamong Praja Dan Pemadam Kebakaran",
    "Sekretariat DPRD"
];

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE offices");
    
    $stmt = $pdo->prepare("INSERT INTO offices (name) VALUES (?)");
    foreach ($offices as $office) {
        $stmt->execute([$office]);
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "61 Kantor Wilayah berhasil ditambahkan ke database.\n";
} catch (Exception $e) {
    echo "Gagal: " . $e->getMessage() . "\n";
}
?>
