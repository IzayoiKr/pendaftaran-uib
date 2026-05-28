CREATE TABLE registration_document (
    registration_id BINARY(16) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    file_size_bytes INT UNSIGNED NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (registration_id, document_type),
    CONSTRAINT fk_registration_document FOREIGN KEY(registration_id)
        REFERENCES registration(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_payment (
    registration_id BINARY(16) PRIMARY KEY,
    account_holder VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    file_size_bytes INT UNSIGNED NOT NULL,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registration_payment FOREIGN KEY(registration_id)
        REFERENCES registration(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
