CREATE DATABASE IF NOT EXISTS netpoint;
USE netpoint;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    office_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OK',
    device_count INT NOT NULL DEFAULT 0,
    last_seen VARCHAR(50) NOT NULL DEFAULT '1m lalu',
    installation_date DATE NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    pic_name VARCHAR(255) NOT NULL,
    pic_contact VARCHAR(100) NOT NULL,
    pic_position VARCHAR(100) NOT NULL,
    max_bandwidth_mbps INT NOT NULL DEFAULT 100,
    FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location_id INT NOT NULL,
    office_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Online',
    ip_address VARCHAR(45) NOT NULL,
    firmware VARCHAR(50) NOT NULL,
    uptime VARCHAR(100) NOT NULL DEFAULT '0h 0m',
    cpu_usage INT NOT NULL DEFAULT 0,
    ram_usage INT NOT NULL DEFAULT 0,
    bandwidth_in FLOAT NOT NULL DEFAULT 0.0,
    bandwidth_out FLOAT NOT NULL DEFAULT 0.0,
    interfaces JSON NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spareparts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location_storage VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    threshold INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Tersedia'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sparepart_usage (
    id VARCHAR(100) PRIMARY KEY,
    maintenance_id VARCHAR(100) NOT NULL,
    sparepart_id INT NOT NULL,
    quantity_used INT NOT NULL,
    date DATE NOT NULL,
    location_id INT NOT NULL,
    FOREIGN KEY (sparepart_id) REFERENCES spareparts(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technician_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    action VARCHAR(255) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS device_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    action VARCHAR(255) NOT NULL,
    technician VARCHAR(255) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(100) PRIMARY KEY,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    timestamp DATETIME NOT NULL,
    assigned_to VARCHAR(255) NULL,
    sla_target VARCHAR(100) NOT NULL,
    device_id INT NULL,
    notes JSON NOT NULL,
    timeline JSON NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location_id INT NOT NULL,
    device_id INT NULL,
    scheduled_date DATE NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    actions_taken TEXT NULL,
    outcome TEXT NULL,
    photo_url VARCHAR(255) NULL,
    signature_url VARCHAR(255) NULL,
    completed_date DATE NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS device_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
