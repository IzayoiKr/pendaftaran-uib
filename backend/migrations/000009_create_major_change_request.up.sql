CREATE TABLE major_change_request (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    registration_id BINARY(16) NOT NULL,
    old_program_studi_id BINARY(16) NOT NULL,
    new_program_studi_id BINARY(16) NOT NULL,
    old_session ENUM('PAGI', 'MALAM') NOT NULL,
    new_session ENUM('PAGI', 'MALAM') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prodi_change_registration FOREIGN KEY (registration_id)
        REFERENCES registration(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_prodi_change_prev_ps FOREIGN KEY (old_program_studi_id)
        REFERENCES program_studi(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_prodi_change_new_ps FOREIGN KEY (new_program_studi_id)
        REFERENCES program_studi(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
