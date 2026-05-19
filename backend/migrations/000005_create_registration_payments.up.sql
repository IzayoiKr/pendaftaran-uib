CREATE TABLE registration_payments (
    id BINARY(16) NOT NULL PRIMARY KEY,
    registration_id CHAR(36) NOT NULL,
    registration_type ENUM('S1', 'S2') NOT NULL,
    pemilik_rekening VARCHAR(255) NOT NULL,
    bank VARCHAR(100) NOT NULL,
    bukti_bayar_path VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Masih dalam pemeriksaan',
    validation_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reg_id (registration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
