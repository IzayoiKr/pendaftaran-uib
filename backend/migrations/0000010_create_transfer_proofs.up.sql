CREATE TABLE registration_tuition_fee (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id BINARY(16) NOT NULL,
    status ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    account_holder VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    amount BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    file_size_bytes INT UNSIGNED NOT NULL,
    payment_date DATE NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at DATETIME DEFAULT NULL,
    CONSTRAINT fk_registration_tuition_fee FOREIGN KEY (registration_id) 
        REFERENCES registration(id) 
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    INDEX idx_registration_tuition (registration_id) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
