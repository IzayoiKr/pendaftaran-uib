CREATE TABLE prodi_change_request (
    id BINARY(16) PRIMARY KEY,
    registration_id BINARY(16) NOT NULL,
    previous_program_studi_id BINARY(16) NOT NULL,
    new_program_studi_id BINARY(16) NOT NULL,
    previous_class_session VARCHAR(50) NOT NULL,
    new_class_session VARCHAR(50) NOT NULL,
    status ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prodi_change_registration FOREIGN KEY (registration_id) REFERENCES registration(id) ON DELETE CASCADE,
    CONSTRAINT fk_prodi_change_prev_ps FOREIGN KEY (previous_program_studi_id) REFERENCES program_studi(id),
    CONSTRAINT fk_prodi_change_new_ps FOREIGN KEY (new_program_studi_id) REFERENCES program_studi(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
